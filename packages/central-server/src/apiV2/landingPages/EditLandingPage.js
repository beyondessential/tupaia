/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import AWS from 'aws-sdk';
import { S3Client } from '@tupaia/utils';
import { BESAdminEditHandler } from '../EditHandler';
import { getStandardisedImageName } from '../../utilities';

export class EditLandingPage extends BESAdminEditHandler {
  async uploadImage(encodedImage = '', landingPageUrlSegment, type) {
    // If the image is not a base64 encoded image, then it is already a url to an image in S3, so we can just return that url as it is. This is on the off chance that the image is being uploaded as a url instead of an encoded image, or it is not being updated at all.
    if (!encodedImage || !encodedImage.includes('data:image')) return encodedImage;
    const s3Client = new S3Client(new AWS.S3());
    // Upload the image with a standardised file name and upload to s3
    const imagePath = await s3Client.uploadImage(
      encodedImage,
      getStandardisedImageName(landingPageUrlSegment, type),
      true,
    );
    return imagePath;
  }

  // Before updating the landingPage, if the image_url and logo_url have changed, we need to upload the new images to S3 and update the image_url and logo_url fields with the new urls. This also will handle deleting of the image_url and logo_url fields, as the uploadImage function will return the original value if the encoded image is null or not a base64 encoded image.
  async updateRecord() {
    const { image_url: imageUrl, logo_url: logoUrl, url_segment: urlSegment } = this.updatedFields;
    const updatedFields = { ...this.updatedFields };

    // check first if field is undefined, as we don't want to upload an image if the field is not being updated, since this might cause the field to be reset
    if (imageUrl !== undefined) {
      updatedFields.image_url = await this.uploadImage(imageUrl, urlSegment, 'landing_page_image');
    }
    if (logoUrl !== undefined) {
      updatedFields.logo_url = await this.uploadImage(logoUrl, urlSegment, 'landing_page_logo');
    }
    await this.models.landingPage.updateById(this.recordId, updatedFields);
  }
}
