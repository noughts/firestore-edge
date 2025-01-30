import { expect, it } from "bun:test";
import { doc, getData, getDoc, getFirestore } from "../src/main";



it("getDoc()", async () => {
    const db = getFirestore()
    const snapshot = await getDoc(doc(db, "coffee-beans", "sample"));
    expect(snapshot).toBeDefined();
    if (!snapshot) return;
})
