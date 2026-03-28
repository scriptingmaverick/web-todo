import { createTask, createTodo } from "./dom.js";
import { getClosestContainer, post, toJSON } from "./utils.js";

export const logOut = async () => {
  const response = await post("/logout");

  if (response.status !== 200) return alert("logout unsuccessful");

  globalThis.location.reload();
};

export const deleteItem = async (element) => {
  const container = getClosestContainer(element, ".tasks-container", "main");
  const parent = getClosestContainer(element, ".task-card", ".todo-card");
  const req = {
    data: { id: parent.id },
    endPoint: "/remove-task",
  };

  if (parent.className === "todo-card") {
    const hrElem = parent.previousElementSibling;
    hrElem.tagName === "HR" && container.removeChild(hrElem);

    req.endPoint = "/remove-todo";
  }

  const response = await post(req.endPoint, req.data);

  if (response.status !== 200) return alert("deletion unsuccessful");

  container.removeChild(parent);
};

export const changeStatus = async (element) => {
  const todoId = element.closest(".todo-card").id;
  const id = element.closest(".task-card").id;
  const response = await post("/toggle-task", { todoId, id });

  if (response.status !== 200) return alert("changing of status unsuccessful");
};

export const todoCreator = async (container, title) => {
  const username = document.getElementById("user-name").textContent;

  const data = await post("/create-todo", { title, username });

  if (data.status !== 200) return alert("creation of todo unsuccessful");

  createTodo(container, await toJSON(data));
};

export const taskCreator = async (container, title) => {
  const todoContainer = container.closest(".todo-card");
  const data = await post("/create-task", {
    title,
    todoId: todoContainer.id,
  });

  if (data.status !== 200) return alert("creation of task unsuccessful");

  createTask(container, await toJSON(data));
};

export const handleCreation = (input) => {
  const container = getClosestContainer(input, ".tasks-container", "main");
  const content = input.value;
  input.value = "";

  if (content.length === 0) return;

  const createCard = {
    MAIN: todoCreator,
    SECTION: taskCreator,
  };

  return createCard[container.tagName](container, content);
};

export const handleUpdation = async (input) => {
  const container = getClosestContainer(input, ".task-card", ".todo-card");
  const req = {
    endPoint: "/update-task",
    data: { id: container.id, newTitle: input.value },
  };

  if (container.className === "todo-card") req.endPoint = "/update-todo";

  const response = await post(req.endPoint, req.data);

  if (response.status !== 200) return alert("Updating unsuccessful");

  input.setAttribute("readonly", true);
};

export const saveEdit = (input) => (action) => {
  const className = input.className;

  if (action === "create") return handleCreation(input);

  if (className.endsWith("title")) return handleUpdation(input);
};

export const makeEditable = (input) => {
  input.removeAttribute("readonly");
  input.focus();

  const len = input.value.length;
  input.setSelectionRange(len, len);

  input.addEventListener("blur", saveEdit(input), { once: true });
};
