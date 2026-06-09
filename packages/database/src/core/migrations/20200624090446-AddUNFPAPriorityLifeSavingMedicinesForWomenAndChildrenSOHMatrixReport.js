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

const REPORT_ID = 'UNFPA_Priority_Medicines_SOH_Project';

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
    'SOH_555c04bf',
    'SOH_4790d43e',
    'SOH_51f324bf',
    'SOH_53d544bf',
    'SOH_53ea14bf',
    'SOH_398ac4bf',
    'SOH_51b474bf',
    'SOH_51ce64bf',
    'SOH_4576d4bf',
    'SOH_457bf4bf',
    'SOH_458134bf',
    'SOH_4fb394bf',
    'SOH_3659b4bf',
    'SOH_3654d4bf',
    'SOH_4366a4bf',
    'SOH_4346e4bf',
    'SOH_4fd604bf',
    'SOH_51f324bf',
    'SOH_50d804bf',
    'SOH_373ad4bf',
    'SOH_373f64bf',
    'SOH_373654bf',
    'SOH_38b814bf',
    'SOH_3827b4bf',
    'SOH_382424bf',
    'SOH_3e40b4bf',
    'SOH_53fc34bf',
    'SOH_3eb84c00',
    'SOH_b3044cdc',
    'SOH_47d1743e',
    'SOH_0a820c00',
    'SOH_46ca843e',
    'SOH_47d8e43e',
    'SOH_9ed445dd',
    'SOH_368c74bf',
    'SOH_3692b4bf',
    'SOH_367c44bf',
    'SOH_368674bf',
    'SOH_3659b4bf',
    'SOH_3654d4bf',
    'SOH_38df44bf',
    'SOH_38db24bf',
    'SOH_4346e4bf',
    'SOH_552344bf',
    'SOH_5517c4bf',
    'SOH_551c34bf',
    'SOH_551ff4bf',
    'SOH_677cf4bf',
    'SOH_3659b4bf',
    'SOH_38df44bf',
    'SOH_38db24bf',
    'SOH_4346e4bf',
    'SOH_4366a4bf',
    'SOH_556ce4bf',
    'SOH_557054bf',
    'SOH_471474bf',
    'SOH_0a820c00',
    'SOH_47f0c43e',
    'SOH_47f8b43e',
    'SOH_535b54bf',
    'SOH_536054bf',
    'SOH_536f54bf',
    'SOH_537ec4bf',
    'SOH_538e24bf',
    'SOH_52f844bf',
    'SOH_533734bf',
    'SOH_ab6105dd',
    'SOH_533194bf',
    'SOH_532904bf',
    'SOH_534684bf',
    'SOH_534b94bf',
    'SOH_536554bf',
    'SOH_536a64bf',
    'SOH_537474bf',
    'SOH_5379b4bf',
    'SOH_559794bf',
    'SOH_bbfcf518',
    'SOH_403004bf',
    'SOH_403354bf',
    'SOH_403694bf',
    'SOH_471f243e',
    'SOH_4726043e',
    'SOH_615374bf',
    'SOH_614ce4bf',
    'SOH_615054bf',
    'SOH_5f0c14bf',
    'SOH_5ee7e4bf',
    'SOH_5f11b4bf',
    'SOH_292735dd',
    'SOH_469064bf',
    'SOH_468a44bf',
    'SOH_47c2c43e',
    'SOH_47ca443e',
    'SOH_3f6604bf',
    'SOH_3f6ad4bf',
    'SOH_471f243e',
    'SOH_03beecaf',
    'SOH_642184bf',
    'SOH_9716ccaf',
    'SOH_383444bf',
    'SOH_394894bf',
    'SOH_373ad4bf',
    'SOH_3e40b4bf',
    'SOH_5dadc4bf',
    'SOH_5db3a4bf',
    'SOH_566bceec',
    'SOH_46cfdeec',
    'SOH_199ffeec',
    'SOH_36d0c4bf',
    'SOH_36d5b4bf',
    'SOH_36df14bf',
    'SOH_3a6c44bf',
    'SOH_60fa34bf',
    'SOH_399514bf',
    'SOH_555c04bf',
    'SOH_4790d43e',
    'SOH_51b474bf',
    'SOH_51ce64bf',
    'SOH_41e9d4bf',
    'SOH_41f354bf',
    'SOH_484444bf',
    'SOH_484d54bf',
    'SOH_3b3444bf',
    'SOH_a162942e',
    'SOH_bf4be518',
    'SOH_402924bf',
    'SOH_47d584bf',
    'SOH_3ff944bf',
    'SOH_d2d28620',
    'SOH_47fb04bf',
    'SOH_47fe44bf',
    'SOH_53d014bf',
    'SOH_4752843e',
    'SOH_542a34bf',
    'SOH_4718f43e',
    'SOH_3b3994bf',
    'SOH_49d9842e',
    'SOH_7e67742e',
    'SOH_b26e342e',
    'SOH_e1e8342e',
    'SOH_a97d742e',
    'SOH_dd7b542e',
    'SOH_088a142e',
    'SOH_383e142e',
    'SOH_bca6342e',
    'SOH_756e542e',
    'SOH_ae11242e',
    'SOH_e1d4a42e',
    'SOH_1193e42e',
  ],
  columns: '$orgUnit',
  stripFromDataElementNames: 'Stock on Hand',
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
  name: 'Priority Life Saving Medicines for Women and Children (Stock on hand)',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
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
