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
        username: "jkf",
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
    console.log(db.prepare("select * from users;").all());
    console.log(db.prepare("select * from sessions;").all());
  });

  describe("Tests user functionalities", () => {
    let userId, sessionId;
    describe("Tests Login functionality", () => {
      it("Tests login with new user", async () => {
        const user_name = "new-user";
        const response = await app.request("/login", {
          body: JSON.stringify({ username: user_name }),
          method: "POST",
        });

        const { id, username } = await response.json();

        userId = id;
        assertEquals(username, user_name);
      });

      it("Tests login with existing user", async () => {
        const { username: user_name } = db
          .prepare("select username from users where id=?")
          .get(userId);

        const response = await app.request("/login", {
          body: JSON.stringify({ username: user_name }),
          method: "POST",
        });

        const dt = await response.json();
        const { username, sessionId: session_id } = dt;
        sessionId = session_id;
        assertEquals(username, user_name);
        assertEquals(db.prepare("select * from sessions;").all().length, 2);
      });
    });

    describe("Tests Logout functionality", () => {
      it("Tests with valid sessionId", async () => {
        const response = await app.request("/logout", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });

        assertEquals(await response.text(), "Logout successful");
      });

      it("Tests with an invalid sessionId", async () => {
        const response = await app.request("/logout", {
          method: "POST",
          body: JSON.stringify({ sessionId: "session-1" }),
        });

        assertEquals(await response.text(), "Session not exists");
      });

      it("Tests with already removed sessionId", async () => {
        const response = await app.request("/logout", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });

        assertEquals(await response.text(), "Session is inactive");
      });
    });
  });

  describe("Tests todo functionalities", () => {
    describe("Tests createTodo request", () => {
      it("Tests by sending valid data", async () => {
        const data = { title: "todo-one", username: "jkf" };

        const response = await app.request("/create-todo", {
          body: JSON.stringify(data),
          method: "POST",
        });

        const res = await response.json();
        todoId = res.id;

        assertEquals(response.status, 200);
        assertEquals(res.username, data.username);
      });

      it("Tests by sending invalid data", async () => {
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

    describe("Tests getTodos of a user", () => {
      it("Tests with valid username", async () => {
        const username = "new-user";
        const response = await app.request(`/todos?user-name=${username}`, {
          method: "GET",
        });

        assertEquals((await response.json()).length, 0);
      });

      it("Tests with invalid username", async () => {
        const username = "user-5";
        const response = await app.request(`/todos?user-name=${username}`, {
          method: "GET",
        });

        assertEquals(await response.text(), "User not found");
      });
    });

    describe("Tests getting data from todo", () => {
      it("Testing with valid todo_id", async () => {
        const response = await app.request(`/get-todo?todo-id=${todoId}`, {
          method: "GET",
        });

        assertEquals(response.status, 200);

        const data = await response.json();
        assertEquals(data.id, todoId);
        assertEquals(data.title, "todo-one");
      });

      it("Testing with invalid todo_id", async () => {
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

    describe("Tests updating title of a todo", () => {
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

      it("Tests by sending invalid data", async () => {
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

    describe("Tests getting all tasks of a todo", () => {
      it("Tests with valid todoId", async () => {
        const response = await app.request(`/tasks?todo-id=${todoId}`, {
          method: "GET",
        });

        const data = await response.json();
        assertEquals(data.length, 1);
        assertEquals(data[0].todo_id, todoId);
      });

      it("Tests with an invalid todoId", async () => {
        const response = await app.request(`/tasks?todo-id=${"todoId"}`, {
          method: "GET",
        });

        const data = await response.text();
        assertEquals(data, "Todo not found");
      });
    });

    describe("Tests removal of a task", () => {
      it("Tests with a valid task", async () => {
        const response = await app.request("/remove-task", {
          method: "POST",
          body: JSON.stringify({ id: taskId, todoId }),
        });

        assertEquals(await response.text(), "deletion successful");
      });

      it("Tests with an invalid task", async () => {
        const response = await app.request("/remove-task", {
          method: "POST",
          body: JSON.stringify({ id: "task-one", todoId }),
        });

        assertEquals(response.status, 404);
        assertEquals(await response.text(), "task not found");
      });
    });

    describe("Tests updating title of a task", () => {
      it("Tests with valid task", async () => {
        const response = await app.request("/update-task", {
          body: JSON.stringify({ id: newTaskId, newTitle: "task-two-updated" }),
          method: "POST",
        });

        assertEquals(await response.text(), "updated successfully");
      });

      it("Tests with an invalid task", async () => {
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
