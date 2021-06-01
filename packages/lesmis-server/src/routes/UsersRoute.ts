/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import groupby from 'lodash.groupby';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';

const FIELDS: Record<string, string> = {
  'user.creation_date': 'createdAt',
  user_id: 'id',
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

const PERMISSION_GROUPS = ['Laos Schools Admin', 'LESMIS Public', 'Laos Schools Super User'];

const getProcessedUserData = (userData: any[]) => {
  // Consolidate user entity permission redords into an array of users with an array of permissionGroupNames
  const userDataByUserId = groupby(userData, 'user_id');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const users = Object.entries(userDataByUserId).map(([userId, userRecords]) => {
    const permissions = userRecords.map(record => record['permission_group.name']);
    return { ...userRecords[0], 'permission_group.name': [...new Set(permissions)] };
  });

  // Convert user keys to nice camelCase keys for the front end
  return users.map((user: Record<string, string[]>) => {
    const obj: Record<string, string[]> = {};
    const keys = Object.keys(user);
    keys.forEach(key => {
      const newKey = FIELDS[key];
      obj[newKey] = user[key];
    });
    return obj;
  });
};

export class UsersRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const userData = await this.meditrakConnection.getUserEntityPermissions({
      pageSize: '10000',
      columns: JSON.stringify(Object.keys(FIELDS)),
      sort: JSON.stringify(['user.creation_date DESC']),
      filter: JSON.stringify({
        'entity.name': { comparator: 'like', comparisonValue: 'Laos', castAs: 'text' },
        'permission_group.name': { comparator: 'in', comparisonValue: PERMISSION_GROUPS },
      }),
    });

    return getProcessedUserData(userData);
  }
}
