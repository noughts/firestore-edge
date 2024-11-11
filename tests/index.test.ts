import { describe, expect, it } from "vitest"
import { addDoc, collection, doc, getData, getDoc, getFirestore, setDoc } from "../src/index"
import dotenv from 'dotenv';
dotenv.config();


it("Query", async () => {
    const db = getFirestore({ profile: true })
    const citiesRef = collection(db, "cities");

    await setDoc(doc(citiesRef, "SF"), {
        name: "San Francisco", state: "CA", country: "USA",
        capital: false, population: 860000,
        regions: ["west_coast", "norcal"]
    });
    await setDoc(doc(citiesRef, "LA"), {
        name: "Los Angeles", state: "CA", country: "USA",
        capital: false, population: 3900000,
        regions: ["west_coast", "socal"]
    });
    await setDoc(doc(citiesRef, "DC"), {
        name: "Washington, D.C.", state: null, country: "USA",
        capital: true, population: 680000,
        regions: ["east_coast"]
    });
    await setDoc(doc(citiesRef, "TOK"), {
        name: "Tokyo", state: null, country: "Japan",
        capital: true, population: 9000000,
        regions: ["kanto", "honshu"]
    });
    await setDoc(doc(citiesRef, "BJ"), {
        name: "Beijing", state: null, country: "China",
        capital: true, population: 21500000,
        regions: ["jingjinji", "hebei"]
    });
})



describe("getDoc", () => {
    const db = getFirestore({ profile: true })
    it("1回目", async () => {
        const ref = doc(db, "results", "switch");
        const snapshot = await getDoc(ref);
    })
    it("2回目はキャッシュ済みのaccessTokenがが使われる", async () => {
        const _doc = doc(db, "results", "switch");
        const snapshot = await getDoc(_doc);
        const data = getData(snapshot);
        console.log(data)
    })
})


describe("データ追加", () => {
    const db = getFirestore({ profile: false })
    it("addDoc", async () => {
        const _col = collection(db, "results");
        const res = await addDoc(_col, {
            name: "milk", meta: {
                brand: "foo",
                price: 1.23
            }
        })
        expect(res.id).toBeDefined();

        const savedRef = doc(db, "results", res.id);
        expect(savedRef.id).toBeDefined()

        const snapshot = await getDoc(savedRef);
        const data = getData(snapshot);
        console.dir(snapshot.id, data);
    })
    it("setDoc", async () => {
        const _ref = doc(db, "results", "hoge1");
        const price = Math.random() * 200 + 100;
        const success = await setDoc(_ref, { foo: "fuga", price })
        expect(success).toBeTruthy();

        const savedSnapshot = await getDoc(_ref);
        const data = getData(savedSnapshot)
        expect(data.price).toBe(price);
    })
})