'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'UNFPA_Project';

const REPORT_ID = 'UNFPA_Priority_Medicines_MOS_Project';

const DATA_BUILDER_CONFIG = {
  rows: [
    {
      rows: [
        {
          rows: [
            'Oxytocin 10IU/1mL injection',
            'Oxytocin 5UI Ampoules',
            'Misoprostol 200mcg tablet',
            'Sodium chloride 0.9% isotonic injectable solution',
            'Sodium lactate,compound solution',
          ],
          category: 'Post partum haemorrhage',
        },
        {
          rows: [
            'Calcium gluconate 100mg/mL in 10mL ampoule injection',
            'Magnesium (sulfate) 0.5g/mL (2mL) equivalent to 1g/2mL; 50%w/v',
            'Magnesium (sulfate) 0.5g/mL (10mL) equivalent to 5g/10mL; 50%w/v',
            'Hydralazine (hydrochloride) 20mg powder for injection',
            'Hydralazine (hydrochloride) 25mg tablet',
            'Hydralazine (hydrochloride) 50mg tablet',
            'Methyldopa 250mg tablet',
          ],
          category: 'Severe pre-eclampsia and eclampsia',
        },
        {
          rows: [
            'Ampicillin (sodium) 500mg powder for injection',
            'Ampicillin (sodium)1g powder for injection',
            'Gentamicin (sulfate) 40mg/mL in 2mL vial',
            'Gentamicin (sulfate) 10mg/mL in 2mL vial',
            'Metronidazole 500mg in 100mL vial',
          ],
          category: 'Maternal sepsis',
        },
        {
          rows: ['Misoprostol 200mcg tablet', 'Mifepristone-misoprostol 200mg-200mcg tablets'],
          category:
            'Provision of safe abortion services and or the management of incomplete abortion and miscarriage',
        },
        {
          rows: [
            'Azithromycin (anhydrous) 250mg capsule',
            'Azithromycin (anhydrous) 500mg capsule',
            'Azithromycin 200mg/5mL oral liquid',
            'Cefixime (trihydrate) 400mg capsule',
            'Benzathine benzylpenicillin 900mg (1.2 million IU) /5mL vial',
            'Benzathine benzylpenicillin 1.44g (2.4 million IU) /5mL vial',
          ],
          category: 'Sexually transmitted infections',
        },
        {
          rows: [
            'Dexamethasone 4mg/mL (1mL) disodium phosphate salt',
            'Nifedipine 10mg immediate release capsule',
          ],
          category: 'Preterm birth',
        },
        {
          rows: [
            'Zidovudine/Lamivudine 300/150mg Tablets',
            'Tenofovir/Lamivudine/Efavirenz 300/300/600mg Tablets',
            'Tenofovir/Lamivudine 300/300mg Tablets',
            'Zidovudine/Lamivudine/Nevirapine 300/150/200mg Tablets',
            'Atazanavir/Ritonavir 300/100mg Tablets',
            'Tenofovir/Lamivudine/Dolutegravir 300/300/50mg Tab.',
            'Lamivudine 150mg + Zidovudine 300mg + Efavirenz 600mg',
          ],
          category: 'Maternal HIV/AIDs and malaria',
        },
      ],
      category: 'Priority Medicines for Women',
    },
    {
      rows: [
        {
          rows: [
            'Amoxicillin (trihydrate) 250mg solid oral dosage form',
            'Amoxicillin (trihydrate) 500mg solid oral dosage form',
            'Amoxicillin (trihydrate) 125mg/5ml powder for oral liquid',
            'Amoxicillin (trihydrate) 250mg/5ml powder for oral liquid',
            'Ampicillin (sodium) 500mg powder for injection',
            'Ampicillin (sodium)1g powder for injection',
            'Ceftriaxone (sodium) 250mg',
            'Ceftriaxone (sodium) 1g',
            'Gentamicin (sulfate) 10mg/mL in 2mL vial',
            'Oxygen',
          ],
          category: 'Pneumonia',
        },
        {
          rows: [
            'Oral rehydration salts powder for filution in 200mL',
            'Oral rehydration salts powder for filution in 500mL',
            'Oral rehydration salts powder for filution in 1L',
            'Zinc sulfate 20mg solid oral dosage form',
          ],
          category: 'Diarrhoea',
        },
        {
          rows: [
            'Ampicillin (sodium) 500mg powder for injection',
            'Ceftriaxone (sodium) 250mg',
            'Ceftriaxone (sodium) 1g',
            'Gentamicin (sulfate) 10mg/mL in 2mL vial',
            'Gentamicin (sulfate) 40mg/mL in 2mL vial',
            'Procaine benzylpenicillin 1g (1 million IU) powder for injection',
            'Procaine benzylpenicillin 3g (3 million IU) powder for injection',
          ],
          category: 'Neonatal sepsis',
        },
        {
          rows: [
            'Lamivudine & nevirapine & zidovudine 30mg & 50mg & 60mg tablet',
            'Zidovudine/Lamivudine/Nevirapine 300/150/200mg Tablets',
          ],
          category: 'HIV',
        },
        {
          rows: ['Vitamin A 100.000IUCapsule', 'Vitamin A 200.000IU Capsule'],
          category: 'Vitamin A deficiency',
        },
        {
          rows: [
            'Morphine (sulfate) 20mg granules (suspension)',
            'Morphine (sulfate) 30mg granules (suspension)',
            'Morphine (sulfate) 60mg granules (suspension)',
            'Morphine (sulfate) 100mg granules (suspension)',
            'Morphine (sulfate) 200mg granules (suspension)',
            'Morphine (sulfate) 10mg/mL (1mL)',
            'Morphine (hydrochloride) 10mg/5mL oral liquid',
            'Morphine 10mg/ml oral liquid',
            'Morphine (sulfate) 10mg IR tablet',
            'Morphine (hydrochloride) 10mg IR tablet',
            'Morphine (hydrochloride) 10mg SR tablet',
            'Morphine (sulfate) 10mg SR tablet',
            'Morphine (hydrochloride) 30mg SR tablet',
            'Morphine (sulfate) 30mg SR tablet',
            'Morphine (hydrochloride) 60mg SR tablet',
            'Morphine (sulfate) 60mg SR tablet',
            'Paracetamol 500mg tablet',
            'Paracetamol oral liquid 120mg/5ml',
          ],
          category: 'Palliative care and pain',
        },
      ],
      category: 'Priority Medicines for Children Under 5 Years of Age',
    },
    {
      rows: [
        {
          rows: [
            'Ethambutol (hydrochloride) 100 mg tablet',
            'Ethambutol (hydrochloride) 200 mg tablet',
            'Ethambutol (hydrochloride) 400 mg tablet',
            'Isoniazid 100mg Tablets',
            'Isoniazid 300mg Tablets',
            'Rifampicin 300 mg solid oral dosage form',
            'Rifampicin 20mg/mL oral liquid',
            'Rifampicin 150mg solid oral dosage form',
            'Pyrazinamide 150mg tablet scored',
            'Pyrazinamide 150mg tablet dispersible',
            'Pyrazinamide 400mg tablet',
            'Pyrazinamide 500mg tablet',
            'Isoniazid & rifampicin 75mg & 150mg',
            'Isoniazid & rifampicin 150mg & 300mg',
            'Rifampicin 75mg/Isoniazid 50mg Tablets',
            'Rifampicin 75mg/Isoniazid 50mg/Pyrazinamid 150mg Tablets',
            'Ethambutol & isoniazid & pyrazinamide & rifampicin 275mg & 75mg & 400mg & 150mg',
            'Ethambutol & isoniazid & rifampicin 275mg & 75mg & 150mg',
          ],
          category: 'Tuberculosis',
        },
        {
          rows: [
            'Isoniazid 100mg Tablets',
            'Co-Trimoxazole (Trimethoprim/sulfamethoxazole) 120mg',
            'Sulfamethoxazole & trimethoprim 200mg & 40mg / 5mL oral liquid',
            'Co-Trimoxazole (Trimethoprim/sulfamethoxazole) 480mg',
          ],
          category: 'HIV, TB prohylaxis Pneumocystis carinii pneumonia',
        },
        {
          rows: [
            'Caffeine citrate 20mg/mL (equivalent to 10mg caffeine base/mL) oral liquid',
            'Chlorhexidine (digluconate) 5% solution',
            'Azithromycin (anhydrous) 250mg capsule',
            'Dexamethasone 4mg/mL (1mL) disodium phosphate salt',
            'Phytomenadione 1mg/mL injection',
            'Phytomenadione 10mg/mL in 5mL ampoule injection',
          ],
          category: 'Neonatal care',
        },
      ],
      category: 'Priority Medicines for Child Health and Survival',
    },
    {
      rows: [
        {
          rows: [
            'Artemether & lumefantrine 20mg & 120mg tablet, 6x4',
            'Artemether & lumefantrine 20mg & 120mg tablet, 6x3',
            'Artemether & lumefantrine 20mg & 120mg tablet, 6x2',
            'Artesunate 200mg rectal dosage form',
            'Artesunate 50mg rectal dosage form',
            'Artesunate (anhdrous artesunic acid) 60mg with separate ampoule of 5% sodium bicarbonate solution',
            'Chloroquine 150mg tabs',
            'Quinine 300mg tabs',
            'Clindamycin (hydrochloride) 150mg capsule',
          ],
          category: 'Malaria',
        },
      ],
      category: 'Child and Maternal Health',
    },
    {
      rows: [
        'Oxytocin 10IU/1mL injection',
        'Oxytocin 5UI Ampoules',
        'Magnesium (sulfate) 0.5g/mL (2mL) equivalent to 1g/2mL; 50%w/v',
        'Magnesium (sulfate) 0.5g/mL (10mL) equivalent to 5g/10mL; 50%w/v',
        'Ferrous salt equivalent to 60 mg tablet',
        'Ferrous salt equivalent to 60 mg iron tablet and folic acid 400mcg tablet',
        'Mebendazole 100mg tablet (chewable)',
        'Mebendazole 500mg tablet (chewable)',
      ],
      category: 'Maternal Health Products (UNFPA)',
    },
    {
      rows: [
        'Condoms, male',
        'Condom, male, varied',
        'Condoms, female',
        'Ethinylestradiol & levonorgestrel 30mcg & 150mcg tablet',
        'Levonorgestrel 30mcg tablet',
        'Etonogestrel-releasing implant (single rod containing 68mg of etonogestrel)',
        'Jadelle Contraceptive Implant',
        'Levonorgestrel 750mcg tablet (pack of two)',
        'Levonorgestrel 1.5mg tablet',
        'Medroxyprogesterone acetate depot injection 150mg/mL in 1mL vial',
        'Medroxyprogesterone acetate 104mg/0.65ml (SAYANA Press)',
        'Norethisterone enantate 200mg/mL in 1mL ampoule oily solution',
        'Intra Uterine Device',
        'Copper containing device',
      ],
      category: 'Contraceptives',
    },
    {
      rows: [
        'UNFPA, RH kit 10+B109',
        'UNFPA, RH kit 11A',
        'UNFPA, RH kit 11B',
        'UNFPA, RH kit 12',
        'UNFPA, RH kit 2A',
        'UNFPA, RH kit 2B',
        'UNFPA, RH kit 3',
        'UNFPA, RH kit 5',
        'UNFPA, RH kit 6A',
        'UNFPA, RH kit 6B',
        'UNFPA, RH kit 7',
        'UNFPA, RH kit 8',
        'UNFPA, RH kit 9',
      ],
      category: 'Emergency Kits',
    },
  ],
  cells: [
    'MOS_555c04bf',
    'MOS_4790d43e',
    'MOS_51f324bf',
    'MOS_53d544bf',
    'MOS_53ea14bf',
    'MOS_398ac4bf',
    'MOS_51b474bf',
    'MOS_51ce64bf',
    'MOS_4576d4bf',
    'MOS_457bf4bf',
    'MOS_458134bf',
    'MOS_4fb394bf',
    'MOS_3659b4bf',
    'MOS_3654d4bf',
    'MOS_4366a4bf',
    'MOS_4346e4bf',
    'MOS_4fd604bf',
    'MOS_51f324bf',
    'MOS_50d804bf',
    'MOS_373ad4bf',
    'MOS_373f64bf',
    'MOS_373654bf',
    'MOS_38b814bf',
    'MOS_3827b4bf',
    'MOS_382424bf',
    'MOS_3e40b4bf',
    'MOS_53fc34bf',
    'MOS_3eb84c00',
    'MOS_b3044cdc',
    'MOS_47d1743e',
    'MOS_0a820c00',
    'MOS_46ca843e',
    'MOS_47d8e43e',
    'MOS_9ed445dd',
    'MOS_368c74bf',
    'MOS_3692b4bf',
    'MOS_367c44bf',
    'MOS_368674bf',
    'MOS_3659b4bf',
    'MOS_3654d4bf',
    'MOS_38df44bf',
    'MOS_38db24bf',
    'MOS_4346e4bf',
    'MOS_552344bf',
    'MOS_5517c4bf',
    'MOS_551c34bf',
    'MOS_551ff4bf',
    'MOS_677cf4bf',
    'MOS_3659b4bf',
    'MOS_38df44bf',
    'MOS_38db24bf',
    'MOS_4346e4bf',
    'MOS_4366a4bf',
    'MOS_556ce4bf',
    'MOS_557054bf',
    'MOS_471474bf',
    'MOS_0a820c00',
    'MOS_47f0c43e',
    'MOS_47f8b43e',
    'MOS_535b54bf',
    'MOS_536054bf',
    'MOS_536f54bf',
    'MOS_537ec4bf',
    'MOS_538e24bf',
    'MOS_52f844bf',
    'MOS_533734bf',
    'MOS_ab6105dd',
    'MOS_533194bf',
    'MOS_532904bf',
    'MOS_534684bf',
    'MOS_534b94bf',
    'MOS_536554bf',
    'MOS_536a64bf',
    'MOS_537474bf',
    'MOS_5379b4bf',
    'MOS_559794bf',
    'MOS_bbfcf518',
    'MOS_403004bf',
    'MOS_403354bf',
    'MOS_403694bf',
    'MOS_471f243e',
    'MOS_4726043e',
    'MOS_615374bf',
    'MOS_614ce4bf',
    'MOS_615054bf',
    'MOS_5f0c14bf',
    'MOS_5ee7e4bf',
    'MOS_5f11b4bf',
    'MOS_292735dd',
    'MOS_469064bf',
    'MOS_468a44bf',
    'MOS_47c2c43e',
    'MOS_47ca443e',
    'MOS_3f6604bf',
    'MOS_3f6ad4bf',
    'MOS_471f243e',
    'MOS_03beecaf',
    'MOS_642184bf',
    'MOS_9716ccaf',
    'MOS_383444bf',
    'MOS_394894bf',
    'MOS_373ad4bf',
    'MOS_3e40b4bf',
    'MOS_5dadc4bf',
    'MOS_5db3a4bf',
    'MOS_566bceec',
    'MOS_46cfdeec',
    'MOS_199ffeec',
    'MOS_36d0c4bf',
    'MOS_36d5b4bf',
    'MOS_36df14bf',
    'MOS_3a6c44bf',
    'MOS_60fa34bf',
    'MOS_399514bf',
    'MOS_555c04bf',
    'MOS_4790d43e',
    'MOS_51b474bf',
    'MOS_51ce64bf',
    'MOS_41e9d4bf',
    'MOS_41f354bf',
    'MOS_484444bf',
    'MOS_484d54bf',
    'MOS_3b3444bf',
    'MOS_a162942e',
    'MOS_bf4be518',
    'MOS_402924bf',
    'MOS_47d584bf',
    'MOS_3ff944bf',
    'MOS_d2d28620',
    'MOS_47fb04bf',
    'MOS_47fe44bf',
    'MOS_53d014bf',
    'MOS_4752843e',
    'MOS_542a34bf',
    'MOS_4718f43e',
    'MOS_3b3994bf',
    'MOS_49d9842e',
    'MOS_7e67742e',
    'MOS_b26e342e',
    'MOS_e1e8342e',
    'MOS_a97d742e',
    'MOS_dd7b542e',
    'MOS_088a142e',
    'MOS_383e142e',
    'MOS_bca6342e',
    'MOS_756e542e',
    'MOS_ae11242e',
    'MOS_e1d4a42e',
    'MOS_1193e42e',
  ],
  columns: '$orgUnit',
  stripFromDataElementNames: 'Months of Stock',
  dataSourceEntityFilter: {
    code: { in: ['TO_CPMS', 'KI_GEN', 'VU_1180_20', 'SB_500092'] },
  },
  entityAggregation: {
    dataSourceEntityType: 'facility',
    aggregationEntityType: 'country',
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
  },
};

const VIEW_JSON = {
  name: 'Priority Life Saving Medicines for Women and Children (Months of stock)',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  presentationOptions: {
    red: {
      condition: 0,
      color: '#b71c1c',
      label: '',
      description: 'Months of stock: ',
    },
    orange: {
      condition: {
        '>': 0,
        '<': 3,
      },
      color: '#EE9A30',
      label: '',
      description: 'Months of stock: ',
    },
    green: {
      condition: {
        '>=': 3,
        '<': 7,
      },
      color: '#33691e',
      label: '',
      description: 'Months of stock: ',
    },
    yellow: {
      condition: {
        '>=': 7,
      },
      color: '#fdd835',
      label: '',
      description: 'Months of stock: ',
    },
    type: 'condition',
    showRawValue: true,
  },
  periodGranularity: 'month',
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfValuesForOrgUnits',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
