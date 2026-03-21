import { saveChanges, createTask, createTodo } from "./dom.js";
import { changeStatus, deleteItem, logOut, makeEditable } from "./handlers.js";
import { getTargetAtrrbs } from "./utils.js";

const post = (url, body) =>
  fetch(url, {
    body,
    method: "POST",
  });

const attachListeners = () => {
  const body = document.querySelector("body");

  body.addEventListener("click", (e) => {
    const actions = {
      logout: logOut,
      delete: deleteItem,
      status: changeStatus,
    };

    const { selector, target } = getTargetAtrrbs(e);

    actions[selector](target);
  });

  body.addEventListener("dblclick", (e) => {
    const { target: input } = getTargetAtrrbs(e);
    makeEditable(input);
  });

  body.addEventListener("keydown", (e) => {
    e.target.id !== "username" && e.key === "Enter" && saveChanges(e);
  });

  body.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = Object.fromEntries(new FormData(form));

    console.log({ formData });
    const data = await post("/login", JSON.stringify(formData));
    console.log({ data, res: await data.text() });
  });
};

const getCloneOf = (container, id) => {
  const template = container.querySelector(id);
  return template.content.cloneNode(true);
};

const renderLoginPage = () => {
  console.log("render login -> ");
  const body = document.querySelector("body");
  const clone = getCloneOf(body, "#form-template");
  body.append(clone);
};

const renderHomePage = (data) => {
  console.log("in render home -> ", data);
  const body = document.querySelector("body");
  const cloneContainer = getCloneOf(body, "#home-template");

  const userName = cloneContainer.querySelector("#user-name");
  userName.textContent = data.username;

  const main = cloneContainer.querySelector("main");

  data.todosData.map(async (todo) => {
    createTodo(main, todo);
    const todoCard = main.querySelector(`#${todo.id}`);

    const tasks = await fetch(`/tasks?todo-id=${todo.id}`).then(toJSON);

    const tasksContainer = todoCard.querySelector(".tasks-container");
    tasks.forEach((task) => createTask(tasksContainer, task));

    main.appendChild(todoCard);
  });

  body.append(cloneContainer);
};

const toJSON = (data) => data.json();

const renderPage = (data) => {
  console.log("in renderer -> ", data);
  const pages = {
    login: renderLoginPage,
    home: renderHomePage,
  };

  return pages[data.page](data);
};

const renderMainPage = () =>
  fetch("/get-start-page").then(toJSON).then(renderPage);

const initializeWeb = () => renderMainPage().then(attachListeners);

document.addEventListener("DOMContentLoaded", initializeWeb);
