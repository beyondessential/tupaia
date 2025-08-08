const getRandomInteger = () => Math.floor(Math.random() * 1000000 + 1);

export function getUniqueFileName(originalName = '') {
  return `${Date.now()}_${getRandomInteger()}_${originalName}`;
}
