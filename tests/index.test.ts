import { describe, expect, it } from "vitest"
import { doc, getDoc, getFirestore } from "../src/index"
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


