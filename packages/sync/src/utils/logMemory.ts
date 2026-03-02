export const logMemory = () => {
  const mem = (performance as any)?.memory;
  if (mem) {
    console.debug('Used:', Math.round(mem.usedJSHeapSize / 1024 / 1024), 'MB');
    console.debug('Total:', Math.round(mem.totalJSHeapSize / 1024 / 1024), 'MB');
    console.debug('Limit:', Math.round(mem.jsHeapSizeLimit / 1024 / 1024), 'MB');
  }
};
