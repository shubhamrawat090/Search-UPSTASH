import { HfInference } from "@huggingface/inference";
import * as dotenv from "dotenv";
dotenv.config();

export const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

export function dotProduct(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error("Both arguments should have the same lengths");
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  return result;
}

// Since the array can be anything([] or [][]) so we are just checking if it is a 1D array
export function is1DArray<T>(value: (T | T[] | T[][])[]): value is T[] {
  return !Array.isArray(value[0]);
}
