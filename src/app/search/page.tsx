import { db } from "@/db";
import { Product, productsTable } from "@/db/schema";
import { vectorize } from "@/lib/vectorize";
import { Index } from "@upstash/vector";
import { sql } from "drizzle-orm";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

// This creates a type similar to Product without the createdAt and updatedAt fields
// We need this as in vector DB we are not storing these as we don't need them there
export type CoreProduct = Omit<Product, "createdAt" | "updatedAt">;

// Helps us interact with our vector DB stored in Upstash
// <CoreProduct> tells that vector query response will come out as "CoreProduct" only
const index = new Index<CoreProduct>();

const Page = async ({ searchParams }: PageProps) => {
  // Get the search query from the URL params
  const query = searchParams.query;

  // A Guard Clause - A logic check that determines the rendering of the page
  if (Array.isArray(query) || !query) {
    // We cannot process string[] OR undefined OR empty strings in our search. So, we redirect the to the homepage
    return redirect("/");
  }

  // Querying logic
  let products: CoreProduct[] = await db
    .select()
    .from(productsTable)
    // Finding full text search for product name OR product description.
    // Beforehand, lowercase conversion is done to make the search case-insensitive
    .where(
      sql`to_tsvector('simple', lower(${productsTable.name}) || ' ' || ${
        productsTable.description
      }) @@ to_tsquery('simple', lower(${query.trim().split(" ").join(" & ")}))`
      // We actually match each word separately like "Bomber Jacket" -> this is INVALID SYNTAX, => "Bomber & Jacket" -> this is VALID SYNTAX,
      // & means that all the words should match. | means either of the words can match
    )
    .limit(3);

  // If we get less than 3 products then we add in those semantic results as well
  if (products.length < 3) {
    // search products by semantic similarity
    const vector = await vectorize(query);

    const res = await index.query({
      topK: 5, // how many matching products?
      vector,
      includeMetadata: true, // meta data is the object correspoding to the vector like [1,2,3] ==> {id: 1, name: "ray"} this is meta data and we want this instead of number[]
    });

    // Filter out duplicate products(same as our sql query - literal matching) from our vector results
    const vectorProducts = res
      .filter((existingProduct) => {
        if (
          products.some((product) => product.id === existingProduct.id) ||
          existingProduct.score < 0.9
        ) {
          // Removes
          // 1. already present in out literal matching results
          // 2. are not similar to our query results(having similarity score < 0.9) like dog is not similar to summer jackets BUT bomber jackets is similar to summer jackets
          return false;
        } else {
          return true;
        }
      })
      .map(({ metadata }) => metadata!);

    products.push(...vectorProducts);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 bg-white shadow-md rounded-b-md">
        <X className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No results</h3>
        <p className="mt-1 text-sm mx-auto max-w-prose text-gray-500">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Sorry, we couldn't find any matches for{" "}
          <span className="text-green-600 font-medium">{query}</span>.
        </p>
      </div>
    );
  }

  return (
    <ul className="py-4 divide-y divide-zinc-100 bg-white shadow-md rounded-b-md">
      {products.slice(0, 3).map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <li className="mx-auto py-4 px-8 flex space-x-4">
            <div className="relative flex items-center bg-zinc-100 rounded-lg h-40 w-40">
              <Image
                loading="eager"
                fill
                alt="product-image"
                src={`/${product.imageId}`}
              />
            </div>

            <div className="w-full flex-1 space-y-2 py-1">
              <h1 className="text-lg font-medium text-gray-900">
                {product.name}
              </h1>

              <p className="prose prose-sm text-gray-500 line-clamp-3">
                {product.description}
              </p>

              <p className="text-base font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
};

export default Page;
