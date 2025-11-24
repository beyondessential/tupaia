const getCurrentPackage = () => {
  const cwd = process.cwd();
  const packageName = cwd.match(/packages\/([^\\/]+)$/)?.[1];
  return packageName ? `@tupaia/${packageName}` : `<unknown package> (${cwd})`;
};

export const requireEnv = variable => {
  const value = process.env[variable];
  if (value === undefined) {
    throw new Error(
      `Could not load env variable '${variable}', required in ${getCurrentPackage()}`,
    );
  }
  return value;
};

export const getEnvVarOrDefault = (variable, defaultValue) => {
  const value = process.env[variable];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
};
