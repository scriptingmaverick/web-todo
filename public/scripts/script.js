const refine = (e) => {
  const parent = e.target.parentElement;
  const child = e.target;
  const selector = child.className || child.id;

  return { parent, child, selector };
};

const logOut = () => {
  console.log("logout called");
};

const deleteItem = (container, element) => {
  console.log("deleting", { container, element, });
};

const changeStatus = (container, element) => {
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

    const attrbs = refine(e);

    actions[attrbs.selector](attrbs.parent, attrbs.child);
    console.log({ type: "clk", ...attrbs });
  });
  body.addEventListener("dblclick", (e) => {
    const attrbs = refine(e);
    console.log({ type: "dbl-clk", ...attrbs });
  });
  body.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const attrbs = refine(e);
      console.log({ type: "Enter", ...attrbs });
    }
  });
};

document.addEventListener("DOMContentLoaded", attachListeners);
