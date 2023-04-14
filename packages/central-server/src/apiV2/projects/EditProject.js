/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import AWS from 'aws-sdk';
import { S3Client } from '@tupaia/utils';
import { BESAdminEditHandler } from '../EditHandler';

export class EditProject extends BESAdminEditHandler {
  async uploadImage(encodedImage = '', projectCode, type) {
    // If the image is not a base64 encoded image, then it is already a url to an image in S3, so we can just return that url as it is. This is to maintain backwards compatibility with the old way of uploading images. This should in theory never happen, but to be safe we will check first.
    if (!encodedImage || !encodedImage.includes('data:image')) return encodedImage;
    const s3Client = new S3Client(new AWS.S3());
    // Upload the image with a standardised file name and upload to s3
    const imagePath = await s3Client.uploadImage(encodedImage, `${projectCode}_${type}`, true);
    return imagePath;
  }

  // Before updating the project, if the image_url and logo_url have changed, we need to upload the new images to S3 and update the image_url and logo_url fields with the new urls.
  async updateRecord() {
    const { image_url, logo_url, code } = this.updatedFields;
    const updatedFields = { ...this.updatedFields };

    if (image_url) {
      updatedFields.image_url = await this.uploadImage(image_url, code, 'project_image');
    }
    if (logo_url) {
      updatedFields.logo_url = await this.uploadImage(logo_url, code, 'project_logo');
    }
    await this.models.project.updateById(this.recordId, updatedFields);
  }
}
