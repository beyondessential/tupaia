import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { EditHandler } from '../EditHandler';
import { uploadImage } from '../utilities';
import { assertUserHasAccessToLandingPage } from './assertUserHasAccessToLandingPage';

export class EditLandingPage extends EditHandler {
  // Fetch the url_segment and existing image paths for the landing page
  async getFields() {
    const landingPage = await this.models.landingPage.findById(this.recordId, {
      columns: ['url_segment', 'image_url', 'logo_url'],
    });
    return landingPage;
  }

  async assertUserHasAccess() {
    const landingPageChecker = accessPolicy =>
      assertUserHasAccessToLandingPage(this.models, accessPolicy, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, landingPageChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }

  // Before updating the landingPage, if the image_url and logo_url have changed, we need to upload the new images to S3 and update the image_url and logo_url fields with the new urls.
  // If image_url/logo_url are undefined, then we are not editing them and can just update the record as normal.
  // If image_url/logo_url are null or empty strings, then we are removing the image.
  async updateRecord() {
    const { image_url: encodedBackgroundImage, logo_url: encodedLogoImage } = this.updatedFields;
    const updatedFields = { ...this.updatedFields };

    // Grab the existing image urls and the landing page url_segment (as this is not editable at this stage) so we can use them for image upload handling
    const {
      url_segment: urlSegment,
      image_url: backgroundImageUrl,
      logo_url: logoImageUrl,
    } = await this.getFields();

    // check first if field is undefined, as we don't want to upload an image if the field is not being updated, since this might cause the field to be reset
    if (encodedBackgroundImage !== undefined) {
      updatedFields.image_url = await uploadImage(
        encodedBackgroundImage,
        urlSegment,
        'landing_page_background_image',
        true,
        backgroundImageUrl,
      );
    }
    if (encodedLogoImage !== undefined) {
      updatedFields.logo_url = await uploadImage(
        encodedLogoImage,
        urlSegment,
        'landing_page_logo_image',
        true,
        logoImageUrl,
      );
    }
    await this.models.landingPage.updateById(this.recordId, updatedFields);
  }
}
