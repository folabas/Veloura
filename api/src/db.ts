import { GridFSBucket, MongoClient, type Collection, type ObjectId } from "mongodb";
import { config } from "./config.js";

export type CategoryDoc = {
  _id?: ObjectId;
  slug: string;
  name: string;
  order: number;
};

export type ProductImage = { id: string; alt: string; focus?: string };

/** Percent off between two moments. Only applies while now is inside the window. */
export type ProductSale = { percent: number; startsAt: Date; endsAt: Date };

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
  sale?: ProductSale | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RequestStatus = "new" | "in-progress" | "done";

/** A customer's request for a custom-made outfit, with their reference photos. */
export type RequestDoc = {
  _id?: ObjectId;
  name: string;
  phone: string; // as typed
  whatsapp: string; // normalised to international digits for wa.me links, e.g. 2348012345678
  itemType: string;
  description: string;
  measurements: string;
  budget: string;
  neededBy: string;
  photos: string[]; // image ids (private: only the admin can view them)
  status: RequestStatus;
  notes: string;
  createdAt: Date;
};

const client = new MongoClient(config.mongoUri);

export let categories: Collection<CategoryDoc>;
export let products: Collection<ProductDoc>;
export let requests: Collection<RequestDoc>;
/** Photos live in MongoDB itself (GridFS), because Render's disk is wiped on every deploy. */
export let images: GridFSBucket;
/** The bucket's file records, for updating photo details (e.g. marking request photos as attached). */
export let imageFiles: Collection;

export async function connect() {
  await client.connect();
  const db = client.db(config.dbName);
  categories = db.collection<CategoryDoc>("categories");
  products = db.collection<ProductDoc>("products");
  requests = db.collection<RequestDoc>("requests");
  images = new GridFSBucket(db, { bucketName: "images" });
  imageFiles = db.collection("images.files");

  await Promise.all([
    requests.createIndex({ createdAt: -1 }),
    categories.createIndex({ slug: 1 }, { unique: true }),
    products.createIndex({ slug: 1 }, { unique: true }),
    products.createIndex({ category: 1, order: 1 }),
  ]);
  return db;
}

export async function disconnect() {
  await client.close();
}
