import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  createTask,
  createTodo,
  removeTodo,
  getAllTodos,
  getTodo,
  removeTask,
  toggleTaskStatus,
  updateTaskTitle,
  updateTodoTitle,
  loginUser,
  logoutUser,
  getStartPage,
  getAllTasks,
} from "./handlers.js";

export const createApp = (db) => {
  const app = new Hono();
  app.use(logger());
  app.use((c, next) => {
    c.set("db", db);
    return next();
  });

  app.post("/login", loginUser);
  app.post("/logout", logoutUser);

  app.post("/create-todo", createTodo);
  app.post("/remove-todo", removeTodo);
  app.post("update-todo", updateTodoTitle);

  app.post("/create-task", createTask);
  app.post("/toggle-task", toggleTaskStatus);
  app.post("/remove-task", removeTask);
  app.post("/update-task", updateTaskTitle);

  app.get("/get-todo", getTodo);
  app.get("/todos", getAllTodos);
  app.get("/tasks", getAllTasks);

  app.get("/get-start-page", getStartPage);

  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
