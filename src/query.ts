import { getAccessToken } from "./auth";
import type { Fields, Firestore, Query } from "./types";



export type StructuredQuery = {
    from: [{ collectionId: string }];
    where?: QueryConstraint;
    orderBy?: {
        field: { fieldPath: string };
        direction: 'ASCENDING' | 'DESCENDING'
    }[];
    limit?: number;
    findNearest?: FindNearest;
}

type FindNearest = {
    vectorField: FieldReference;
    queryVector: any;
    distanceMeasure: "EUCLIDEAN" | "COSINE" | "DOT_PRODUCT";
    limit: number;
    // distanceResultField
}

type FieldReference = {
    fieldPath: string;
}


export type QueryFieldFilterConstraint = {
    fieldFilter: {
        field: { fieldPath: string };
        op: FirestoreOperator;
        value: FirestoreValue;
    };
}

export type QueryLimitConstraint = {
    type: "limit" | "limitToLast"
    limit: number;
}

export type QueryOrderByConstraint = {
    type: "orderBy";
    direction: 'ASCENDING' | 'DESCENDING'
    fieldPath: string;
}

export type QueryCompositeFilterConstraint = {
    compositeFilter: {
        op: 'AND' | 'OR';
        filters: QueryConstraint[];
    };
}

export type QueryConstraint = QueryFieldFilterConstraint | QueryCompositeFilterConstraint | QueryLimitConstraint | QueryOrderByConstraint;
export type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
export type QueryConstraintType = 'where' | 'orderBy' | 'limit' | 'limitToLast' | 'startAt' | 'startAfter' | 'endAt' | 'endBefore';


type FirestoreOperator =
    | 'EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'ARRAY_CONTAINS'
    | 'IN'
    | 'NOT_IN'
    | 'ARRAY_CONTAINS_ANY';

interface FirestoreValue {
    stringValue?: string;
    booleanValue?: boolean;
    integerValue?: string;
    doubleValue?: number;
    // 他のフィールドタイプを必要に応じて追加
}



/**
 * Firestoreのクエリ演算子をREST API用にマッピングします。
 * @param op クエリ演算子（例: '==', '>', etc.）
 */
export const mapOperator = (op: WhereFilterOp): FirestoreOperator => {
    switch (op) {
        case '==':
            return 'EQUAL';
        case '<':
            return 'LESS_THAN';
        case '<=':
            return 'LESS_THAN_OR_EQUAL';
        case '>':
            return 'GREATER_THAN';
        case '>=':
            return 'GREATER_THAN_OR_EQUAL';
        case 'array-contains':
            return 'ARRAY_CONTAINS';
        case 'in':
            return 'IN';
        case 'not-in':
            return 'NOT_IN';
        case 'array-contains-any':
            return 'ARRAY_CONTAINS_ANY';
        default:
            throw new Error(`Unsupported operator: ${op}`);
    }
};



export function addConstraintToQuery(query: Query, constraint: QueryConstraint): Query {
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

