// import 時には .js 拡張子をつけないとコンパイル後に利用できないので注意！
import { getAccessToken } from "./auth.js";
import { CollectionReference, DocResponse, DocumentData, DocumentReference, DocumentSnapshot, Firestore, Query, QuerySnapshot, WithFieldValue } from "./types";
import { formatMap, simplifyFields } from "./util.js";
export * from './auth.js';



export function getFirestore(config?: Partial<Firestore>): Firestore {
    const projectId = config?.projectId ?? process.env.FIREBASE_PROJECT_ID;
    const privateKey = config?.privateKey ?? process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = config?.clientEmail ?? process.env.FIREBASE_CLIENT_EMAIL;
    if (!projectId) throw new Error('process.env["FIREBASE_PROJECT_ID"] is not set');
    if (!privateKey) throw new Error('process.env["FIREBASE_PRIVATE_KEY"] is not set');
    if (!clientEmail) throw new Error('process.env["FIREBASE_CLIENT_EMAIL"] is not set');
    return {
        cachedAccessToken: config?.cachedAccessToken,
        projectId,
        clientEmail,
        privateKey,
        profile: config?.profile
    }
}

export function doc(firestore: Firestore, path: string, id: string): DocumentReference {
    return {
        firestore,
        path,
        id,
    }
}

export function collection(firestore: Firestore, path: string): CollectionReference {
    return {
        firestore,
        type: "collection",
        path,
    }
}


export async function getDoc(reference: DocumentReference): Promise<DocumentSnapshot> {
    if (reference.firestore.profile) console.time("getAccessToken")
    const accessToken = reference.firestore.cachedAccessToken ?? await getAccessToken(reference.firestore);
    if (reference.firestore.profile) console.timeEnd("getAccessToken")

    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    const method = "GET";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    if (reference.firestore.profile) console.time("fetch")
    const res = await fetch(url, { method, headers });
    if (reference.firestore.profile) console.timeEnd("fetch")
    const data: DocResponse = await res.json();
    return {
        id: takeLastComponentFromPathString(data.name),
        fields: data.fields,
        ref: {
            id: takeLastComponentFromPathString(data.name),
            path: data.name,
            firestore: reference.firestore,
        }
    };
}

export function getDataFromSnapshot(snapshot: DocumentSnapshot): any {
    return simplifyFields(snapshot.fields);
}





export async function addDoc(reference: CollectionReference, data: WithFieldValue): Promise<DocumentReference> {
    const accessToken = await getAccessToken(reference.firestore);
    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}`;
    const method = "POST";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(formatMap(data));

    const res = await fetch(url, { method, headers, body });
    const json: DocResponse = await res.json();
    return {
        firestore: reference.firestore,
        path: json.name,
        id: takeLastComponentFromPathString(json.name),
    }
}

function takeLastComponentFromPathString(path: string) {
    const ary = path.split("/")
    return ary[ary.length - 1];
}

export async function setDoc(reference: DocumentReference, data: WithFieldValue): Promise<boolean> {
    const accessToken = await getAccessToken(reference.firestore);
    const url = `https://firestore.googleapis.com/v1beta1/projects/${reference.firestore.projectId}/databases/%28default%29/documents/${reference.path}/${reference.id}`;
    console.log(url)
    const method = "PATCH";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(formatMap(data));
    const res = await fetch(url, { method, headers, body });
    return res.status === 200;
}

