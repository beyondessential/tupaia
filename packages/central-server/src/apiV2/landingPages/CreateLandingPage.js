/* eslint-disable camelcase */
import { TupaiaAdminCreateHandler } from '../CreateHandler';
import { uploadImage } from '../utilities';

export class CreateLandingPage extends TupaiaAdminCreateHandler {
  async createRecord() {
    const { url_segment, image_url, logo_url } = this.newRecordData;

    await this.models.wrapInTransaction(async transactingModels => {
      // Add the landing page, and then upload the images afterward, so that if an error is caught when creating the record, the images aren't uploaded unnecessarily
      const newLandingPage = await transactingModels.landingPage.create({
        ...this.newRecordData,
        image_url: '',
        logo_url: '',
      });
      await this.insertImagePaths(
        transactingModels,
        newLandingPage.id,
        url_segment,
        image_url,
        logo_url,
      );

      return newLandingPage;
    });
  }

  async insertImagePaths(
    models,
    landingPageId,
    landingPageUrlSegment,
    encodedBackgroundImage,
    encodedLogoImage,
  ) {
    // image_url and logo_url are currently required fields, so the validator will error before this point if either of these is falsey.
    const updates = {
      image_url: await uploadImage(
        encodedBackgroundImage,
        landingPageUrlSegment,
        'landing_page_image',
        true,
      ),
      logo_url: await uploadImage(
        encodedLogoImage,
        landingPageUrlSegment,
        'landing_page_logo',
        true,
      ),
    };
    // The record has already been updated, so update the existing record with the new fields
    return models.landingPage.updateById(landingPageId, updates);
  }
}
