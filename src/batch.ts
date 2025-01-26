import { getAccessToken } from "./auth";
import type { Fields, Firestore } from "./types";

export type WriteBatch = {
    firestore: Firestore;
    writes: Write[];
}
export type Write = {
    update: {
        name: string;
        fields: Fields;
    }
}


export async function batchWriteRaw(firestore: Firestore, body: any) {
    const url = `https://firestore.googleapis.com/v1beta1/projects/${firestore.projectId}/databases/%28default%29/documents:batchWrite`;
    const accessToken = await getAccessToken(firestore);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.status == 200) {
        return data;
    } else {
        throw new Error(JSON.stringify(data, null, 2));
    }
}