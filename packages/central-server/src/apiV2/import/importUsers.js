import xlsx from 'xlsx';
import {
  respond,
  DatabaseError,
  ImportValidationError,
  UploadError,
  ObjectValidator,
  hasContent,
  constructIsOneOf,
  constructIsEmptyOr,
} from '@tupaia/utils';
import { hashAndSaltPassword } from '@tupaia/auth';
import { VerifiedEmail } from '@tupaia/types';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  assertAdminPanelAccessToCountry,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';

export async function importUsers(req, res) {
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
        const emails = new Set(); // A set to hold all emails, allowing duplicate checking
        for (let i = 0; i < users.length; i++) {
          const userObject = users[i];
          const excelRowNumber = i + 2;
          const constructImportValidationError = (message, field) =>
            new ImportValidationError(message, excelRowNumber, field, countryName);
          await userObjectValidator.validate(userObject, constructImportValidationError);
          if (emails.has(userObject.email)) {
            throw new ImportValidationError(
              `${userObject.email} is not unique`,
              excelRowNumber,
              'email',
              countryName,
            );
          }
          emails.add(userObject.email);
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

          const createUserPermissionChecker = async accessPolicy => {
            await assertAdminPanelAccessToCountry(
              accessPolicy,
              transactingModels,
              countryEntity.id,
            );
            if (!accessPolicy.allows(countryEntity.code, permissionGroup.name)) {
              throw new Error(`Need ${permissionGroup.name} access to ${countryEntity.name}`);
            }
          };

          try {
            await req.assertPermissions(
              assertAnyPermissions([assertBESAdminAccess, createUserPermissionChecker]),
            );
          } catch (error) {
            throw new ImportValidationError(
              error.message,
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
  gender: [constructIsEmptyOr(constructIsOneOf(['f', 'm', 'unknown']))],
  employer: [hasContent],
  position: [hasContent],
  mobile_number: [],
  password: [hasContent],
  permission_group: [hasContent],
  verified_email: [constructIsEmptyOr(constructIsOneOf(Object.values(VerifiedEmail)))],
};
