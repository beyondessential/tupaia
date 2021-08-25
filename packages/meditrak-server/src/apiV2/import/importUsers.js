/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import {
  respond,
  DatabaseError,
  ImportValidationError,
  UploadError,
  ObjectValidator,
  hasContent,
  constructIsOneOf,
} from '@tupaia/utils';
import { hashAndSaltPassword } from '@tupaia/auth';
import { assertBESAdminAccess } from '../../permissions';

export async function importUsers(req, res) {
  await req.assertPermissions(assertBESAdminAccess);

  try {
    const { models } = req;
    if (!req.file) {
      throw new UploadError();
    }
    const userObjectValidator = new ObjectValidator(FIELD_VALIDATORS);
    const workbook = xlsx.readFile(req.file.path);
    await models.wrapInTransaction(async transactingModels => {
      for (const countries of Object.entries(workbook.Sheets)) {
        const [countryName, sheet] = countries;
        const countryEntity = await transactingModels.entity.findOrCreate({ name: countryName });
        const users = xlsx.utils.sheet_to_json(sheet);
        const emails = []; // An array to hold all emails, allowing duplicate checking
        for (let i = 0; i < users.length; i++) {
          const userObject = users[i];
          const excelRowNumber = i + 2;
          const constructImportValidationError = (message, field) =>
            new ImportValidationError(message, excelRowNumber, field, countryName);
          await userObjectValidator.validate(userObject, constructImportValidationError);
          if (emails.includes(userObject.email)) {
            throw new ImportValidationError(
              `${userObject.email} is not unique`,
              excelRowNumber,
              'email',
              countryName,
            );
          }
          emails.push(userObject.email);
          const { password, permission_group: permissionGroupName, ...restOfUser } = userObject;
          const userToUpsert = {
            ...restOfUser,
            ...hashAndSaltPassword(password),
          };
          const user = await transactingModels.user.updateOrCreate(
            { email: userObject.email },
            userToUpsert,
          );

          const permissionGroup = await transactingModels.permissionGroup.findOrCreate({
            name: permissionGroupName,
          });
          if (!permissionGroup) {
            throw new ImportValidationError(
              `${permissionGroupName} is not a valid permission group`,
              excelRowNumber,
              'permission_group',
              countryName,
            );
          }
          await transactingModels.userEntityPermission.findOrCreate({
            user_id: user.id,
            entity_id: countryEntity.id,
            permission_group_id: permissionGroup.id,
          });
        }
      }
    });
    respond(res, { message: 'Imported users' });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('importing users', error);
    }
  }
}

const FIELD_VALIDATORS = {
  first_name: [hasContent],
  last_name: [],
  email: [hasContent],
  gender: [hasContent, constructIsOneOf(['f', 'm'])],
  employer: [hasContent],
  position: [hasContent],
  mobile_number: [],
  password: [hasContent],
  permission_group: [hasContent],
};
