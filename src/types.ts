import type { StructuredQuery } from "./query";

export type Firestore = {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    profile?: boolean;
}

export type Query = {
    firestore: Firestore;
    collectionId: string;
    type: "collection" | "query"
    structuredQuery: StructuredQuery;
}

export type CollectionReference = Query & {
    type: "collection";
    path: string;
}

export type WithFieldValue = {
    [key: string]: any;
};

export type DocumentReference = {
    firestore: Firestore;
    id?: string;
    path: string;
}

export type DocumentData = {

}

export type DocumentSnapshot = {
    id: string;
    metadata?: SnapshotMetadata;
    ref: DocumentReference;
    fields: Fields;
}

export type QuerySnapshot = {
    docs: DocumentSnapshot[];
    metadata?: SnapshotMetadata;
    query: Query;
}


export type FieldValue =
    | { stringValue: string }
    | { doubleValue: number }
    | { integerValue: number }
    | { booleanValue: boolean }
    | { arrayValue: { values: FieldValue[] } }
    | { mapValue: { fields: Record<string, FieldValue> } };

export type Fields = Record<string, FieldValue>;

export type FirestoreDocument = {
    name: string;
    fields: Fields;
    createTime: string;
    updateTime: string;
}

export type DocResponse = FirestoreDocument & {
    error?: {
        code: number;
        message: string;
        status: string;
    }
}

type SnapshotMetadata = {}
