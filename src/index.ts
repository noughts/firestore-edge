interface FirestoreConfig {
    projectId: string;
    apiKey: string;
}

class FirestoreAPI {
    private config: FirestoreConfig;
    private baseUrl: string;

    constructor(config: FirestoreConfig) {
        this.config = config;
        this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
    }

    async getDocument(collection: string, documentId: string) {
        const url = `${this.baseUrl}/${collection}/${documentId}?key=${this.config.apiKey}`;
        const response = await fetch(url);
        return response.json();
    }

    // 他のCRUDメソッドも追加
}

export function hoge() {
    console.log("hoge")
}

export default FirestoreAPI;
