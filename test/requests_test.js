import { assertEquals } from "@std/assert";
import { describe, it, beforeAll, afterAll } from "@std/testing";
import { initialize } from "../src/db_management.js";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "../src/app.js";

describe("Tests all requests", () => {
  let db, app, todoId, taskId;
  beforeAll(() => {
    db = new DatabaseSync(":memory:");
    initialize(db);
    app = createApp(db);
  });

  afterAll(() => {
    console.log(db.prepare("select * from tasks;").all());
    console.log(db.prepare("select * from todos;").all());
  });

  describe("Test createTodo request", () => {
    it("Tests by sending valid data", async () => {
      const data = { title: "todo-one", userId: "user-1" };

      const response = await app.request("/create-todo", {
        body: JSON.stringify(data),
        method: "POST",
      });

      todoId = (await response.json()).id;

      assertEquals(response.status, 200);
    });

    it("Tests by sending valid data", async () => {
      const data = { title: "todo-one" };

      const response = await app.request("/create-todo", {
        body: JSON.stringify(data),
        method: "POST",
      });

      assertEquals(response.status, 401);
      assertEquals(
        await response.text(),
        "Provided value cannot be bound to SQLite parameter 3.",
      );
    });
  });

  describe("Test createTask request", () => {
    it("Tests by sending valid data", async () => {
      const data = { title: "task-one", todoId };

      const response = await app.request("/create-task", {
        body: JSON.stringify(data),
        method: "POST",
      });

      taskId = (await response.json()).id;

      assertEquals(response.status, 200);
    });

    it("Tests by sending valid data", async () => {
      const data = { title: "task-one" };

      const response = await app.request("/create-task", {
        body: JSON.stringify(data),
        method: "POST",
      });

      assertEquals(response.status, 401);
      assertEquals(
        await response.text(),
        "Provided value cannot be bound to SQLite parameter 3.",
      );
    });
  });

  describe("Tests with getting data from todo", () => {
    it("Testing with valid todo-id", async () => {
      const response = await app.request(`/get-todo?todo-id=${todoId}`, {
        method: "GET",
      });

      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data.id, todoId);
      assertEquals(data.title, "todo-one");
    });

    it("Testing with invalid todo-id", async () => {
      const response = await app.request(`/get-todo?todo-id=nothing`, {
        method: "GET",
      });

      assertEquals(response.status, 404);

      const data = await response.text();
      assertEquals(data, "todo not found");
    });
  });

  describe("Tests the toggling of a task status", () => {
    it("Tests toggling a valid task", async () => {
      await app.request("/toggle-task", {
        method: "POST",
        body: JSON.stringify({ id: taskId, todoId }),
      });
    });

    it("Tests toggling an invalid task", async () => {
      const response = await app.request("/toggle-task", {
        method: "POST",
        body: JSON.stringify({ id: "task-one", todoId }),
      });

      assertEquals(response.status, 404);
      assertEquals(await response.text(), "task not found");
    });
  });
});
