import { it } from "vitest";
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();


async function createEmbedding(input: string): Promise<number[]> {
    const openai = new OpenAI();
    const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Hello!"
    })
    return res.data[0].embedding
}

it("createVector", async () => {
    const openai = new OpenAI();
    const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Hello!"
    })
    console.log(res.data[0].embedding)
});

it("vectorQuery", async () => {

})