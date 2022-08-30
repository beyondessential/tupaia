let timer;

export const debounce = (func, duration) => {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, duration);
  };
};
