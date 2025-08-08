const path = require('path');
const dotenv = require('dotenv');

export const configureEnv = () => {
  dotenv.config({
    path: [
      path.resolve(__dirname, '../../../env/db.env'),
      path.resolve(__dirname, '../../../env/pg.env'),
      path.resolve(__dirname, '../../../env/platform.env'),
    ],
  });
};
