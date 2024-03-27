import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  // Get the search query from the URL params
  const query = searchParams.query;

  // A Guard Clause - A logic check that determines the rendering of the page
  if (Array.isArray(query) || !query) {
    // We cannot process string[] OR undefined OR empty strings in our search. So, we redirect the to the homepage
    return redirect("/");
  }

  // Querying logic
  let products = await db
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

  return <pre>{JSON.stringify(products)}</pre>;
};

export default Page;
