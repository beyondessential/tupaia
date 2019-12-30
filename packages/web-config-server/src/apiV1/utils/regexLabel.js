export const regexLabel = (label, regex) => {
  if (!regex) {
    return label;
  }
  return label.match(new RegExp(regex, 'g'))[0];
};
