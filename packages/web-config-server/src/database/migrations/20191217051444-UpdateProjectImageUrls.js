'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const PROJECT_IMAGE_URLS = {
  imms: {
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/imms_background.jpg',
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/gates_logo.png',
  },
  fanafana: {
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/fanafana_background.jpg',
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/fanafana_logo.png',
  },
  disaster: {
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/disaster_background.png',
  },
  strive: {
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/strive_background.jpg',
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/strive_logo.svg',
  },
  wish: {
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/wish_background.jpg',
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/wish_logo.svg',
  },
  unfpa: {
    image_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/unfpa_background.jpg',
    logo_url: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/unfpa_logo.svg',
  },
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "project"
      SET "image_url" = '${PROJECT_IMAGE_URLS.imms.image_url}',
          "logo_url" = '${PROJECT_IMAGE_URLS.imms.logo_url}'
      WHERE "code" = 'imms';

    UPDATE "project"
      SET "image_url" = '${PROJECT_IMAGE_URLS.fanafana.image_url}',
          "logo_url" = '${PROJECT_IMAGE_URLS.fanafana.logo_url}'
      WHERE "code" = 'fanafana';

    UPDATE "project"
      SET "image_url" = '${PROJECT_IMAGE_URLS.disaster.image_url}'
      WHERE "code" = 'disaster';

    UPDATE "project"
      SET "image_url" = '${PROJECT_IMAGE_URLS.strive.image_url}',
          "logo_url" = '${PROJECT_IMAGE_URLS.strive.logo_url}'
      WHERE "code" = 'strive';

    UPDATE "project"
      SET "image_url" = '${PROJECT_IMAGE_URLS.wish.image_url}',
          "logo_url" = '${PROJECT_IMAGE_URLS.wish.logo_url}'
      WHERE "code" = 'wish';

    UPDATE "project"
      SET "image_url" = '${PROJECT_IMAGE_URLS.unfpa.image_url}',
          "logo_url" = '${PROJECT_IMAGE_URLS.unfpa.logo_url}'
      WHERE "code" = 'unfpa';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
