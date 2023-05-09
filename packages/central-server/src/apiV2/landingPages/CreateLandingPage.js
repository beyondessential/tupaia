/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */
import AWS from 'aws-sdk';
import { S3Client } from '@tupaia/utils';
import { BESAdminCreateHandler } from '../CreateHandler';
import { getStandardisedImageName } from '../../utilities';

export class CreateLandingPage extends BESAdminCreateHandler {
  async uploadImage(encodedImage, landingPageUrlSegment, type) {
    const s3Client = new S3Client(new AWS.S3());
    // Upload the image with a standardised file name and upload to s3.
    const imagePath = await s3Client.uploadImage(
      encodedImage,
      getStandardisedImageName(landingPageUrlSegment, type),
      true,
    );
    return imagePath;
  }

  async createRecord() {
    const { url_segment, image_url, logo_url } = this.newRecordData;

    await this.models.wrapInTransaction(async transactingModels => {
      // Add the project, and then upload the images afterward, so that if an error is caught when creating the record, the images aren't uploaded unnecessarily
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

  async insertImagePaths(models, landingPageId, landingPageUrlSegment, imageUrl, logoUrl) {
    // image_url and logo_url are currently required fields, so the validator will error before this point if either of these is falsey.
    const updates = {
      image_url: await this.uploadImage(imageUrl, landingPageUrlSegment, 'landing_page_image'),
      logo_url: await this.uploadImage(logoUrl, landingPageUrlSegment, 'landing_page_logo'),
    };
    // The record has already been updated, so update the existing record with the new fields
    return models.landingPage.updateById(landingPageId, updates);
  }
}
