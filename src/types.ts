import type { StructuredQuery, Value } from "./rest-api-types";


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
    type: "document";
    firestore: Firestore;
    id?: string;
    path: string;
}


export type DocumentSnapshot = {
    id: string;
    metadata?: SnapshotMetadata;
    ref: DocumentReference;
    fields: Record<string, Value>;
}

export type QuerySnapshot = {
    docs: DocumentSnapshot[];
    metadata?: SnapshotMetadata;
    query: Query;
}


type SnapshotMetadata = {}
