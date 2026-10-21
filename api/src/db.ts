import { GridFSBucket, MongoClient, type Collection, type ObjectId } from "mongodb";
import { config } from "./config.js";

export type CategoryDoc = {
  _id?: ObjectId;
  slug: string;
  name: string;
  order: number;
};

export type ProductImage = { id: string; alt: string; focus?: string };

export type ProductDoc = {
  _id?: ObjectId;
  slug: string;
  name: string;
  colour: string;
  category: string; // category slug
  /** Naira, whole numbers */
  price: number;
  description: string;
  details: { label: string; value: string }[];
  images: ProductImage[];
  isNew: boolean;
  soldOut: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

const client = new MongoClient(config.mongoUri);

export let categories: Collection<CategoryDoc>;
export let products: Collection<ProductDoc>;
/** Photos live in MongoDB itself (GridFS), because Render's disk is wiped on every deploy. */
export let images: GridFSBucket;

export async function connect() {
  await client.connect();
  const db = client.db(config.dbName);
  categories = db.collection<CategoryDoc>("categories");
  products = db.collection<ProductDoc>("products");
  images = new GridFSBucket(db, { bucketName: "images" });

  await Promise.all([
    categories.createIndex({ slug: 1 }, { unique: true }),
    products.createIndex({ slug: 1 }, { unique: true }),
    products.createIndex({ category: 1, order: 1 }),
  ]);
  return db;
}

export async function disconnect() {
  await client.close();
}
