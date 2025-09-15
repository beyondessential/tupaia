import xlsx from 'xlsx';

import { EntityTypeEnum } from '@tupaia/types';
import {
  ImportValidationError,
  ObjectValidator,
  UploadError,
  constructRecordExistsWithCode,
  constructRecordExistsWithField,
  respond,
} from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserEntityPermissionUpsertPermissions } from '../userEntityPermissions/assertUserEntityPermissionPermissions';

const extractItems = filePath => {
  const { Sheets: sheets } = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(Object.values(sheets)[0]);
};

async function create(req, transactingModels, items) {
  const validator = new ObjectValidator({
    user_email: [constructRecordExistsWithField(transactingModels.user, 'email')],
    entity_code: [
      constructRecordExistsWithCode(transactingModels.entity),
      async entityCode => {
        const entity = await transactingModels.entity.findOne({ code: entityCode });
        if (entity.type !== EntityTypeEnum.country) {
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

    const {
      user_email: email,
      entity_code: entityCode,
      permission_group_name: permissionGroupName,
    } = item;

    const user = await transactingModels.user.findOne({ email });
    const entity = await transactingModels.entity.findOne({ code: entityCode });
    const permissionGroup = await transactingModels.permissionGroup.findOne({
      name: permissionGroupName,
    });
    const userEntityPermissionData = {
      user_id: user.id,
      entity_id: entity.id,
      permission_group_id: permissionGroup.id,
    };

    const existingRecord =
      await transactingModels.userEntityPermission.findOne(userEntityPermissionData);
    if (existingRecord) {
      // Already added
      console.info(
        `User permission ${user.id} / ${entity.id} / ${permissionGroup.id} already exists, skipping`,
      );
      continue;
    } else {
      const createUserEntityPermissionChecker = async accessPolicy => {
        await assertUserEntityPermissionUpsertPermissions(
          accessPolicy,
          transactingModels,
          userEntityPermissionData,
        );
      };

      try {
        await req.assertPermissions(
          assertAnyPermissions([assertBESAdminAccess, createUserEntityPermissionChecker]),
        );
      } catch (error) {
        throw constructImportValidationError(error.message);
      }

      await transactingModels.userEntityPermission.create(userEntityPermissionData);
    }
  }
}

/**
 * Responds to POST requests to the /import/userPermissions endpoint
 */
export async function importUserPermissions(req, res) {
  const { models } = req;

  let items;
  try {
    items = extractItems(req.file.path);
  } catch (error) {
    throw new UploadError(error);
  }

  await models.wrapInTransaction(async transactingModels => {
    await create(req, transactingModels, items);
    respond(res, { message: `Imported User Permissions` });
  });
}
