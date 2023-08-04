'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const MAP_OVERLAYS = [
  {
    id: 'COVID_Amount_Of_Hand_Sanitizer_Available',
    name: 'Amount of hand sanitizer available (in litres)',
    dataElementCodes: ['COVID-19FacAssTool_13'],
  },
  {
    id: 'COVID_Number_Of_Gloves_Available',
    name: 'Number of gloves available',
    dataElementCodes: ['COVID-19FacAssTool_14'],
  },
  {
    id: 'COVID_Number_Of_Face_Masks_Available',
    name: 'Number of face masks available',
    dataElementCodes: ['COVID-19FacAssTool_15'],
  },
  {
    id: 'COVID_Number_Of_Paracetamol_Tablets_Available',
    name: 'Number of paracetamol tablets available',
    dataElementCodes: ['COVID-19FacAssTool_16'],
  },
];

const GROUP_NAME = 'COVID-19 Commodity Availability';

const USER_GROUP = 'COVID-19';

const DISPLAY_TYPE = 'radius';

const MEASURE_BUILDER = 'sumLatestPerOrgUnit';

const COUNTRY_CODES = '{TO}';

const PROJECT_CODES = '{fanafana,explore}';

const VALUES = [
  {
    color: 'blue',
    value: 'other',
  },
  {
    color: 'grey',
    value: null,
  },
];

const PRESENTATION_OPTIONS = {
  measureLevel: 'Facility',
};

const BASIC_OVERLAY_OBJECT = {
  groupName: GROUP_NAME,
  userGroup: USER_GROUP,
  dataElementCode: 'value',
  displayType: DISPLAY_TYPE,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  isDataRegional: true,
  values: VALUES,
  measureBuilder: MEASURE_BUILDER,
  presentationOptions: PRESENTATION_OPTIONS,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
};

exports.up = async function (db) {
  await Promise.all(
    MAP_OVERLAYS.map((overlay, index) => {
      const { name, id, dataElementCodes } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASIC_OVERLAY_OBJECT,
        name,
        id,
        sortOrder: index,
        measureBuilderConfig: {
          dataElementCodes,
        },
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE "id" in (${arrayToDbString(MAP_OVERLAYS.map(o => o.id))});	
  `);
};

exports._meta = {
  version: 1,
};
