/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { BESAdminEditHandler } from '../EditHandler';
import { uploadImage } from '../utilities';

export class EditProject extends BESAdminEditHandler {
  // Fetch the code of the project, as this is needed as a unique identifier to upload the images to S3.
  // Also fetch the existing image_url and logo_url, so we can delete the old images from S3.
  async getFields() {
    const project = await this.models.project.findById(this.recordId, {
      columns: ['code', 'image_url', 'logo_url'],
    });
    return project;
  }

  // Before updating the project, if the image_url and logo_url have changed, we need to upload the new images to S3 and update the image_url and logo_url fields with the new urls. This also will handle deleting of the image_url and logo_url fields, as the uploadImage function will return the original value if the encoded image is null or not a base64 encoded image.
  async updateRecord() {
    const {
      image_url: encodedBackgroundImage,
      logo_url: encodedLogoImage,
      code: updatedCode,
    } = this.updatedFields;
    const updatedFields = { ...this.updatedFields };

    const {
      image_url: existingBackgroundImage,
      logo_url: existingLogoImage,
      code: existingCode,
    } = await this.getFields();
    console.log('existingCode', existingCode);

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
    await this.models.project.updateById(this.recordId, updatedFields);
  }
}
