import { saveChanges } from "./dom.js";
import { changeStatus, deleteItem, logOut, makeEditable } from "./handlers.js";
import { getTargetAtrrbs } from "./utils.js";

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
    e.key === "Enter" && saveChanges(e);
  });
};

document.addEventListener("DOMContentLoaded", attachListeners);
