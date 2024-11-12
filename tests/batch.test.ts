import dotenv from 'dotenv';
import { it } from "vitest";
import { doc, getFirestore, setWrite, batchWrite } from "../src";
import { batchWriteRaw } from "../src/batch";
dotenv.config();


it("batchWrite で batchで複数の書き込み", async () => {
    const db = getFirestore();
    const res = await batchWriteRaw(db, {
        writes: [
            {
                update: {
                    name: `projects/${db.projectId}/databases/(default)/documents/cities/Foo`,
                    fields: {
                        hoge: {
                            stringValue: "hoge"
                        }
                    }
                }
            },
            {
                update: {
                    name: `projects/${db.projectId}/databases/(default)/documents/cities/Bar`,
                    fields: {
                        hoge: {
                            stringValue: "fuga"
                        }
                    }
                }
            }
        ],
    });
    console.log(res)
});


it("batchWrite で batchで複数の書き込み2", async () => {
    const db = getFirestore();
    const ref = doc(db, "cities", "Foo");
    const ref2 = doc(db, "cities", "Bar");
    const res = await batchWrite(db,
        setWrite(ref, { name: "ほげ", population: 400 }),
        setWrite(ref2, { name: "ふが", popuration: 200 })
    );
    console.log(res)
});
