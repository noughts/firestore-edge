import { describe, expect, it } from "vitest"
import { addDoc, collection, doc, getData, getDoc, getFirestore, setDoc } from "../src/index"
import dotenv from 'dotenv';
dotenv.config();





describe("setDoc", () => {
    it("collection に id ありで setDoc", async () => {
        const db = getFirestore({ profile: true })
        const citiesRef = collection(db, "cities");
        const success = await setDoc(doc(citiesRef, "SF"), {
            name: "San Francisco", state: "CA", country: "USA",
            capital: false, population: 860000,
            regions: ["west_coast", "norcal"]
        });
        expect(success).toBeTruthy();

        const snapshot = await getDoc(doc(db, "cities", "SF"));
        expect(snapshot).toBeDefined();
        if (!snapshot) return;
        const data = getData(snapshot);
        expect(data.state).toBe("CA")
        expect(data.capital).toBeFalsy()
    })
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
        expect(snapshot).toBeDefined();
        if (!snapshot) return;
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
        if (!res.id) return;

        const savedRef = doc(db, "results", res.id);
        expect(savedRef.id).toBeDefined()

        const snapshot = await getDoc(savedRef);
        expect(snapshot).toBeDefined();
        if (!snapshot) return;
        const data = getData(snapshot);
        console.dir(snapshot.id, data);
    })
    it("setDoc", async () => {
        const _ref = doc(db, "results", "hoge1");
        const price = Math.random() * 200 + 100;
        const success = await setDoc(_ref, { foo: "fuga", price })
        expect(success).toBeTruthy();

        const savedSnapshot = await getDoc(_ref);
        expect(savedSnapshot).toBeDefined();
        if (!savedSnapshot) return;
        const data = getData(savedSnapshot)
        expect(data.price).toBe(price);
    })
})