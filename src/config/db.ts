import { MongoClient, Db } from "mongodb";

let db: Db;

export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.DB_NAME || "ushnota");
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error("Database not connected");
  return db;
}
