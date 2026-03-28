import {
  createId,
  createTaskEntry,
  createTodoEntry,
  getData,
  getTasks,
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
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

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

export const getAllTasks = async (c) => {
  const { "todo-id": todoId } = await c.req.query();
  const db = c.get("db");

  try {
    const data = db.prepare("SELECT * FROM todos WHERE id=?").get(todoId);
    if (!data) throw new Error("Todo not found");

    const tasksData = getTasks(db, { todoId });

    return c.json(tasksData);
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
  const { "user-name": username } = await c.req.query();
  const db = c.get("db");

  try {
    const data = db
      .prepare("SELECT * FROM users WHERE username=?")
      .get(username);

    if (!data) throw new Error("User not found");

    const todosData = getTodos(db, { username });
    return c.json(todosData);
  } catch (e) {
    return c.text(e.message, 404);
  }
};

// User Functionalities

const redirectToHome = (c) => {
  const headers = new Headers();
  headers.append("location", "/home");

  return c.response("redirect to home", {
    headers,
    status: 303,
  });
};

export const loginUser = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");
  try {
    const cookie = getCookie(c, "session_id");
    if (cookie) return redirectToHome(c);

    if (!isUserExists(db, data)) {
      data.id = createId(db, "user", data?.username);
      saveUser(db, data);
    }

    data.sessionId = createId(db, "session", `${data?.username}-session`);
    saveSession(db, data);

    setCookie(c, "session_id", data.sessionId);
    return c.json(data);
  } catch (e) {
    return c.text(e.message, 401);
  }
};

export const logoutUser = async (c) => {
  const sessionId = getCookie(c, "session_id");
  const data = sessionId ? { sessionId } : await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.sessionId, "sessions"))
      throw new Error("Session not exists");

    if (!isSessionActive(db, data.sessionId))
      throw new Error("Session is inactive");

    removeSession(db, data);
    deleteCookie(c, "session_id");

    return c.text("Logout successful");
  } catch (e) {
    return c.text(e.message, 501);
  }
};

export const getStartPage = (c) => {
  const db = c.get("db");
  const cookie = getCookie(c, "session_id");

  if (cookie) {
    const { username } = getData(db, "sessions", { id: cookie });
    const todosData = getTodos(db, { username });

    return c.json({ username, todosData, page: "home" });
  }

  return c.json({ page: "login" });
};
