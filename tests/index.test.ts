import { describe, expect, it } from "vitest"
import { addDoc, collection, doc, getDataFromSnapshot, getDoc, getFirestore, setDoc } from "../src/index"
import dotenv from 'dotenv';
dotenv.config();


it("hoge", () => {
    expect(1 + 2).toBe(3);
})

describe("getDoc", () => {
    const db = getFirestore({ profile: true })
    it("1回目", async () => {
        const _doc = doc(db, "results", "switch");
        const res = await getDoc(_doc);
    })
    it("2回目はキャッシュ済みのaccessTokenがが使われる", async () => {
        const _doc = doc(db, "results", "switch");
        const res = await getDoc(_doc);
        console.log(res)
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

        const savedDoc = doc(db, "results", res.id);
        const snapshot = await getDoc(savedDoc);
        const data = getDataFromSnapshot(snapshot);
        console.dir(data);
    })
    it("setDoc", async () => {
        const _doc = doc(db, "results", "hoge1");
        const res = await setDoc(_doc, { foo: "fuga", price: 200 })
        expect(res).toBeTruthy();
    })
})