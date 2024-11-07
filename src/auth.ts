import { Firestore } from "./types";
import * as crypto from 'crypto';






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



// Base64URLエンコード関数
function base64url(input: string | Buffer): string {
    const base64 = Buffer.isBuffer(input) ? input.toString('base64') : Buffer.from(input).toString('base64');
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
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

    const content = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(payload));

    // 秘密鍵のBase64デコード
    const key = {
        key: firestore.privateKey,
        passphrase: '',
    };

    // 署名を作成
    const signature = crypto.sign("sha256", Buffer.from(content), key);

    // JWTを生成
    const jwt = content + "." + base64url(signature);

    return jwt;
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
