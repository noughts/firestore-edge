import { getAccessToken } from "./auth";
import { DocumentData, DocumentReference, DocumentSnapshot, Firestore, Query, QuerySnapshot } from "./types";
import { formatMap } from "./util";



export function getFirestore(config?: Firestore): Firestore {
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
    }
}

export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData> {
    return {
        firestore,
        path,
        id: pathSegments[0],
    }
}

export async function getDoc<AppModelType, DbModelType extends DocumentData>(reference: DocumentReference<AppModelType, DbModelType>): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
    const accessToken = await getAccessToken(reference.firestore);

    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    const method = "GET";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const res = await fetch(url, { method, headers });
    return await res.json();
}

/*
export async function saveData(name: string, data: unknown) {
    const timestamp = new Date();

    const { FIREBASE_PROJECT_ID } = process.env;
    if (!FIREBASE_PROJECT_ID) {
        throw new Error('process.env["FIREBASE_PROJECT_ID"] is not set');
    }

    const collectionName = "test_collection"

    const accessToken = await getAccessToken();

    const url = `https://firestore.googleapis.com/v1beta1/projects/${FIREBASE_PROJECT_ID}/databases/%28default%29/documents/${collectionName}`;
    const method = "POST";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(formatMap({ name, timestamp, data }));

    const res = await fetch(url, { method, headers, body });
    const document = await res.json();
    return document;
}
    */