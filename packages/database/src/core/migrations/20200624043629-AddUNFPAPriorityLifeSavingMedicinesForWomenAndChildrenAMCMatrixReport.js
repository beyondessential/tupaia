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

const REPORT_ID = 'UNFPA_Priority_Medicines_AMC_Project';

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
    'AMC_555c04bf',
    'AMC_4790d43e',
    'AMC_51f324bf',
    'AMC_53d544bf',
    'AMC_53ea14bf',
    'AMC_398ac4bf',
    'AMC_51b474bf',
    'AMC_51ce64bf',
    'AMC_4576d4bf',
    'AMC_457bf4bf',
    'AMC_458134bf',
    'AMC_4fb394bf',
    'AMC_3659b4bf',
    'AMC_3654d4bf',
    'AMC_4366a4bf',
    'AMC_4346e4bf',
    'AMC_4fd604bf',
    'AMC_51f324bf',
    'AMC_50d804bf',
    'AMC_373ad4bf',
    'AMC_373f64bf',
    'AMC_373654bf',
    'AMC_38b814bf',
    'AMC_3827b4bf',
    'AMC_382424bf',
    'AMC_3e40b4bf',
    'AMC_53fc34bf',
    'AMC_3eb84c00',
    'AMC_b3044cdc',
    'AMC_47d1743e',
    'AMC_0a820c00',
    'AMC_46ca843e',
    'AMC_47d8e43e',
    'AMC_9ed445dd',
    'AMC_368c74bf',
    'AMC_3692b4bf',
    'AMC_367c44bf',
    'AMC_368674bf',
    'AMC_3659b4bf',
    'AMC_3654d4bf',
    'AMC_38df44bf',
    'AMC_38db24bf',
    'AMC_4346e4bf',
    'AMC_552344bf',
    'AMC_5517c4bf',
    'AMC_551c34bf',
    'AMC_551ff4bf',
    'AMC_677cf4bf',
    'AMC_3659b4bf',
    'AMC_38df44bf',
    'AMC_38db24bf',
    'AMC_4346e4bf',
    'AMC_4366a4bf',
    'AMC_556ce4bf',
    'AMC_557054bf',
    'AMC_471474bf',
    'AMC_0a820c00',
    'AMC_47f0c43e',
    'AMC_47f8b43e',
    'AMC_535b54bf',
    'AMC_536054bf',
    'AMC_536f54bf',
    'AMC_537ec4bf',
    'AMC_538e24bf',
    'AMC_52f844bf',
    'AMC_533734bf',
    'AMC_ab6105dd',
    'AMC_533194bf',
    'AMC_532904bf',
    'AMC_534684bf',
    'AMC_534b94bf',
    'AMC_536554bf',
    'AMC_536a64bf',
    'AMC_537474bf',
    'AMC_5379b4bf',
    'AMC_559794bf',
    'AMC_bbfcf518',
    'AMC_403004bf',
    'AMC_403354bf',
    'AMC_403694bf',
    'AMC_471f243e',
    'AMC_4726043e',
    'AMC_615374bf',
    'AMC_614ce4bf',
    'AMC_615054bf',
    'AMC_5f0c14bf',
    'AMC_5ee7e4bf',
    'AMC_5f11b4bf',
    'AMC_292735dd',
    'AMC_469064bf',
    'AMC_468a44bf',
    'AMC_47c2c43e',
    'AMC_47ca443e',
    'AMC_3f6604bf',
    'AMC_3f6ad4bf',
    'AMC_471f243e',
    'AMC_03beecaf',
    'AMC_642184bf',
    'AMC_9716ccaf',
    'AMC_383444bf',
    'AMC_394894bf',
    'AMC_373ad4bf',
    'AMC_3e40b4bf',
    'AMC_5dadc4bf',
    'AMC_5db3a4bf',
    'AMC_566bceec',
    'AMC_46cfdeec',
    'AMC_199ffeec',
    'AMC_36d0c4bf',
    'AMC_36d5b4bf',
    'AMC_36df14bf',
    'AMC_3a6c44bf',
    'AMC_60fa34bf',
    'AMC_399514bf',
    'AMC_555c04bf',
    'AMC_4790d43e',
    'AMC_51b474bf',
    'AMC_51ce64bf',
    'AMC_41e9d4bf',
    'AMC_41f354bf',
    'AMC_484444bf',
    'AMC_484d54bf',
    'AMC_3b3444bf',
    'AMC_a162942e',
    'AMC_bf4be518',
    'AMC_402924bf',
    'AMC_47d584bf',
    'AMC_3ff944bf',
    'AMC_d2d28620',
    'AMC_47fb04bf',
    'AMC_47fe44bf',
    'AMC_53d014bf',
    'AMC_4752843e',
    'AMC_542a34bf',
    'AMC_4718f43e',
    'AMC_3b3994bf',
    'AMC_49d9842e',
    'AMC_7e67742e',
    'AMC_b26e342e',
    'AMC_e1e8342e',
    'AMC_a97d742e',
    'AMC_dd7b542e',
    'AMC_088a142e',
    'AMC_383e142e',
    'AMC_bca6342e',
    'AMC_756e542e',
    'AMC_ae11242e',
    'AMC_e1d4a42e',
    'AMC_1193e42e',
  ],
  columns: '$orgUnit',
  stripFromDataElementNames: 'Average Monthly Consumption',
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
  name: 'Priority Life Saving Medicines for Women and Children (Average monthly consumption)',
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
