/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
const { exec } = require('child_process');
import { MeditrakConnection } from '../connections';

export class UserRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);
    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  getBranch() {
    return new Promise((resolve, reject) => {
      return exec('git branch --show-current', (err, stdout) => {
        if (err) {
          return reject(`getBranch Error: ${err}`);
        } else {
          return resolve(stdout.trim());
        }
      });
    });
  }

  async buildResponse() {
    const user = await this.meditrakConnection.getUser();
    const branch = await this.getBranch();
    return { ...user, branch };
  }
}
