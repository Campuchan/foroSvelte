import client from "$db/mongo";
export function GET() {
  return new Response("MongoDB is connected");
}