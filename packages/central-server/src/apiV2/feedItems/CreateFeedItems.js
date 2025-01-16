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

    await this.models.wrapInTransaction(async transactingModels => {
      const newFeedItem = await transactingModels.feedItem.create({
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

      await this.insertImagePath(transactingModels, image, newFeedItem);
    });
  }

  async insertImagePath(models, base64Image, newFeedItem) {
    const update = {
      template_variables: {
        ...newFeedItem.template_variables,
        image: await uploadImage(base64Image, newFeedItem.id, 'feed_item'),
      },
    };
    return models.feedItem.updateById(newFeedItem.id, update);
  }
}
