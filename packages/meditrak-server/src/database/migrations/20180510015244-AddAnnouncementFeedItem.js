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

exports.up = function(db, callback) {
  return db.insert(
    'feed_item',
    ['id', 'permission_group_id', 'model_name', 'template_variables', 'created'],
    [
      'AnnouncementFeedItem1',
      '59085f2dfc6a0715dae508e1', // Public
      'markdown',
      JSON.stringify(
        JSON.stringify({
          title: 'Introducing the new Tupaia activity feed',
          image: 'https://cdn-images-1.medium.com/max/1200/1*tAsJugaUb0Fgr_gZtoewGg.jpeg',
          body: `We're proud to launch the new **Tupaia activity feed.**
Now you can stay up to date with who's updating what in your area.`,
          link: 'https://medium.com/tupaia/tupaias-mobile-website-b84519bb6e1d',
        }),
      ),
      '2018-09-01', // Remain at top until September first.
    ],
    callback,
  );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
