/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import {
  respond,
  ImportValidationError,
  UploadError,
  ObjectValidator,
  constructRecordExistsWithCode,
  constructRecordExistsWithField,
  DatabaseError,
} from '@tupaia/utils';
import { assertBESAdminAccess } from '../../permissions';

const extractItems = filePath => {
  const { Sheets: sheets } = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(Object.values(sheets)[0]);
};

async function create(transactingModels, items) {
  const validator = new ObjectValidator({
    user_email: [constructRecordExistsWithField(transactingModels.user, 'email')],
    entity_code: [
      constructRecordExistsWithCode(transactingModels.entity),
      async entityCode => {
        const entity = await transactingModels.entity.findOne({ code: entityCode });
        if (entity.type !== 'country') {
          throw new Error(
            `Only country level permissions are currently supported. Entity "${entity.code}" is: "${entity.type}"`,
          );
        }
      },
    ],
    permission_group_name: [
      constructRecordExistsWithField(transactingModels.permissionGroup, 'name'),
    ],
  });

  let excelRowNumber = 0;

  const constructImportValidationError = (message, field) =>
    new ImportValidationError(message, excelRowNumber, field);

  for (const item of items) {
    excelRowNumber++;
    await validator.validate(item, constructImportValidationError);

    const { user_email, entity_code, permission_group_name } = item;

    const user = await transactingModels.user.findOne({ email: user_email });
    const entity = await transactingModels.entity.findOne({ code: entity_code });
    const permissionGroup = await transactingModels.permissionGroup.findOne({
      name: permission_group_name,
    });

    const existingRecord = await transactingModels.userEntityPermission.findOne({
      user_id: user.id,
      entity_id: entity.id,
      permission_group_id: permissionGroup.id,
    });
    if (existingRecord) {
      // Already added
      console.info(
        `User permission ${user.id} / ${entity.id} / ${permissionGroup.id} already exists, skipping`,
      );
      continue;
    } else {
      await transactingModels.userEntityPermission.create({
        user_id: user.id,
        entity_id: entity.id,
        permission_group_id: permissionGroup.id,
      });
    }
  }
}

/**
 * Responds to POST requests to the /import/userPermissions endpoint
 */
export async function importUserPermissions(req, res) {
  const { models } = req;

  await req.assertPermissions(assertBESAdminAccess);

  let items;
  try {
    items = extractItems(req.file.path);
  } catch (error) {
    throw new UploadError(error);
  }

  await models.wrapInTransaction(async transactingModels => {
    await create(transactingModels, items);
    respond(res, { message: `Imported User Permissions` });
  });
}
