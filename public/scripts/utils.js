export const getTargetAtrrbs = (e) => {
  const target = e.target;
  const selector = target.id || target.className;

  return { target, selector };
};

export const getClosestContainer = (...args) => {
  const [element, ...containerNames] = args;

  for (const containerName of containerNames) {
    const container = element.closest(containerName);
    if (container) return container;
  }
};