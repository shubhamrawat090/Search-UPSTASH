// takes a text and converts it into a vector [0, 1, 5, 1]
// import { openai } from "./openai";
import { hf } from "./huggingface";

// the above array will be of 1536 length. As, 1536 is the length we specified while creating VECTOR db instance in Upstash
export const vectorize = async (input: string): Promise<number[]> => {
  ////// OPEN AI WAS NOT FREE ANYMORE

  // embeddings are vectors created using openai
  // const embeddingResponse = await openai.embeddings.create({
  //   input,
  //   model: "text-embedding-3-small", // Upstash Free Tier Supported Model. Can use higher model with paid version of Upstash
  // });

  // // This is the resulting vector that the model spits out
  // const vector = embeddingResponse.data[0].embedding;

  ///// USING mixedbread-ai model
  try {
    const embeddingResponse = await hf.featureExtraction({
      model: "mixedbread-ai/mxbai-embed-large-v1",
      inputs: input,
    });

    // This is the resulting vector that the model spits out
    const vector = embeddingResponse as number[];
    return vector;
  } catch (error) {
    console.log("ERROR OCCURRED");
    console.error("Error");
    return [];
  }
};
