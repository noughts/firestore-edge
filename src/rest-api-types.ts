/**
 * Firestore REST API のドキュメントで定義されている型です。
 * 
 * https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery
 */


export type StructuredQuery = {
    select?: Projection;
    from: CollectionSelector[];
    where?: Filter;
    orderBy?: Order[];
    limit?: number;
    findNearest?: FindNearest;
}


export type Filter = FieldFilter | CompositeFilter | UnaryFilter;


export type Order = {
    field: FieldReference;
    direction: 'ASCENDING' | 'DESCENDING';

}

type Projection = {
    fields: FieldReference[];
}


type CollectionSelector = {
    collectionId: string;
    allDescendants?: boolean;// false の場合、親として指定されたRunQueryRequestに含まれるコレクションの直接の子のみが選択されます。true の場合、すべての子孫コレクションが選択されます。
}



type CompositeFilter = {
    compositeFilter: {
        op: 'AND' | 'OR';
        filters: Filter[];
    };
}


type UnaryFilter = {
    unaryFilter: {
        op: "IS_NAN" | "IS_NULL" | "IS_NOT_NAN" | "IS_NOT_NULL";
        field: FieldReference;
    }
}



type FieldReference = {
    fieldPath: string;
}



type FindNearest = {
    vectorField: FieldReference;
    queryVector: any;
    distanceMeasure: "EUCLIDEAN" | "COSINE" | "DOT_PRODUCT";
    limit: number;
    distanceResultField?: string;
    distanceThreshold?: number;
}

export type FieldFilter = {
    fieldFilter: {
        field: { fieldPath: string };
        op: FieldFilterOperator;
        value: Value;
    };
}



export type FieldFilterOperator =
    | 'EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'ARRAY_CONTAINS'
    | 'IN'
    | 'NOT_IN'
    | 'ARRAY_CONTAINS_ANY';



export type Value = NullValue | BooleanValue | IntegerValue | DoubleValue | TimestampValue | StringValue | BytesValue | GeoPointValue | ArrayValue | MapValue | ReferenceValue
type NullValue = { nullValue: null }
type BooleanValue = { booleanValue: boolean }
type IntegerValue = { integerValue: string }
type DoubleValue = { doubleValue: number }
type TimestampValue = { timestampValue: string }
type StringValue = { stringValue: string }
type BytesValue = { bytesValue: string }
type ReferenceValue = { referenceValue: string }
type GeoPointValue = { geoPointValue: { latitude: number, longitude: number } };
type ArrayValue = {
    arrayValue: {
        values: Value[];
    }
}
type MapValue = {
    mapValue: {
        fields: Record<string, Value>
    }
}

export type VectorValue = {
    mapValue: {
        fields: {
            __type__: {
                stringValue: "__vector__"
            },
            value: {
                arrayValue: {
                    values: { doubleValue: string }[]
                }
            },
        }
    }
}





export type RunQueryResponse = RunQueryResponseDocument[];
type RunQueryResponseDocument = {
    document: Document;
    readTime: string;
    skippedResults?: number;
}
export type Document = {
    name: string;
    fields: Record<string, Value>;
    createdTime: string;
    updateTime: string;
}
