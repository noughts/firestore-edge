import { describe, expect, it } from "bun:test"
import { addDoc, collection, doc, getData, getDoc, getDocs, getFirestore, setDoc } from "../src/main"


it("単純なgetDoc", async () => {
    const ref = doc(getFirestore(), "cities", "e2rriJlbeBeLLaPpdnkl");
    const snapshot = await getDoc(ref)
    expect(snapshot).toBeDefined();
    if (!snapshot) return;
    console.log(getData(snapshot))
})

it("コレクションの内容を全て取得", async () => {
    const ref = collection(getFirestore(), "cities");
    const snapshot = await getDocs(ref);
    expect(snapshot).toBeDefined();
    if (!snapshot) return;
    console.log(snapshot)
})

describe("converter", () => {
    const db = getFirestore()
    const ref = doc(db, "phones", "iPhone")
    it("テスト用データ保存", async () => {
        await setDoc(ref, {
            name: "iPhone",
            releasedAt: new Date(2007, 1, 1)
        })
    })
    it("データロード", async () => {
        const res = await getDoc(ref);
        if (!res) return;
        console.log(res?.fields)
        console.log(getData(res))
    })
})


describe("getDocのレイテンシー", () => {
    const db = getFirestore({ profile: true })
    it("1回目", async () => {
        const ref = doc(db, "results", "switch");
        const snapshot = await getDoc(ref);
    })
    it("2回目はキャッシュ済みのaccessTokenが使われる", async () => {
        const _doc = doc(db, "results", "ringfit");
        const snapshot = await getDoc(_doc);
        expect(snapshot).toBeDefined();
        if (!snapshot) return;
        const data = getData(snapshot);
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