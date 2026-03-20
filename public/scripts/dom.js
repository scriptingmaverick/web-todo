import { saveEdit } from "./handlers.js";
import { getTargetAtrrbs } from "./utils.js";

export const createTemplateCard = (
  templateId,
  cardTagName,
  cardTitleClass,
  content,
) => {
  const template = document.querySelector(`#${templateId}`);
  const clone = template.content.cloneNode(true);

  const card = clone.querySelector(cardTagName);
  const input = card.querySelector(cardTitleClass);

  input.value = content;

  return card;
};

export const createTodo = (container, content) => {
  const card = createTemplateCard(
    "todo-card-template",
    "section",
    ".todo-title",
    content,
  );

  const cards = document.querySelectorAll(".todo-card");
  const hrElem = document.createElement("hr");

  cards.length > 1 && container.appendChild(hrElem);
  container.appendChild(card);
};

export const createTask = (container, content) => {
  const card = createTemplateCard(
    "task-card-template",
    "article",
    ".task-title",
    content,
  );

  container.appendChild(card);
};

export const saveChanges = (e) => {
  const { target: input, selector } = getTargetAtrrbs(e);
  if (selector.endsWith("name")) return saveEdit(input)("create");

  input.blur();
};
