import { createApp } from "./src/app.js";
import { DatabaseSync } from "node:sqlite";
import { initialize } from "./src/db_management.js";

const main = () => {
  const db = new DatabaseSync("./db/db_store.db");
  initialize(db);

  const app = createApp(db);

  Deno.serve({ port: 8000 }, app.fetch);
};

main();
