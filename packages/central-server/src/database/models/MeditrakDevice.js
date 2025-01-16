import { MeditrakDeviceModel as CommonMeditrakDeviceModel } from '@tupaia/database';

export class MeditrakDeviceModel extends CommonMeditrakDeviceModel {
  notifiers = [onUpsertSanitizeConfig];
}

const onUpsertSanitizeConfig = async (change, models) => {
  if (change.type === 'delete') {
    return;
  }

  const meditrakDevice = await models.meditrakDevice.findById(change.record_id);
  if (meditrakDevice.app_version && meditrakDevice.config.unsupportedTypes) {
    delete meditrakDevice.config.unsupportedTypes;
    await meditrakDevice.save();
  }
};
