import dotenv from 'dotenv';

export const configureDotEnv = (envFiles: string[]) => {
  const filesThatExistInSystem = envFiles.filter(file => {
    try {
      require.resolve(file);
      return true;
    } catch (error) {
      return false;
    }
  });
  dotenv.config({ path: filesThatExistInSystem, override: true });
};
