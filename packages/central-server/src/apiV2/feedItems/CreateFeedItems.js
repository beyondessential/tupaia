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
      geographical_area_id,
      user_id,
      record_id,
    });

    // await this.insertImagePath(newFeedItem.id, image);
    return newFeedItem;
  }

  // async insertImagePath(models, base64Image, feedItemId) {
  //   const update = {
  //     image: await uploadImage(base64Image),
  //   };
  //   // console.log(feedItemId);
  //   return models.feedItem.updateById(feedItemId, update);
  // }
}
