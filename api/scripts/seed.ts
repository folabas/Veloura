// Loads the starter categories and the five sample scarves (with their photos) into MongoDB.
// Run once after setting MONGODB_URI:  npm run seed
// (The admin panel's "Load starter products" button does the same thing.)
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connect, disconnect } from "../src/db.js";
import { loadStarter } from "../src/lib/starter.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const photoDir = path.resolve(here, "../../web/public/images");

await connect();
await loadStarter((file) => readFile(path.join(photoDir, file)), console.log);
await disconnect();
console.log("Done.");
