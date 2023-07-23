/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { BESAdminCreateHandler } from '../CreateHandler';
import { uploadImage } from '../utilities';
/**
 * Handles POST endpoints:
 * - /feedItems
 */

export class CreateFeedItems extends BESAdminCreateHandler {
  async createRecord() {
    const {
      country_id,
      permission_group_id,
      creation_date,
      template_variables: { title, image, body, link },
      type,
      geographical_area_id,
      user_id,
      record_id,
    } = this.newRecordData;

    const newFeedItem = await this.models.feedItem.create({
      country_id,
      permission_group_id,
      creation_date,
      template_variables: {
        title,
        image: '',
        body,
        link,
      },
      type,
      geographical_area_id,
      user_id,
      record_id,
    });

    await this.insertImagePath(this.models, image, newFeedItem);
  }

  async insertImagePath(models, base64Image, newFeedItem) {
    const update = {
      template_variables: {
        ...newFeedItem.template_variables,
        image: await uploadImage(base64Image),
      },
    };
    return models.feedItem.updateById(newFeedItem.id, update);
  }
}
