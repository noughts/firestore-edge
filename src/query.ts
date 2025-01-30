import { getAccessToken } from "./auth";
import type { FieldFilter, FieldFilterOperator, Filter, RunQueryResponse, StructuredQuery } from "./rest-api-types";
import type { Firestore, Query } from "./types";



export type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';



/**
 * Firestoreのクエリ演算子をREST API用にマッピングします。
 * @param op クエリ演算子（例: '==', '>', etc.）
 */
export const mapOperator = (op: WhereFilterOp): FieldFilterOperator => {
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



export function addFilterToQuery(query: Query, constraint: Filter): Query {
    if ("fieldFilter" in constraint) {
        return addFieldFilterToQuery(query, constraint);
    }
    return query;
}

function addFieldFilterToQuery(query: Query, constraint: FieldFilter): Query {
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



export async function runQuery(firestore: Firestore, structuredQuery: StructuredQuery): Promise<RunQueryResponse> {
    const url = `https://firestore.googleapis.com/v1/projects/${firestore.projectId}/databases/%28default%29/documents:runQuery`;
    const accessToken = await getAccessToken(firestore);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ structuredQuery }),
    });
    const data: RunQueryResponse = await response.json();
    if (response.status == 200) {
        return data;
    } else {
        throw new Error(JSON.stringify(data, null, 2));
    }
};

