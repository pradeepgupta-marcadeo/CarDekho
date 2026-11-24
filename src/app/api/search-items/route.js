import { searchList } from "@/lib/search-items";
import { ready } from "@/data/store";

// Everything the header search can find. Loaded by the browser the first time someone uses the search box,
// so the list is not repeated inside the HTML of every page.
export async function GET() {
  await ready();
  return Response.json(searchList());
}
