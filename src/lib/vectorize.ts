// takes a text and converts it into a vector [0, 1, 5, 1]
import { openai } from "./openai";

// the above array will be of 1536 length. As, 1536 is the length we specified while creating VECTOR db instance in Upstash
export const vectorize = async (input: string): Promise<number[]> => {
  // embeddings are vectors created using openai
  const embeddingResponse = await openai.embeddings.create({
    input,
    model: "text-embedding-ada-002", // Upstash Free Tier Supported Model. Can use higher model with paid version of Upstash
  });
  // This is the resulting vector that the model spits out
  const vector = embeddingResponse.data[0].embedding;
  return vector;
};
