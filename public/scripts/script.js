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
  console.log("changing status", { container, element });
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
    console.log({ type: "clk", ...attrbs });
  });
  body.addEventListener("dblclick", (e) => {
    const attrbs = parse(e);
    console.log({ type: "dbl-clk", ...attrbs });
  });
  body.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const attrbs = parse(e);
      console.log({ type: "Enter", ...attrbs });
    }
  });
};

document.addEventListener("DOMContentLoaded", attachListeners);
