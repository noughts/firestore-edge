export type Firestore = {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    cachedAccessToken?: string;
    profile?: boolean;
}

export type Query = {
    firestore: Firestore;
    type: "collection" | "query"
}

export type CollectionReference = Query & {
    path: string;
}

type Primitive = string | number | boolean | null | undefined;

export type WithFieldValue = {
    [key: string]: any;
};

export type DocumentReference = {
    firestore: Firestore;
    id: string;
    path: string;
}

export type QuerySnapshot = {

}
export type DocumentData = {

}

export type DocumentSnapshot = {
    id: string;
    metadata?: SnapshotMetadata;
    ref: DocumentReference;
    fields: Fields;
}


export type FieldValue =
    | { stringValue: string }
    | { doubleValue: number }
    | { integerValue: number }
    | { booleanValue: boolean }
    | { arrayValue: { values: FieldValue[] } }
    | { mapValue: { fields: Record<string, FieldValue> } };

export type Fields = Record<string, FieldValue>;

export type DocResponse = {
    name: string;
    fields: Fields;
    createTime: string;
    updateTime: string;
}

type SnapshotMetadata = {}
