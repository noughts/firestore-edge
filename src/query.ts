


export type StructuredQuery = {
    from: [{ collectionId: string }];
    where?: QueryConstraint;
    orderBy?: [{
        field: { fieldPath: string };
        direction: 'ASCENDING' | 'DESCENDING'
    }];
    limit?: number;
}


export type QueryFieldFilterConstraint = {
    fieldFilter: {
        field: { fieldPath: string };
        op: FirestoreOperator;
        value: FirestoreValue;
    };
}

export type QueryCompositeFilterConstraint = {
    compositeFilter: {
        op: 'AND' | 'OR';
        filters: QueryConstraint[];
    };
}

export type QueryConstraint = QueryFieldFilterConstraint | QueryCompositeFilterConstraint;
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