import { it, describe, expect } from "bun:test";
import { collection, doc, getData, getDocs, getFirestore, limit, orderBy, query, setDoc, where } from "../src/main";
import { runQuery, type StructuredQuery } from '../src/query';
import { pipe } from "@fxts/core"




describe("Query作成", () => {
    it("一つのwhere", () => {
        const db = getFirestore({ profile: true })
        const col = collection(db, "cities");
        const q = query(col, where("capital", "==", true));
        console.log(q.structuredQuery)
        const expected: StructuredQuery = {
            from: [{ collectionId: "cities" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "capital" },
                    op: "EQUAL",
                    value: { booleanValue: true }
                }
            }
        }
        expect(q.structuredQuery).toStrictEqual(expected)
    })

    describe("複合クエリ", () => {
        const expected: StructuredQuery = {
            from: [{ collectionId: "cities" }],
            where: {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        {
                            fieldFilter: {
                                field: { fieldPath: "capital" },
                                op: "EQUAL",
                                value: { booleanValue: true }
                            }
                        },
                        {
                            fieldFilter: {
                                field: { fieldPath: "population" },
                                op: "GREATER_THAN",
                                value: { integerValue: "1000000" }
                            }
                        }],
                },
            }
        }
        it("2つのwhereを同時にセット", () => {
            const db = getFirestore({ profile: true })
            const col = collection(db, "cities");
            const q = query(col, where("capital", "==", true), where("population", ">", 1000000));
            console.log(q.structuredQuery)
            expect(q.structuredQuery).toStrictEqual(expected)
        })
        it("別々にセット", () => {
            const db = getFirestore({ profile: true })
            const col = collection(db, "cities");
            const q1 = query(col, where("capital", "==", true));
            const q2 = query(q1, where("population", ">", 1000000));
            console.log(q2.structuredQuery)
            expect(q2.structuredQuery).toStrictEqual(expected)
        })
        it("fxtsを使ってセット", () => {
            const db = getFirestore({ profile: true })
            const q = pipe(
                collection(db, "cities"),
                (x => query(x, where("capital", "==", true))),
                (x => query(x, where("population", ">", 1000000))),
            )
            console.log(q.structuredQuery)
            expect(q.structuredQuery).toStrictEqual(expected)
        })
    });


})





describe("runQuery", () => {
    const db = getFirestore({ profile: true })

    it("getAll", async () => {
        const res = await runQuery(db, {
            from: [{ collectionId: "cities" }]
        });
        console.log(res.map(x => getData(x.document)))
    });

    it("単純な where", async () => {
        const res = await runQuery(db, {
            from: [{ collectionId: "cities" }],
            where: {
                fieldFilter: {
                    field: { fieldPath: "capital" },
                    op: "EQUAL",
                    value: { booleanValue: true }
                }
            }
        })
        console.log(res.map(x => getData(x.document)))
    });

    it("複合クエリ", async () => {
        const res = await runQuery(db, {
            from: [{ collectionId: "cities" }],
            where: {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        {
                            fieldFilter: {
                                field: { fieldPath: "capital" },
                                op: "EQUAL",
                                value: { booleanValue: true }
                            }
                        },
                        {
                            fieldFilter: {
                                field: { fieldPath: "population" },
                                op: "GREATER_THAN_OR_EQUAL",
                                value: { integerValue: "1000000" }
                            }
                        }
                    ]
                }
            }
        })
        console.log(res.map(x => getData(x.document)))
    });

    it("orderBy", async () => {
        const res = await runQuery(db, {
            from: [{ collectionId: "cities" }],
            orderBy: [
                {
                    field: { fieldPath: "population" },
                    direction: "DESCENDING"
                }
            ]
        })
        console.log(res.map(x => getData(x.document)))
    });

    it("複数のorderBy", async () => {
        const res = await runQuery(db, {
            from: [{ collectionId: "cities" }],
            orderBy: [
                {
                    field: { fieldPath: "capital" },
                    direction: "DESCENDING"
                },
                {
                    field: { fieldPath: "population" },
                    direction: "DESCENDING"
                },
            ]
        })
        console.log(res.map(x => getData(x.document)))
    });

    it("limit", async () => {
        const res = await runQuery(db, {
            from: [{ collectionId: "cities" }],
            limit: 2,
        })
        console.log(res.map(x => getData(x.document)))
    });

})



describe("Query", async () => {
    const db = getFirestore({ profile: true })
    const citiesRef = collection(db, "cities");

    it("保存", async () => {
        await setDoc(doc(citiesRef, "SF"), {
            name: "San Francisco", state: "CA", country: "USA", capital: false, population: 860000, regions: ["west_coast", "norcal"]
        });
        await setDoc(doc(citiesRef, "LA"), {
            name: "Los Angeles", state: "CA", country: "USA", apital: false, population: 3900000, regions: ["west_coast", "socal"]
        });
        await setDoc(doc(citiesRef, "DC"), {
            name: "Washington, D.C.", state: null, country: "USA", capital: true, population: 680000, regions: ["east_coast"]
        });
        await setDoc(doc(citiesRef, "TOK"), {
            name: "Tokyo", state: null, country: "Japan", capital: true, population: 9000000, regions: ["kanto", "honshu"]
        });
        await setDoc(doc(citiesRef, "BJ"), {
            name: "Beijing", state: null, country: "China", capital: true, population: 21500000, regions: ["jingjinji", "hebei"]
        });
    })

    it("単純なクエリ", async () => {
        const q = query(citiesRef, where("capital", "==", true));
        const res = await getDocs(q);
        console.log(res.docs.map(x => getData(x)))
    })

    it("複合クエリ", async () => {
        const q = query(citiesRef,
            where("capital", "==", true),
            where("population", ">", 1000000)
        );
        const res = await getDocs(q);
        console.log(res.docs.map(x => getData(x)))
    })
    it("複合クエリ2", async () => {
        const q1 = query(citiesRef, where("capital", "==", true));
        const q2 = query(q1, where("population", ">", 1000000));
        const res = await getDocs(q2);
        console.log(res.docs.map(x => getData(x)))
    })

    it("limit", async () => {
        const _limit = 2;
        const q = query(citiesRef, limit(_limit));
        const res = await getDocs(q);
        expect(res.docs.length).toBe(_limit);
        console.log(res.docs.map(x => getData(x)))
    })

    it("orderBy", async () => {
        const q = query(citiesRef, orderBy("capital", "desc"), orderBy("population", "desc"));
        const res = await getDocs(q);
        console.log(res.docs.map(x => getData(x)))
    })
})



