import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';
import { uploadImage } from '../utilities';

const assertCanEditProject = async (accessPolicy, models, recordId) => {
  assertAdminPanelAccess(accessPolicy);
  const project = await models.project.findById(recordId);
  if (!project) {
    throw new Error(`No project found with id ${recordId}`);
  }
  const hasAdminAccess = await project.hasAdminAccess(accessPolicy);
  if (!hasAdminAccess) throw new Error('Need Tupaia Admin Panel access to this project to edit');
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
    const updatedFields = { ...this.updatedFields };

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
    await this.models.project.updateById(this.recordId, updatedFields);
  }
}
