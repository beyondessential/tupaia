export const sleepAsync = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
