/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { requireEnv } from '@tupaia/utils';
import { encryptPassword } from '@tupaia/auth';
import { ServerBoilerplateModelRegistry } from '../types';

const upsertUserAccount = async ({
  models,
  email,
  password,
  salt,
}: {
  models: ServerBoilerplateModelRegistry;
  email: string;
  password: string;
  salt: string;
}): Promise<string> => {
  const passwordHash = encryptPassword(password, salt);
  const firstName = email;
  const lastName = 'API Client';

  const existingUserAccount = await models.user.findOne({ email: email });

  if (existingUserAccount) {
    await models.user.update(
      { email: email },
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: passwordHash,
        password_salt: salt,
      },
    );
    console.log('Updated API Client (user_account)');
    return existingUserAccount.id;
  }

  const newId = generateId();
  await models.user.create({
    id: newId,
    first_name: firstName,
    last_name: lastName,
    email: email,
    password_hash: passwordHash,
    password_salt: salt,
  });
  console.log('Created API Client (user_account)');
  return newId;
};

const upsertApiClient = async ({
  models,
  userAccountId,
  username,
  password,
  salt,
}: {
  models: ServerBoilerplateModelRegistry;
  userAccountId: string;
  username: string;
  password: string;
  salt: string;
}) => {
  const secretKeyHash = encryptPassword(password, salt);

  const existingApiClient = await models.apiClient.findOne({
    username: username,
  });

  if (existingApiClient) {
    await models.apiClient.update(
      { username: username },
      {
        secret_key_hash: secretKeyHash,
        user_account_id: userAccountId,
      },
    );
    console.log('Updated API Client (api_client)');
    return;
  }
  await models.apiClient.create({
    id: generateId(),
    username: username,
    secret_key_hash: secretKeyHash,
    user_account_id: userAccountId,
  });
  console.log('Created API Client (api_client)');
};

const upsertPermissions = async ({
  models,
  userAccountId,
  permissions,
  publicAccessToAllCountries = false,
}: {
  models: ServerBoilerplateModelRegistry;
  userAccountId: string;
  permissions: { entityCode: string; permissionGroupName: string }[];
  publicAccessToAllCountries: boolean;
}) => {
  await models.userEntityPermission.delete({ user_id: userAccountId });

  const entities = await models.entity.find({ code: permissions.map(p => p.entityCode) });
  const entityIdByCode = Object.fromEntries(entities.map(entity => [entity.code, entity.id]));

  const permissionGroups = await models.permissionGroup.find({
    name: permissions.map(p => p.permissionGroupName),
  });
  const permissionGroupIdByName = Object.fromEntries(
    permissionGroups.map(permissionGroup => [permissionGroup.name, permissionGroup.id]),
  );

  await models.userEntityPermission.createMany(
    permissions.map(p => ({
      id: generateId(),
      user_id: userAccountId,
      entity_id: entityIdByCode[p.entityCode],
      permission_group_id: permissionGroupIdByName[p.permissionGroupName],
    })),
  );

  await models.userEntityPermission.createMany(
    permissions.map(p => ({
      id: generateId(),
      user_id: userAccountId,
      entity_id: entityIdByCode[p.entityCode],
      permission_group_id: permissionGroupIdByName[p.permissionGroupName],
    })),
  );

  if (publicAccessToAllCountries) {
    const publicPermissionGroup = await models.permissionGroup.findOne({ name: 'Public' });
    const allCountryCodes = (await models.country.all()).map(c => c.code);
    const countryEntities = await models.entity.find({ code: allCountryCodes });
    await models.userEntityPermission.createMany(
      countryEntities.map(e => ({
        id: generateId(),
        user_id: userAccountId,
        entity_id: e.id,
        permission_group_id: publicPermissionGroup.id,
      })),
    );
    console.log('');
  }

  console.log('Upserted API Client (user_entity_permissions)');
};

/**
 * Initialise API Client for server-server communication.
 *
 * The calling server will pass the api client credentials as an Authorisation header.
 * The receiving server will authenticate the api client.
 *
 * The permissions set defines a set of given permissions for all requests, to be
 * added to the permissions the user has, e.g. Public access to Demo Land.
 */
export const initialiseApiClient = async (
  models: ServerBoilerplateModelRegistry,
  permissions: { entityCode: string; permissionGroupName: string }[],
  publicAccessToAllCountries = false,
) => {
  const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');
  const API_CLIENT_PASSWORD = requireEnv('API_CLIENT_PASSWORD');
  const API_CLIENT_SALT = requireEnv('API_CLIENT_SALT');

  await models.wrapInTransaction(async (transactingModels: ServerBoilerplateModelRegistry) => {
    const userAccountId = await upsertUserAccount({
      models: transactingModels,
      email: API_CLIENT_NAME,
      password: API_CLIENT_PASSWORD,
      salt: API_CLIENT_SALT,
    });
    await upsertApiClient({
      models: transactingModels,
      userAccountId,
      username: API_CLIENT_NAME,
      password: API_CLIENT_PASSWORD,
      salt: API_CLIENT_SALT,
    });
    await upsertPermissions({
      models: transactingModels,
      userAccountId: userAccountId,
      permissions,
      publicAccessToAllCountries,
    });
    console.log('Initialised API Client');
  });
};
