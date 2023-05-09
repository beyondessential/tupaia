/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { BESAdminEditHandler } from '../EditHandler';
import { uploadImage } from '../utilities';

export class EditLandingPage extends BESAdminEditHandler {
  // Fetch the url_segment of the landing page, as this is needed as a unique identifier to upload the images to S3. If it is being edited, then the url_segment will be in the updatedFields, otherwise it will need to be fetched from the database
  async getLandingPageUrlSegment() {
    const { url_segment: urlSegment } = this.updatedFields;
    if (urlSegment) return urlSegment;
    const landingPage = await this.models.landingPage.findById(this.recordId, {
      columns: ['url_segment'],
    });
    return landingPage.url_segment;
  }

  // Before updating the landingPage, if the image_url and logo_url have changed, we need to upload the new images to S3 and update the image_url and logo_url fields with the new urls.
  // If image_url/logo_url are undefined, then we are not editing them and can just update the record as normal.
  // If image_url/logo_url are null or empty strings, then we are removing the image.
  async updateRecord() {
    const { image_url: encodedBackgroundImage, logo_url: encodedLogoImage } = this.updatedFields;
    const updatedFields = { ...this.updatedFields };

    const urlSegment = await this.getLandingPageUrlSegment();

    // check first if field is undefined, as we don't want to upload an image if the field is not being updated, since this might cause the field to be reset
    if (encodedBackgroundImage !== undefined) {
      updatedFields.image_url = await uploadImage(
        encodedBackgroundImage,
        urlSegment,
        'landing_page_image',
      );
    }
    if (encodedLogoImage !== undefined) {
      updatedFields.logo_url = await uploadImage(encodedLogoImage, urlSegment, 'landing_page_logo');
    }
    await this.models.landingPage.updateById(this.recordId, updatedFields);
  }
}
