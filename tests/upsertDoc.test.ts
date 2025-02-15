import { describe, expect, it } from "bun:test"
import { addDoc, collection, doc, getData, getDoc, getFirestore, setDoc, vectorValue } from "../src/main"
import { getAccessToken } from "../src/auth";
import { serializeObject } from "../src/util";

const sampleDataWithVector = {
    fields: {
        name: { stringValue: "Kahawa coffee beans" },
        description: { stringValue: "Information about the Kahawa coffee beans." },
        embedding: {
            mapValue: {
                fields: {
                    __type__: {
                        stringValue: "__vector__"
                    },
                    value: {
                        arrayValue: {
                            values: [{ doubleValue: "1" }, { doubleValue: "1.5" }, { doubleValue: "2" }]
                        }
                    },
                }
            }
        },
    }
}

it("オブジェクトをFirestoreに保存する形式にエンコード", () => {
    const data = {
        name: "San Francisco", state: "CA", country: "USA",
        tags: [1.0, 2, 3],
        details: {
            capital: false, population: 860000,
            regions: ["west_coast", "norcal"]
        },
    }
    console.dir(serializeObject(data), { depth: null })
})

it("VectorValueをエンコード", () => {
    const data = {
        name: "Kahawa coffee beans",
        description: "Information about the Kahawa coffee beans.",
        embedding: vectorValue([1.0, 1.5, 2.0])
    }
    expect(serializeObject(data)).toStrictEqual(sampleDataWithVector);
})



it.skip("ベクトルデータを保存_生API呼び出し", async () => {
    const db = getFirestore({ profile: true })
    const col = collection(db, "coffee-beans");
    const accessToken = await getAccessToken(col.firestore);
    const url = `https://firestore.googleapis.com/v1beta1/projects/${col.firestore.projectId}/databases/%28default%29/documents/${col.path}/sample2`;
    const method = "PATCH";
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const body = JSON.stringify(sampleDataWithVector);
    const res = await fetch(url, { method, headers, body });
    console.log(await res.json())
    expect(res.status).toBe(200)
})

it("ベクトルデータを保存", async () => {
    const db = getFirestore({ profile: true })
    const cities_col = collection(db, "coffee-beans");
    const success = await setDoc(doc(cities_col, "sample"), {
        name: "Kahawa coffee beans",
        description: "Information about the Kahawa coffee beans.",
        embedding: vectorValue([1.0, 1.5, 2.0])
    });
    expect(success).toBeTruthy();

    // 保存されたかを検証
    const snapshot = await getDoc(doc(db, "coffee-beans", "sample"));
    expect(snapshot).toBeDefined();
})


it("setDoc()", async () => {
    const db = getFirestore({ profile: true })
    const cities_col = collection(db, "cities");
    const success = await setDoc(doc(cities_col, "SF"), {
        name: "San Francisco", state: "CA", country: "USA",
        capital: false, population: 860000,
        regions: ["west_coast", "norcal"]
    });
    expect(success).toBeTruthy();

    // 保存されたかを検証
    const snapshot = await getDoc(doc(db, "cities", "SF"));
    expect(snapshot).toBeDefined();
    if (!snapshot) return;
    const data = getData(snapshot);
    expect(data.state).toBe("CA")
    expect(data.capital).toBeFalsy()
})


it("addDoc()", async () => {
    const cities_col = collection(getFirestore({ profile: true }), "cities");
    const saved_ref = await addDoc(cities_col, {
        name: "San Francisco", state: "CA", country: "USA",
        capital: false, population: 860000,
        regions: ["west_coast", "norcal"]
    });
    expect(saved_ref).toBeTruthy();

    // 保存されたかを検証
    const snapshot = await getDoc(saved_ref);
    expect(snapshot).toBeDefined();
    if (!snapshot) return;
    const data = getData(snapshot);
    expect(data.state).toBe("CA")
    expect(data.capital).toBeFalsy()
})