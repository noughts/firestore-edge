import type { Firestore } from "./types";




let accessTokenPromise = Promise.resolve("");
let expiresAt = 0;

export async function getAccessToken(firestore: Firestore): Promise<string> {
    const scope = "https://www.googleapis.com/auth/datastore";
    const ttl = 3600;

    const now = Math.floor(Date.now() / 1000);
    if (now >= expiresAt) {
        accessTokenPromise = requestAccessToken(firestore, scope, ttl);
        expiresAt = now + ttl;
    }

    try {
        return accessTokenPromise;
    } catch (e) {
        expiresAt = 0;
        throw e;
    }
}


async function generateJWT(firestore: Firestore, scope: string, ttl: number): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);

    const header = {
        alg: "RS256",
        typ: "JWT"
    };

    const payload = {
        iss: firestore.clientEmail,
        scope,
        aud: "https://oauth2.googleapis.com/token",
        exp: timestamp + ttl,
        iat: timestamp
    };

    const encoder = new TextEncoder();

    const encodedHeader = base64urlEncode(encoder.encode(JSON.stringify(header)));
    const encodedPayload = base64urlEncode(encoder.encode(JSON.stringify(payload)));

    const content = `${encodedHeader}.${encodedPayload}`;

    // 秘密鍵をインポート
    const keyData = pemToArrayBuffer(firestore.privateKey);

    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        keyData,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" },
        },
        false,
        ["sign"]
    );

    // 署名を作成
    const signatureArrayBuffer = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        privateKey,
        encoder.encode(content)
    );

    const signature = base64urlEncode(signatureArrayBuffer);

    // JWTを生成
    const jwt = `${content}.${signature}`;

    return jwt;
}

// Base64URLエンコード関数
function base64urlEncode(buffer: ArrayBuffer | Uint8Array): string {
    let bytes: Uint8Array;
    if (buffer instanceof ArrayBuffer) {
        bytes = new Uint8Array(buffer);
    } else {
        bytes = buffer;
    }
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// PEM形式の秘密鍵をArrayBufferに変換
function pemToArrayBuffer(pem: string): ArrayBuffer {
    const base64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s+/g, '');
    return base64ToArrayBuffer(base64);
}

// Base64文字列をArrayBufferに変換
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


export async function requestAccessToken(firestore: Firestore, scope: string, ttl: number): Promise<string> {
    const jwt = await generateJWT(firestore, scope, ttl);

    const url = "https://oauth2.googleapis.com/token";
    const method = "POST";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    const body = `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${encodeURIComponent(jwt)}`;

    const response = await fetch(url, { method, headers, body });
    const json = await response.json();
    return json.access_token as string;
}
