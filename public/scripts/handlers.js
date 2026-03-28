import { createTask, createTodo } from "./dom.js";
import { getClosestContainer, post, toJSON } from "./utils.js";

export const logOut = () => {
  console.log("logout called");
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

export const changeStatus = (element) => {
  console.log("will update later");
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

export const saveEdit = (input) => (action) => {
  const className = input.className;

  if (action === "create") {
    const container = getClosestContainer(input, ".tasks-container", "main");
    const content = input.value;

    if (content.length === 0) return;

    input.value = "";
    console.log(container, input);

    const createCard = {
      MAIN: todoCreator,
      SECTION: taskCreator,
    };

    return createCard[container.tagName](container, content);
  }

  if (className.endsWith("title")) input.setAttribute("readonly", true);
};

export const makeEditable = (input) => {
  input.removeAttribute("readonly");
  input.focus();

  const len = input.value.length;
  input.setSelectionRange(len, len);

  input.addEventListener("blur", saveEdit(input), { once: true });
};
