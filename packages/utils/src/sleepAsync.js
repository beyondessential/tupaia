export const sleepAsync = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
