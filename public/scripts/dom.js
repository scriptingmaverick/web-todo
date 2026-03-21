import { saveEdit } from "./handlers.js";
import { getTargetAtrrbs } from "./utils.js";

export const createTemplateCard = (
  container,
  templateId,
  cardTagName,
  cardTitleClass,
  data,
) => {
  const template = container.querySelector(`#${templateId}`);
  const clone = template.content.cloneNode(true);

  const card = clone.querySelector(cardTagName);
  card.id = data.id;

  const input = card.querySelector(cardTitleClass);
  input.value = data.title;

  return card;
};

export const createTodo = (container, todo) => {
  const card = createTemplateCard(
    container,
    "todo-card-template",
    "section",
    ".todo-title",
    todo,
  );

  const cards = document.querySelectorAll(".todo-card");
  const hrElem = document.createElement("hr");

  cards.length > 1 && container.appendChild(hrElem);
  container.appendChild(card);
};

export const createTask = (container, task) => {
  const card = createTemplateCard(
    document.querySelector("main"),
    "task-card-template",
    "article",
    ".task-title",
    task,
  );

  const chbox = card.querySelector(".status");
  chbox.checked = task.status;

  container.appendChild(card);
};

export const saveChanges = (e) => {
  const { target: input, selector } = getTargetAtrrbs(e);
  if (selector.endsWith("name")) return saveEdit(input)("create");

  input.blur();
};
