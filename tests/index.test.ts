import { expect, it } from "vitest"
import { doc, getDoc, getFirestore } from "../src/index"

it("hoge", () => {
    expect(1 + 2).toBe(3);
})

it("hogea", async () => {
    const db = getFirestore()
    const _doc = doc(db, "results", "switch");
    const res = await getDoc(_doc);
    console.log(res)
})

