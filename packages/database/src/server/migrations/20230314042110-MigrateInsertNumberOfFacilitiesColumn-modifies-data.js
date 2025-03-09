'use strict';

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

const ch_to_bar_n_percentage_clinics_with_medicines = {
  transform: [
    {
      transform: 'fetchData',
      parameters: {
        aggregations: [
          {
            type: 'MOST_RECENT',
            config: {
              dataSourceEntityType: 'facility',
            },
          },
          {
            type: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
            config: {
              dataSourceEntityType: 'facility',
              aggregationEntityType: 'country',
            },
          },
        ],
        dataElementCodes: [
          'AMXCXXXXSOD000',
          'ANGIXXXXINH001',
          'ASPIXXXXIN00002',
          '36f7d4bf',
          'GLIB0050TAB000',
          'IBFNXXXXTAB000',
          'MGSFXXXXINJ002',
          'MTFN0500TAB001',
          'PCML0024SUS000',
          'PCML1000TAB000',
          'SBML1000MDI002',
          'NACL0009INS000',
          'INSN1010INJ000',
        ],
      },
      dataTableCode: 'analytics',
    },
    {
      insert: {
        name:
          "=translate($dataElement,{AMXCXXXXSOD000: 'Amoxicillin',ANGIXXXXINH001 :'Enalapril',ASPIXXXXIN00002: 'Aspirin','36f7d4bf': 'Atenolol',GLIB0050TAB000:'Glibenclamide',IBFNXXXXTAB000: 'Ibuprofen',MGSFXXXXINJ002: 'Magnesium Sulfate 50% Inj',MTFN0500TAB001: 'Metformin',PCML0024SUS000:'Paracetamol (susp)',PCML1000TAB000: 'Paracetamol (tab/cap)',SBML1000MDI002: 'Salbutamol (inhaler)',NACL0009INS000: 'Sodium chloride 0.9%', INSN1010INJ000: 'Insulin'})",
        value: '=$value == 0 ? 1 : 0',
      },
      include: 'organisationUnit',
      transform: 'updateColumns',
    },
    {
      using: 'sum',
      groupBy: ['name', 'organisationUnit'],
      transform: 'mergeRows',
    },
    {
      join: [
        {
          tableColumn: 'organisationUnit',
          newDataColumn: 'ancestor',
        },
      ],
      transform: 'fetchData',
      parameters: {
        hierarchy: '=@params.hierarchy',
        entityCodes: '=@params.organisationUnitCodes',
        ancestorType: 'country',
        descendantType: 'facility',
      },
      dataTableCode: 'entity_relations',
    },
    {
      using: {
        value: 'first',
        ancestor: 'exclude',
        descendant: 'count',
      },
      groupBy: ['name', 'value', 'organisationUnit'],
      transform: 'mergeRows',
    },
    {
      insert: {
        numberOfFacilities: '=$descendant',
      },
      exclude: 'descendant',
      transform: 'updateColumns',
    },
    {
      insert: {
        value: '=$value/$numberOfFacilities',
      },
      exclude: ['organisationUnit', 'numberOfFacilities'],
      transform: 'updateColumns',
    },
  ],
};

const REPORTS_WITH_STANDARD_REPLACE = [
  'rh_line_facilities_with_AYFSRH_trained_health_worker',
  'rh_line_facilities_with_family_planning_trained_worker',
  'rh_line_facilities_with_larc_trained_health_worker',
  'rh_line_facilities_with_staff_trained_in_logistics_mgmt',
  'rh_line_n_reproductive_health_training',
];

const REPORTS_WITH_TRIVIAL_REPLACE = [
  'rh_text_stock_out_snap_shot_combined_oral_contraceptive',
  'rh_text_stock_out_snap_shot_emergency_contraceptives',
  'rh_text_stock_out_snap_shot_female_condoms',
  'rh_text_stock_out_snap_shot_implant_contraceptives',
  'rh_text_stock_out_snap_shot_injectable_contraceptives',
  'rh_text_stock_out_snap_shot_iuds',
  'rh_text_stock_out_snap_shot_male_condoms',
  'rh_text_stock_out_snap_shot_progesterone_only_pill',
];

const updateStandardReports = async db => {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE code in (${REPORTS_WITH_STANDARD_REPLACE.map(c => '?').join(',')})`,
    REPORTS_WITH_STANDARD_REPLACE,
  );

  for (const report of reports) {
    const { transform } = report.config;
    let newTransform = [];
    for (const transformStep of transform) {
      if (transformStep === 'insertNumberOfFacilitiesColumn') {
        newTransform = [
          ...newTransform,
          {
            transform: 'fetchData',
            dataTableCode: 'entity_relations',
            parameters: {
              entityCodes: '=exists(@all.organisationUnit) ? @all.organisationUnit : []',
              hierarchy: '=@params.hierarchy',
              ancestorType: 'country',
              descendantType: 'facility',
            },
            join: [
              {
                tableColumn: 'organisationUnit',
                newDataColumn: 'ancestor',
              },
            ],
          },
          {
            transform: 'mergeRows',
            groupBy: ['organisationUnit', 'dataElement', 'period'],
            using: {
              value: 'first',
              ancestor: 'exclude',
              descendant: 'count',
            },
          },
          {
            transform: 'updateColumns',
            insert: {
              numberOfFacilities: '=$descendant',
            },
            exclude: 'descendant',
          },
        ];
      } else {
        newTransform.push(transformStep);
      }
    }
    const newConfig = { ...report.config, transform: newTransform };

    await db.runSql(`UPDATE report SET config = ? WHERE id = '${report.id}'`, [
      JSON.stringify(newConfig),
    ]);
  }
};

const updateTrivialReports = async db => {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE code in (${REPORTS_WITH_TRIVIAL_REPLACE.map(c => '?').join(',')})`,
    REPORTS_WITH_TRIVIAL_REPLACE,
  );

  for (const report of reports) {
    const { transform } = report.config;
    let newTransform = [];
    for (const transformStep of transform) {
      if (transformStep === 'insertNumberOfFacilitiesColumn') {
        newTransform = [
          ...newTransform,
          {
            transform: 'insertColumns',
            columns: {
              numberOfFacilities: '=1',
            },
          },
        ];
      } else {
        newTransform.push(transformStep);
      }
    }
    const newConfig = { ...report.config, transform: newTransform };

    await db.runSql(`UPDATE report SET config = ? WHERE id = '${report.id}'`, [
      JSON.stringify(newConfig),
    ]);
  }
};

exports.up = async function (db) {
  await db.runSql(
    `UPDATE report SET config = ? WHERE CODE = 'ch_to_bar_n_percentage_clinics_with_medicines';`,
    [JSON.stringify(ch_to_bar_n_percentage_clinics_with_medicines)],
  );
  await updateStandardReports(db);
  await updateTrivialReports(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
