import {
  createId,
  createTaskEntry,
  createTodoEntry,
  getData,
  isNotInDB,
  removeTaskEntry,
  removeTodoEntry,
  updateStatus,
} from "./db_management.js";

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

export const createTask = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    data.id = createId(db, "tasks", data?.title);
    if (!data.id) throw Error("title must not be empty.");

    const taskDetails = createTaskEntry(db, data);
    return c.json(taskDetails);
  } catch (e) {
    return c.text(e.message, 401);
  }
};

export const updateTaskStatus = async (c) => {
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

    removeTaskEntry(db, data);
    return c.text("deletion successful");
  } catch (e) {
    return c.text(e.message, 404);
  }
};

export const removeTodo = async (c) => {
  const data = await c.req.json();
  const db = c.get("db");

  try {
    if (isNotInDB(db, data.id, "todos")) throw new Error("todo not found");

    removeTodoEntry(db, data);
    return c.text("deletion successful");
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

export const getAllTodos = (c) => {
  const todos = {
    "todo-1": {
      title: "todo-one",
      tasks: {
        "task-1": { title: "task-one", isDone: 0 },
      },
    },
    "todo-2": {
      title: "todo-two",
      tasks: {
        "task-1": { title: "task-one", isDone: 1 },
      },
    },
  };

  return c.json(todos);
};
