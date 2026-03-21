import {
  createId,
  createTaskEntry,
  createTodoEntry,
  getData,
  getTodos,
  isNotInDB,
  isSessionActive,
  isUserExists,
  removeEntry,
  removeSession,
  saveSession,
  saveUser,
  updateStatus,
  updateTitle,
} from "./db_management.js";
import { getCookie } from "hono/cookie";

export const createTodo = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");
  try {
    data.id = createId(db, "todo", data?.title);
    if (!data.id) throw Error("title must not be empty.");

    const todoDetails = createTodoEntry(db, data);
    return c.json(todoDetails);
  } catch (e) {
    return c.text(e.message, 401);
  }
};

export const removeTodo = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.id, "todos")) throw new Error("todo not found");

    removeEntry(db, data, "todos");
    return c.text("deletion successful");
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const updateTodoTitle = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.id, "todos")) throw new Error("todo not found");

    updateTitle(db, data, "todos");
    return c.text("updated successfully");
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const createTask = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    data.id = createId(db, "task", data?.title);
    if (!data.id) throw Error("title must not be empty.");

    const taskDetails = createTaskEntry(db, data);
    return c.json(taskDetails);
  } catch (e) {
    return c.text(e.message, 401);
  }
};

export const toggleTaskStatus = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");
  try {
    if (isNotInDB(db, data.id, "tasks")) throw new Error("task not found");

    updateStatus(db, data);
    return c.text("toggled successfully");
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const removeTask = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.id, "tasks")) throw new Error("task not found");

    removeEntry(db, data, "tasks");
    return c.text("deletion successful");
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const updateTaskTitle = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.id, "tasks")) throw new Error("task not found");

    updateTitle(db, data, "tasks");
    return c.text("updated successfully");
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const getTodo = async (c) => {
  const { "todo-id": todoId } = await c.req.query();
  const db = c.get("db");
  try {
    const todoDetails = getData(db, "todos", { id: todoId });

    if (!todoDetails) throw new Error("todo not found");

    return c.json(todoDetails);
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const getAllTodos = async (c) => {
  const data = await c.req.query();
  const db = c.get("db");

  try {
    const todosData = getTodos(db, { userId: data["user-id"] });
    return c.json(todosData);
  } catch (e) {
    return c.text(e.message);
  }
};

// User Functionalities

export const loginUser = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");
  try {
    if (isUserExists(db, data)) {
      const cookie = getCookie(c, "session_id");
      data.sessionId = cookie
        ? cookie
        : createId(db, "session", `${data?.username}-session`);

      saveSession(db, data);
      return c.json(data);
    }

    data.id = createId(db, "user", data?.username);
    saveUser(db, data);

    return c.json(data);
  } catch (e) {
    return c.text(e.message, 401);
  }
};

export const logoutUser = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.sessionId, "sessions"))
      throw new Error("Session not exists");

    if (!isSessionActive(db, data.sessionId))
      throw new Error("Session is inactive");

    removeSession(db, data);
    return c.text("Logout successful");
  } catch (e) {
    return c.text(e.message, 501);
  }
};
