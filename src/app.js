import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  createTask,
  createTodo,
  getAllTodos,
  getTodo,
  updateTaskStatus,
} from "./handlers.js";

export const createApp = (db) => {
  const app = new Hono();
  app.use(logger());
  app.use((c, next) => {
    c.set("db", db);
    return next();
  });

  app.post("/create-todo", createTodo);
  app.post("/create-task", createTask);
  app.post("/toggle-task", updateTaskStatus);

  app.get("/todos", getAllTodos);
  app.get("/get-todo", getTodo);

  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
