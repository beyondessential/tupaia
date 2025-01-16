import { BESAdminEditHandler } from '../EditHandler';
import { uploadImage } from '../utilities';
/**
 * Handles PUT endpoints:
 *  - /feedItems
 */

export class EditFeedItems extends BESAdminEditHandler {
  async getFields() {
    const feedItem = await this.models.feedItem.findById(this.recordId, {
      columns: ['template_variables'],
    });
    return feedItem;
  }

  async updateRecord() {
    const {
      template_variables: {
        title: updatedTitle,
        image: base64Image,
        body: updatedBody,
        link: updatedLink,
      },
    } = this.updatedFields;
    const updatedFields = { ...this.updatedFields };

    const {
      template_variables: {
        title: existingTitle,
        image: existingImage,
        body: existingBody,
        link: existingLink,
      },
    } = await this.getFields();

    if (base64Image !== undefined) {
      updatedFields.template_variables = {
        title: updatedTitle || existingTitle,
        image: await uploadImage(base64Image, this.recordId, 'feed_item', true, existingImage),
        body: updatedBody || existingBody,
        link: updatedLink || existingLink,
      };
      await this.models.feedItem.updateById(this.recordId, updatedFields);
    }
  }
}
