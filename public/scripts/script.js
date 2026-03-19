const parse = (e) => {
  const parent = e.target.parentElement;
  const child = e.target;
  const selector = child.className || child.id;

  return { parent, child, selector };
};

const logOut = () => {
  console.log("logout called");
};

const deleteItem = (element) => {
  const container =
    element.closest(".tasks-container") || element.closest("main");
  const parent = element.closest(".task-card") || element.closest(".todo-card");

  container.removeChild(parent);
};

const changeStatus = (element) => {
  const container = element.closest(".task-card");
  console.log("changing status", { element, container });
};

const saveEdit = (input) => () => {
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

    const attrbs = parse(e);

    actions[attrbs.selector](attrbs.child);
  });

  body.addEventListener("dblclick", (e) => {
    const attrbs = parse(e);
    makeEditable(attrbs.child);
  });

  body.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const attrbs = parse(e);
      console.log({ type: "Enter", ...attrbs });
    }
  });
};

document.addEventListener("DOMContentLoaded", attachListeners);
