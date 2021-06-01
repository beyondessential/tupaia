/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
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

const USER_FIELDS: Record<string, string> = {
  'user_entity_permission.id': 'userEntityPermissionId',
  id: 'id',
  creation_date: 'createdAt',
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  mobile_number: 'mobileNumber',
  employer: 'employer',
  position: 'position',
  'permission_group.name': 'permissionGroupName',
  'permission_group.id': 'permissionGroupId',
  'entity.name': 'entityName',
  'entity.country_code': 'countryCode',
  'entity.code': 'entityCode',
};

const PERMISSION_GROUPS = ['Laos Schools Admin', 'Laos Schools Super User', 'LESMIS Public'];

export class UsersRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const response = await this.meditrakConnection.getUsers({
      columns: JSON.stringify(Object.keys(USER_FIELDS)),
      sort: JSON.stringify(['creation_date DESC']),
      filter: JSON.stringify({
        'entity.country_code': { comparator: 'ilike', comparisonValue: 'LA' },
        'permission_group.name': { comparator: 'in', comparisonValue: PERMISSION_GROUPS },
      }),
    });

    // const response = await this.meditrakConnection.getUserEntityPermissions({
    //   pageSize: '10000',
    //   columns: JSON.stringify(Object.keys(FIELDS)),
    //   sort: JSON.stringify(['user.creation_date DESC']),
    //   filter: JSON.stringify({
    //     'entity.name': { comparator: 'like', comparisonValue: 'Laos', castAs: 'text' },
    //     'permission_group.name': { comparator: 'in', comparisonValue: PERMISSION_GROUPS },
    //   }),
    // });

    // Convert the response keys to keys for the front end
    const users = response.map((user: Record<string, string[]>) => {
      const obj: Record<string, string[]> = {};
      const keys = Object.keys(user);
      keys.forEach(key => {
        const newKey = USER_FIELDS[key];
        obj[newKey] = user[key];
      });
      return obj;
    });

    return users;
  }
}
