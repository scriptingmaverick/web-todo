import { assertEquals } from "@std/assert";
import { describe, it, beforeAll, afterAll } from "@std/testing";
import { initialize } from "../src/db_management.js";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "../src/app.js";

describe("Tests all requests", () => {
  let db, app, todoId, taskId, newTodoId, newTaskId;
  beforeAll(async () => {
    db = new DatabaseSync(":memory:");
    initialize(db);
    app = createApp(db);

    const response = await app.request("/create-todo", {
      body: JSON.stringify({
        title: "todo-two",
        userId: "user-1",
      }),
      method: "POST",
    });
    newTodoId = (await response.json()).id;

    const taskResponse = await app.request("/create-task", {
      body: JSON.stringify({ title: "task-two", todoId: "todo-two" }),
      method: "POST",
    });
    newTaskId = (await taskResponse.json()).id;
  });

  afterAll(() => {
    console.log(db.prepare("select * from tasks;").all());
    console.log(db.prepare("select * from todos;").all());
  });

  describe("Tests with todo functionalities", () => {
    describe("Tests createTodo request", () => {
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

    describe("Tests getTodos", () => {
      it("Tests with valid user_id", async () => {
        const userId = "user-1";
        const response = await app.request(`/todos?user-id=${userId}`, {
          method: "GET",
        });

        assertEquals((await response.json()).length, 2);
      });

      it("Tests with invalid user_id", async () => {
        const userId = "user-5";
        const response = await app.request(`/todos?user-id=${userId}`, {
          method: "GET",
        });

        assertEquals((await response.json()).length, 0);
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

    describe("Tests removal of a todo", () => {
      it("Tests removing a valid todo", async () => {
        const response = await app.request("/remove-todo", {
          method: "POST",
          body: JSON.stringify({ id: todoId }),
        });

        assertEquals(await response.text(), "deletion successful");
      });

      it("Tests toggling an invalid todo", async () => {
        const response = await app.request("/remove-todo", {
          method: "POST",
          body: JSON.stringify({ id: "task-one" }),
        });

        assertEquals(response.status, 404);
        assertEquals(await response.text(), "todo not found");
      });
    });

    describe("Tests updating mechanism of a todo", () => {
      it("Tests with valid todo", async () => {
        const response = await app.request("/update-todo", {
          body: JSON.stringify({ id: newTodoId, newTitle: "todo-two-updated" }),
          method: "POST",
        });

        assertEquals(await response.text(), "updated successfully");
      });

      it("Tests with invalid todo", async () => {
        const response = await app.request("/update-todo", {
          body: JSON.stringify({
            id: "newTodoId",
            newTitle: "todo-two-updated",
          }),
          method: "POST",
        });

        assertEquals(await response.text(), "todo not found");
      });
    });
  });

  describe("Tests task functionalities", () => {
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

    describe("Tests the toggling of a task status", () => {
      it("Tests toggling a valid task", async () => {
        const response = await app.request("/toggle-task", {
          method: "POST",
          body: JSON.stringify({ id: taskId, todoId }),
        });

        assertEquals(await response.text(), "toggled successfully");
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

    describe("Tests removal of a task", () => {
      it("Tests removing a valid task", async () => {
        const response = await app.request("/remove-task", {
          method: "POST",
          body: JSON.stringify({ id: taskId, todoId }),
        });

        assertEquals(await response.text(), "deletion successful");
      });

      it("Tests toggling an invalid task", async () => {
        const response = await app.request("/remove-task", {
          method: "POST",
          body: JSON.stringify({ id: "task-one", todoId }),
        });

        assertEquals(response.status, 404);
        assertEquals(await response.text(), "task not found");
      });
    });

    describe("Tests updating mechanism of a task", () => {
      it("Tests with valid task", async () => {
        const response = await app.request("/update-task", {
          body: JSON.stringify({ id: newTaskId, newTitle: "task-two-updated" }),
          method: "POST",
        });

        assertEquals(await response.text(), "updated successfully");
      });

      it("Tests with invalid task", async () => {
        const response = await app.request("/update-task", {
          body: JSON.stringify({
            id: "newTaskId",
            newTitle: "task-two-updated",
          }),
          method: "POST",
        });

        assertEquals(await response.text(), "task not found");
      });
    });
  });
});
