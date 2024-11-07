export type Firestore = {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    cachedAccessToken?: string;
}
export type Query<T1, T2> = {

}


export type DocumentReference<T1, T2> = {
    firestore: Firestore;
    id: string;
    path: string;
}

export type QuerySnapshot<T1, T2> = {

}
export type DocumentData = {

}

export type DocumentSnapshot<T1, T2> = {

}
