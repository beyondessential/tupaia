/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import uniqby from 'lodash.uniqby';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';
import { LESMIS_PERMISSION_GROUPS } from '../constants';

const FIELDS: Record<string, string> = {
  user_id: 'id',
  'user.creation_date': 'createdAt',
  'user.first_name': 'firstName',
  'user.last_name': 'lastName',
  'user.email': 'email',
  'user.mobile_number': 'mobileNumber',
  'user.employer': 'employer',
  'user.position': 'position',
  'entity.name': 'entityName',
  'entity.code': 'entityCode',
  'permission_group.name': 'permissionGroupName',
  id: 'userEntityPermissionId',
};

// Remove duplicate records and convert user keys to nice camelCase keys for the front end
const getProcessedUserData = (userData: { user_id: number }[]) =>
  uniqby(userData, 'user_id').map((user: Record<string, string[]>) => {
    const newUser: Record<string, string[]> = {};
    const keys = Object.keys(user);
    keys.forEach(key => {
      const newKey = FIELDS[key];
      newUser[newKey] = user[key];
    });
    return newUser;
  });

export class UsersRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const userData = await this.meditrakConnection.getUserEntityPermissions({
      pageSize: '10000', // retrieve all entries, as we don't handle pagination
      columns: JSON.stringify(Object.keys(FIELDS)),
      sort: JSON.stringify(['user.creation_date DESC']),
      filter: JSON.stringify({
        'entity.code': 'LA',
        'permission_group.name': {
          comparator: 'in',
          comparisonValue: Object.values(LESMIS_PERMISSION_GROUPS),
        },
      }),
    });

    return getProcessedUserData(userData);
  }
}
