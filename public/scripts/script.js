const parse = (e) => {
  const child = e.target;
  const selector = child.id || child.className;

  return { child, selector };
};

const logOut = () => {
  console.log("logout called");
};

const deleteItem = (element) => {
  const container =
    element.closest(".tasks-container") || element.closest("main");
  const parent = element.closest(".task-card") || element.closest(".todo-card");

  if (parent.className === "todo-card") {
    const hrElem = parent.previousElementSibling;
    hrElem.tagName === "HR" && container.removeChild(hrElem);
  }

  container.removeChild(parent);
};

const changeStatus = (element) => {
  const container = element.closest(".task-card");
  console.log("changing status", { element, container });
};

const createTemplateCard = (
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

const createTodo = (container, content) => {
  const card = createTemplateCard(
    "todo-card-template",
    "section",
    ".todo-title",
    content,
  );

  document.querySelectorAll(".todo-card").length > 1 &&
    container.appendChild(document.createElement("hr"));
  container.appendChild(card);
};

const createTask = (container, content) => {
  const card = createTemplateCard(
    "task-card-template",
    "article",
    ".task-title",
    content,
  );

  container.appendChild(card);
};

const saveEdit = (input) => (action) => {
  console.log("saving", action);
  const className = input.className;

  if (action === "create") {
    const container =
      input.closest(".tasks-container") || input.closest("main");
    const content = input.value;
    input.value = "";

    const createCard = {
      MAIN: createTodo,
      SECTION: createTask,
    };

    return createCard[container.tagName](container, content);
  }

  if (className === "task-title" || className === "todo-title")
    input.setAttribute("readonly", true);
};

const makeEditable = (input) => {
  input.removeAttribute("readonly");
  input.focus();

  const len = input.value.length;
  input.setSelectionRange(len, len);

  input.addEventListener("blur", saveEdit(input), { once: true });
};

const attachListeners = () => {
  const body = document.querySelector("body");
  body.addEventListener("click", (e) => {
    const actions = {
      logout: logOut,
      delete: deleteItem,
      status: changeStatus,
    };

    const { selector, child } = parse(e);

    actions[selector](child);
  });

  body.addEventListener("dblclick", (e) => {
    const { child: input } = parse(e);
    makeEditable(input);
  });

  body.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const { child: input, selector } = parse(e);
      if (["task-name", "todo-name"].includes(selector)) {
        return saveEdit(input)("create");
      }

      input.blur();
    }
  });
};

document.addEventListener("DOMContentLoaded", attachListeners);
