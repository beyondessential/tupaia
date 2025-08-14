const extractParams = template =>
  [...template.matchAll(/(?<=\{)(.*?)(?=\})/gi)].map(matchArray => matchArray[1]);

export const makeSubstitutionsInString = (template, variables) => {
  const params = extractParams(template);
  return params.reduce((str, param) => str.replace(`{${param}}`, variables[param]), template);
};
