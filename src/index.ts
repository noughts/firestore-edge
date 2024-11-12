// import 時には .js 拡張子をつけないとコンパイル後に利用できないので注意！
import { getAccessToken } from "./auth.js";
import { mapOperator, QueryConstraint, QueryFieldFilterConstraint, QueryLimitConstraint, QueryOrderByConstraint, StructuredQuery, WhereFilterOp } from "./query.js";
import { CollectionReference, DocResponse, DocumentReference, DocumentSnapshot, Fields, Firestore, Query, QuerySnapshot, WithFieldValue } from "./types";
import { formatMap, formatValueToPost, simplifyFields } from "./util.js";
export * from './auth.js';



export function getFirestore(config?: Partial<Firestore>): Firestore {
    const projectId = config?.projectId ?? process.env.FIREBASE_PROJECT_ID;
    const privateKey = config?.privateKey ?? process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = config?.clientEmail ?? process.env.FIREBASE_CLIENT_EMAIL;
    if (!projectId) throw new Error('process.env["FIREBASE_PROJECT_ID"] is not set');
    if (!privateKey) throw new Error('process.env["FIREBASE_PRIVATE_KEY"] is not set');
    if (!clientEmail) throw new Error('process.env["FIREBASE_CLIENT_EMAIL"] is not set');
    return {
        cachedAccessToken: config?.cachedAccessToken,
        projectId,
        clientEmail,
        privateKey,
        profile: config?.profile
    }
}

export function doc(firestore: Firestore, path: string, id: string): DocumentReference;
export function doc(collection: CollectionReference, path: string): DocumentReference;

export function doc(arg1: Firestore | CollectionReference, arg2: string, id?: string): DocumentReference {
    if ("projectId" in arg1) {
        return {
            firestore: arg1,
            path: arg2,
            id,
        }
    } else {
        return {
            firestore: arg1.firestore,
            path: arg1.path,
            id: arg2,
        }
    }

}



export function collection(firestore: Firestore, path: string): CollectionReference {
    return {
        firestore,
        type: "collection",
        collectionId: path,
        path,
        structuredQuery: {
            from: [{ collectionId: path }],
        }
    }
}


export async function getDoc(reference: DocumentReference): Promise<DocumentSnapshot | undefined> {
    if (reference.firestore.profile) console.time("getAccessToken")
    const accessToken = reference.firestore.cachedAccessToken ?? await getAccessToken(reference.firestore);
    if (reference.firestore.profile) console.timeEnd("getAccessToken")

    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    const method = "GET";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    if (reference.firestore.profile) console.time("fetch")
    const res = await fetch(url, { method, headers });
    if (reference.firestore.profile) console.timeEnd("fetch")
    const data: DocResponse = await res.json();
    if (data.error) {
        return undefined;
    }
    return {
        id: takeLastComponentFromPathString(data.name),
        fields: data.fields,
        ref: {
            id: takeLastComponentFromPathString(data.name),
            path: data.name,
            firestore: reference.firestore,
        }
    };
}


export function where(fieldPath: string, opStr: WhereFilterOp, value: unknown): QueryFieldFilterConstraint {
    return {
        fieldFilter: {
            field: { fieldPath },
            op: mapOperator(opStr),
            value: formatValueToPost(value),
        },
    }
}

export function orderBy(fieldPath: string, directionStr: "asc" | "desc"): QueryOrderByConstraint {
    const direction = directionStr == "asc" ? "ASCENDING" : "DESCENDING";
    return { type: "orderBy", direction: direction, fieldPath }
}

export function limit(limit: number): QueryLimitConstraint {
    return { type: "limit", limit };
}


export function query(baseQuery: Query, ...additionalQueries: QueryConstraint[]): Query {
    let result = baseQuery;
    additionalQueries.forEach(x => {
        result = addConstraintToQuery(result, x);
    })
    return result;
}

function addConstraintToQuery(query: Query, constraint: QueryConstraint): Query {
    if ("limit" in constraint) {
        return addLimitConstraintToQuery(query, constraint);
    }
    if ("fieldFilter" in constraint) {
        return addFilterConstraintToQuery(query, constraint);
    }
    if ("direction" in constraint) {
        return addOrderConstraintToQuery(query, constraint);
    }
    return query;
}

function addFilterConstraintToQuery(query: Query, constraint: QueryFieldFilterConstraint): Query {
    let where = query.structuredQuery.where;
    if (!where) {
        where = constraint;
    } else {
        if ("compositeFilter" in where) {
            where.compositeFilter.filters.push(constraint);
        } else {
            where = {
                compositeFilter: {
                    op: "AND",
                    filters: [where, constraint],
                },
            }
        }
    }
    return {
        ...query,
        structuredQuery: {
            ...query.structuredQuery,
            where,
        }
    }
}

function addLimitConstraintToQuery(query: Query, constraint: QueryLimitConstraint): Query {
    return {
        ...query,
        structuredQuery: {
            ...query.structuredQuery,
            limit: constraint.limit
        }
    }
}

function addOrderConstraintToQuery(query: Query, constraint: QueryOrderByConstraint): Query {
    const newVal = { field: { fieldPath: constraint.fieldPath }, direction: constraint.direction };
    const orderBy = [...query.structuredQuery.orderBy ?? [], newVal];
    return {
        ...query,
        structuredQuery: {
            ...query.structuredQuery,
            orderBy
        }
    }
}

type RunQueryResponse = RunQueryResponseDocument[];
type RunQueryResponseDocument = {
    document: {
        name: string;
        fields: Fields;
        createdTime: string;
        updateTime: string;
    };
    readTime: string;
    skippedResults?: number;
}

export async function runQuery(firestore: Firestore, structuredQuery: StructuredQuery): Promise<RunQueryResponse> {
    const url = `https://firestore.googleapis.com/v1beta1/projects/${firestore.projectId}/databases/%28default%29/documents:runQuery`;
    const accessToken = await getAccessToken(firestore);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ structuredQuery }),
    });
    const data = await response.json();
    if (response.status == 200) {
        return data;
    } else {
        throw new Error(JSON.stringify(data, null, 2));
    }
};


/**
 * Firestoreからクエリ結果を取得します。
 */
export async function getDocs(query: Query): Promise<QuerySnapshot> {
    const res = await runQuery(query.firestore, query.structuredQuery);
    return {
        query,
        docs: res.map(x => {
            return {
                id: takeLastComponentFromPathString(x.document.name),
                path: x.document.name,
                fields: x.document.fields,
                ref: {
                    id: takeLastComponentFromPathString(x.document.name),
                    firestore: query.firestore,
                    path: x.document.name,
                }
            }
        }),
    }
};






export function getData(snapshot: { fields: Fields }): any {
    return simplifyFields(snapshot.fields);
}





export async function addDoc(reference: CollectionReference, data: WithFieldValue): Promise<DocumentReference> {
    const accessToken = await getAccessToken(reference.firestore);
    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}`;
    const method = "POST";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(formatMap(data));

    const res = await fetch(url, { method, headers, body });
    const json: DocResponse = await res.json();
    return {
        firestore: reference.firestore,
        path: json.name,
        id: takeLastComponentFromPathString(json.name),
    }
}

function takeLastComponentFromPathString(path: string) {
    const ary = path.split("/")
    return ary[ary.length - 1];
}

export async function setDoc(reference: DocumentReference, data: WithFieldValue): Promise<boolean> {
    const accessToken = await getAccessToken(reference.firestore);
    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    const method = "PATCH";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(formatMap(data));
    const res = await fetch(url, { method, headers, body });
    return res.status === 200;
}

