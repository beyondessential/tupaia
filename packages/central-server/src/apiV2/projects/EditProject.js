import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';
import { uploadImage } from '../utilities';
import { getCountryEntityId } from './getCountryEntityId';

const assertCanEditProject = async (accessPolicy, models, recordId) => {
  assertAdminPanelAccess(accessPolicy);
  const project = ensure(
    await models.project.findById(recordId),
    `No project exists with ID ${recordId}`,
  );
  const hasAdminAccess = await project.hasAdminAccess(accessPolicy);
  if (!hasAdminAccess) {
    throw new PermissionsError('Need Tupaia Admin Panel access to this project to edit');
  }
  return true;
};

export class EditProject extends EditHandler {
  async assertUserHasAccess() {
    const permissionChecker = accessPolicy =>
      assertCanEditProject(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, permissionChecker]));
  }

  // Fetch the code of the project, as this is needed as a unique identifier to upload the images to S3.
  // Also fetch the existing image_url and logo_url, so we can delete the old images from S3.
  async getFields() {
    const project = await this.models.project.findById(this.recordId, {
      columns: ['code', 'image_url', 'logo_url'],
    });
    return project;
  }

  async editRecord() {
    await this.updateRecord();
  }

  // Before updating the project, if the image_url and logo_url have changed, we need to upload the new images to S3 and update the image_url and logo_url fields with the new urls. This also will handle deleting of the image_url and logo_url fields, as the uploadImage function will return the original value if the encoded image is null or not a base64 encoded image.
  async updateRecord() {
    const {
      image_url: encodedBackgroundImage,
      logo_url: encodedLogoImage,
      code: updatedCode,
      sort_order: updatedSortOrder,
    } = this.updatedFields;
    // `countries` is a relation (project_country), not a project column, so keep
    // it out of the record update and reconcile it separately.
    const { countries, ...updatedFields } = this.updatedFields;

    const {
      image_url: existingBackgroundImage,
      logo_url: existingLogoImage,
      code: existingCode,
    } = await this.getFields();

    const code = updatedCode || existingCode;
    // check first if field is undefined, as we don't want to upload an image if the field is not being updated, since this might cause the field to be reset
    if (encodedBackgroundImage !== undefined) {
      updatedFields.image_url = await uploadImage(
        encodedBackgroundImage,
        code,
        'project_image',
        true,
        existingBackgroundImage,
      );
    }
    if (encodedLogoImage !== undefined) {
      updatedFields.logo_url = await uploadImage(
        encodedLogoImage,
        code,
        'project_logo',
        true,
        existingLogoImage,
      );
    }
    // If the sort_order is an empty string, we want to set the sort_order to null, as the sort_order field is an integer and an empty string will cause an error
    if (updatedSortOrder === '') {
      updatedFields.sort_order = null;
    }

    await this.models.wrapInTransaction(async transactingModels => {
      await transactingModels.project.updateById(this.recordId, updatedFields);
      if (countries !== undefined) {
        await this.reconcileProjectCountries(transactingModels, countries);
      }
    });
  }

  // Bring project_country into line with the selected `country` table ids:
  // add links for newly-selected countries, remove deselected ones.
  async reconcileProjectCountries(models, countryIds) {
    const desiredEntityIds = [];
    for (const countryId of countryIds) {
      desiredEntityIds.push(await getCountryEntityId(models, countryId));
    }

    const existingLinks = await models.projectCountry.find({ project_id: this.recordId });
    const existingEntityIds = existingLinks.map(link => link.country_id);

    const toAdd = desiredEntityIds.filter(id => !existingEntityIds.includes(id));
    const toRemove = existingEntityIds.filter(id => !desiredEntityIds.includes(id));

    for (const countryId of toAdd) {
      await models.projectCountry.create({ project_id: this.recordId, country_id: countryId });
    }
    if (toRemove.length > 0) {
      await models.projectCountry.delete({ project_id: this.recordId, country_id: toRemove });
    }
  }
}
