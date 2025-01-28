const getCurrentPackage = () => {
  const [, packageName] = process.cwd().match(/packages\/([^\\/]+)$/);
  return packageName ? `@tupaia/${packageName}` : '';
};

export const requireEnv = variable => {
  const value = process.env[variable];
  if (value === undefined) {
    throw new Error(
      `Could not load env variable '${variable}', required in ${getCurrentPackage()} `,
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
