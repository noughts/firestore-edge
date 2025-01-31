import { getAccessToken } from "./auth";
import { batchWriteRaw, type Write } from "./batch";
import { addFilterToQuery, mapOperator, runQuery, type WhereFilterOp } from "./query";
import type { Document, FieldFilter, Filter, Order, Value, VectorValue } from "./rest-api-types";
import type { CollectionReference, DocumentReference, DocumentSnapshot, Firestore, Query, QuerySnapshot, WithFieldValue } from "./types";
import { deserializeObject, serializeObject, serializeValue, takeLastComponentFromPathString } from "./util";




export function getFirestore(config?: Partial<Firestore>): Firestore {
    const projectId = config?.projectId ?? process.env.FIREBASE_PROJECT_ID;
    const privateKey = config?.privateKey ?? process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = config?.clientEmail ?? process.env.FIREBASE_CLIENT_EMAIL;
    if (!projectId) throw new Error('process.env["FIREBASE_PROJECT_ID"] is not set');
    if (!privateKey) throw new Error('process.env["FIREBASE_PRIVATE_KEY"] is not set');
    if (!clientEmail) throw new Error('process.env["FIREBASE_CLIENT_EMAIL"] is not set');
    return {
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
            type: "document",
            firestore: arg1,
            path: arg2,
            id,
        }
    } else {
        return {
            type: "document",
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
    const accessToken = await getAccessToken(reference.firestore);
    if (reference.firestore.profile) console.timeEnd("getAccessToken")

    const url = `https://firestore.googleapis.com/v1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    const method = "GET";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    if (reference.firestore.profile) console.time("getDoc/fetch")
    const res = await fetch(url, { method, headers });
    if (reference.firestore.profile) console.timeEnd("getDoc/fetch")
    const data: Document = await res.json();
    return {
        id: takeLastComponentFromPathString(data.name),
        fields: data.fields,
        ref: {
            type: "document",
            id: takeLastComponentFromPathString(data.name),
            path: data.name,
            firestore: reference.firestore,
        }
    };
}


export function where(fieldPath: string, opStr: WhereFilterOp, value: unknown): FieldFilter {
    return {
        fieldFilter: {
            field: { fieldPath },
            op: mapOperator(opStr),
            value: serializeValue(value),
        },
    }
}

export function orderBy(query: Query, orders: { field: string, direction: "asc" | "desc" }[]): Query {
    const orderBy: Order[] = orders.map(x => {
        return {
            field: {
                fieldPath: x.field
            },
            direction: x.direction === "asc" ? "ASCENDING" : "DESCENDING"
        }
    })
    return {
        ...query, structuredQuery: {
            ...query.structuredQuery, orderBy
        }
    }
}

export function limit(query: Query, limit: number): Query {
    return {
        ...query, structuredQuery: {
            ...query.structuredQuery, limit
        }
    }
}


export function query(baseQuery: Query, ...additionalQueries: Filter[]): Query {
    let result = baseQuery;
    additionalQueries.forEach(x => {
        result = addFilterToQuery(result, x);
    })
    return result;
}

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
                    type: "document",
                    id: takeLastComponentFromPathString(x.document.name),
                    firestore: query.firestore,
                    path: x.document.name,
                }
            }
        }),
    }
};






export function getData(snapshot: { fields: Record<string, Value> }): any {
    return deserializeObject(snapshot.fields);
}





export async function addDoc(reference: CollectionReference, data: WithFieldValue): Promise<DocumentReference> {
    const accessToken = await getAccessToken(reference.firestore);
    const url = `https://firestore.googleapis.com/v1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}`;
    const method = "POST";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(serializeObject(data));

    const res = await fetch(url, { method, headers, body });
    const json: Document = await res.json();
    return {
        type: "document",
        firestore: reference.firestore,
        path: reference.path,
        id: takeLastComponentFromPathString(json.name),
    }
}


export async function setDoc(reference: DocumentReference, data: WithFieldValue): Promise<boolean> {
    const accessToken = await getAccessToken(reference.firestore);
    const url = `https://firestore.googleapis.com/v1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    const method = "PATCH";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(serializeObject(data));
    console.dir(serializeObject(data), { depth: null })
    const res = await fetch(url, { method, headers, body });
    if (res.status === 200) return true;
    const json = await res.json();
    console.error(json);
    return false;
}



export async function batchWrite(firestore: Firestore, ...writes: Write[]) {
    const batch = {
        firestore,
        writes
    }
    return batchWriteRaw(batch.firestore, { writes: batch.writes });
}

export function setWrite(reference: DocumentReference, data: WithFieldValue): Write {
    return {
        update: {
            name: `projects/${reference.firestore.projectId}/databases/(default)/documents/${reference.path}/${reference.id}`,
            fields: serializeObject(data).fields
        }
    }
}
export function updateWrite(reference: DocumentReference, data: WithFieldValue): Write {
    return {
        update: {
            name: `projects/${reference.firestore.projectId}/databases/(default)/documents/${reference.path}/${reference.id}`,
            fields: serializeObject(data).fields
        }
    }
}
export function deleteWrite(reference: DocumentReference): Write {
    return {
        update: {
            name: `projects/${reference.firestore.projectId}/databases/(default)/documents/${reference.path}/${reference.id}`,
            fields: {}
        }
    }
}

export function vectorValue(value: number[]): any {
    return {
        mapValue: {
            fields: {
                __type__: {
                    stringValue: "__vector__"
                },
                value: {
                    arrayValue: {
                        values: value.map(x => ({ doubleValue: x.toString() })),
                    }
                },
            }
        }
    }
}