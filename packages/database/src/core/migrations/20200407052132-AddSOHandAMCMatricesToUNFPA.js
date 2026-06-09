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

const createConfig = prefix => ({
  rows: [
    {
      category: `Priority Medicines for Women`,
      rows: [
        {
          category: 'Post partum haemorrhage',
          rows: [
            'Oxytocin 10IU/1mL injection',
            'Oxytocin 5UI Ampoules',
            'Misoprostol 200mcg tablet',
            'Sodium chloride 0.9% isotonic injectable solution',
            'Sodium lactate,compound solution',
          ],
        },
        {
          category: 'Severe pre-eclampsia and eclampsia',
          rows: [
            'Calcium gluconate 100mg/mL in 10mL ampoule injection',
            'Magnesium (sulfate) 0.5g/mL (2mL) equivalent to 1g/2mL; 50%w/v',
            'Magnesium (sulfate) 0.5g/mL (10mL) equivalent to 5g/10mL; 50%w/v',
            'Hydralazine (hydrochloride) 20mg powder for injection',
            'Hydralazine (hydrochloride) 25mg tablet',
            'Hydralazine (hydrochloride) 50mg tablet',
            'Methyldopa 250mg tablet',
          ],
        },
        {
          category: 'Maternal sepsis',
          rows: [
            'Ampicillin (sodium) 500mg powder for injection',
            'Ampicillin (sodium)1g powder for injection',
            'Gentamicin (sulfate) 40mg/mL in 2mL vial',
            'Gentamicin (sulfate) 10mg/mL in 2mL vial',
            'Metronidazole 500mg in 100mL vial',
          ],
        },
        {
          category:
            'Provision of safe abortion services and or the management of incomplete abortion and miscarriage',
          rows: ['Misoprostol 200mcg tablet', 'Mifepristone-misoprostol 200mg-200mcg tablets'],
        },
        {
          category: 'Sexually transmitted infections',
          rows: [
            'Azithromycin (anhydrous) 250mg capsule',
            'Azithromycin (anhydrous) 500mg capsule',
            'Azithromycin 200mg/5mL oral liquid',
            'Cefixime (trihydrate) 400mg capsule',
            'Benzathine benzylpenicillin 900mg (1.2 million IU) /5mL vial',
            'Benzathine benzylpenicillin 1.44g (2.4 million IU) /5mL vial',
          ],
        },
        {
          category: 'Preterm birth',
          rows: [
            'Dexamethasone 4mg/mL (1mL) disodium phosphate salt',
            'Nifedipine 10mg immediate release capsule',
          ],
        },
        {
          category: 'Maternal HIV/AIDs and malaria',
          rows: [
            'Zidovudine/Lamivudine 300/150mg Tablets',
            'Tenofovir/Lamivudine/Efavirenz 300/300/600mg Tablets',
            'Tenofovir/Lamivudine 300/300mg Tablets',
            'Zidovudine/Lamivudine/Nevirapine 300/150/200mg Tablets',
            'Atazanavir/Ritonavir 300/100mg Tablets',
            'Tenofovir/Lamivudine/Dolutegravir 300/300/50mg Tab.',
            'Lamivudine 150mg + Zidovudine 300mg + Efavirenz 600mg',
          ],
        },
      ],
    },
    {
      category: 'Priority Medicines for Children Under 5 Years of Age',
      rows: [
        {
          category: 'Pneumonia',
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
        },
        {
          category: 'Diarrhoea',
          rows: [
            'Oral rehydration salts powder for filution in 200mL',
            'Oral rehydration salts powder for filution in 500mL',
            'Oral rehydration salts powder for filution in 1L',
            'Zinc sulfate 20mg solid oral dosage form',
          ],
        },
        {
          category: 'Neonatal sepsis',
          rows: [
            'Ampicillin (sodium) 500mg powder for injection',
            'Ceftriaxone (sodium) 250mg',
            'Ceftriaxone (sodium) 1g',
            'Gentamicin (sulfate) 10mg/mL in 2mL vial',
            'Gentamicin (sulfate) 40mg/mL in 2mL vial',
            'Procaine benzylpenicillin 1g (1 million IU) powder for injection',
            'Procaine benzylpenicillin 3g (3 million IU) powder for injection',
          ],
        },
        {
          category: 'HIV',
          rows: [
            'Lamivudine & nevirapine & zidovudine 30mg & 50mg & 60mg tablet',
            'Zidovudine/Lamivudine/Nevirapine 300/150/200mg Tablets',
          ],
        },
        {
          category: 'Vitamin A deficiency',
          rows: ['Vitamin A 100.000IUCapsule', 'Vitamin A 200.000IU Capsule'],
        },
        {
          category: 'Palliative care and pain',
          rows: [
            'Morphine (sulfate) 20mg granules (suspension)',
            'Morphine (sulfate) 30mg granules (suspension)',
            'Morphine (sulfate) 60mg granules (suspension)',
            'Morphine (sulfate) 100mg granules (suspension)',
            'Morphine (sulfate) 200mg granules (suspension)',
            'Morphine (sulfate) 10mg/mL (1mL)',
            'Morphine (hydrochloride) 10mg/5mL oral liquid',
            'Morphine 10mg/ml oral liquid',
            'Morphine (sulfate) 10mg IR tablet, ',
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
        },
      ],
    },
    {
      category: 'Priority Medicines for Child Health and Survival',
      rows: [
        {
          category: 'Tuberculosis',
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
        },
        {
          category: 'HIV, TB prohylaxis Pneumocystis carinii pneumonia',
          rows: [
            'Isoniazid 100mg Tablets',
            'Co-Trimoxazole (Trimethoprim/sulfamethoxazole) 120mg',
            'Sulfamethoxazole & trimethoprim 200mg & 40mg / 5mL oral liquid',
            'Co-Trimoxazole (Trimethoprim/sulfamethoxazole) 480mg',
          ],
        },
        {
          category: 'Neonatal care',
          rows: [
            'Caffeine citrate 20mg/mL (equivalent to 10mg caffeine base/mL) oral liquid',
            'Chlorhexidine (digluconate) 5% solution',
            'Azithromycin (anhydrous) 250mg capsule',
            'Dexamethasone 4mg/mL (1mL) disodium phosphate salt',
            'Phytomenadione 1mg/mL injection',
            'Phytomenadione 10mg/mL in 5mL ampoule injection',
          ],
        },
      ],
    },
    {
      category: 'Child and Maternal Health',
      rows: [
        {
          category: 'Malaria',
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
        },
      ],
    },
    {
      category: 'Maternal Health Products (UNFPA)',
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
    },
    {
      category: 'Contraceptives',
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
    },
    {
      category: 'Emergency Kits',
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
    },
  ],
  columns: '$orgUnit',
  cells: [
    `${prefix}_555c04bf`,
    `${prefix}_4790d43e`,
    `${prefix}_51f324bf`,
    `${prefix}_53d544bf`,
    `${prefix}_53ea14bf`,
    `${prefix}_398ac4bf`,
    `${prefix}_51b474bf`,
    `${prefix}_51ce64bf`,
    `${prefix}_4576d4bf`,
    `${prefix}_457bf4bf`,
    `${prefix}_458134bf`,
    `${prefix}_4fb394bf`,
    `${prefix}_3659b4bf`,
    `${prefix}_3654d4bf`,
    `${prefix}_4366a4bf`,
    `${prefix}_4346e4bf`,
    `${prefix}_4fd604bf`,
    `${prefix}_51f324bf`,
    `${prefix}_50d804bf`,
    `${prefix}_373ad4bf`,
    `${prefix}_373f64bf`,
    `${prefix}_373654bf`,
    `${prefix}_38b814bf`,
    `${prefix}_3827b4bf`,
    `${prefix}_382424bf`,
    `${prefix}_3e40b4bf`,
    `${prefix}_53fc34bf`,
    `${prefix}_3eb84c00`,
    `${prefix}_b3044cdc`,
    `${prefix}_47d1743e`,
    `${prefix}_0a820c00`,
    `${prefix}_46ca843e`,
    `${prefix}_47d8e43e`,
    `${prefix}_9ed445dd`,
    `${prefix}_368c74bf`,
    `${prefix}_3692b4bf`,
    `${prefix}_367c44bf`,
    `${prefix}_368674bf`,
    `${prefix}_3659b4bf`,
    `${prefix}_3654d4bf`,
    `${prefix}_38df44bf`,
    `${prefix}_38db24bf`,
    `${prefix}_4346e4bf`,
    `${prefix}_552344bf`,
    `${prefix}_5517c4bf`,
    `${prefix}_551c34bf`,
    `${prefix}_551ff4bf`,
    `${prefix}_677cf4bf`,
    `${prefix}_3659b4bf`,
    `${prefix}_38df44bf`,
    `${prefix}_38db24bf`,
    `${prefix}_4346e4bf`,
    `${prefix}_4366a4bf`,
    `${prefix}_556ce4bf`,
    `${prefix}_557054bf`,
    `${prefix}_471474bf`,
    `${prefix}_0a820c00`,
    `${prefix}_47f0c43e`,
    `${prefix}_47f8b43e`,
    `${prefix}_535b54bf`,
    `${prefix}_536054bf`,
    `${prefix}_536f54bf`,
    `${prefix}_537ec4bf`,
    `${prefix}_538e24bf`,
    `${prefix}_52f844bf`,
    `${prefix}_533734bf`,
    `${prefix}_ab6105dd`,
    `${prefix}_533194bf`,
    `${prefix}_532904bf`,
    `${prefix}_534684bf`,
    `${prefix}_534b94bf`,
    `${prefix}_536554bf`,
    `${prefix}_536a64bf`,
    `${prefix}_537474bf`,
    `${prefix}_5379b4bf`,
    `${prefix}_559794bf`,
    `${prefix}_bbfcf518`,
    `${prefix}_403004bf`,
    `${prefix}_403354bf`,
    `${prefix}_403694bf`,
    `${prefix}_471f243e`,
    `${prefix}_4726043e`,
    `${prefix}_615374bf`,
    `${prefix}_614ce4bf`,
    `${prefix}_615054bf`,
    `${prefix}_5f0c14bf`,
    `${prefix}_5ee7e4bf`,
    `${prefix}_5f11b4bf`,
    `${prefix}_292735dd`,
    `${prefix}_469064bf`,
    `${prefix}_468a44bf`,
    `${prefix}_47c2c43e`,
    `${prefix}_47ca443e`,
    `${prefix}_3f6604bf`,
    `${prefix}_3f6ad4bf`,
    `${prefix}_471f243e`,
    `${prefix}_03beecaf`,
    `${prefix}_642184bf`,
    `${prefix}_9716ccaf`,
    `${prefix}_383444bf`,
    `${prefix}_394894bf`,
    `${prefix}_373ad4bf`,
    `${prefix}_3e40b4bf`,
    `${prefix}_5dadc4bf`,
    `${prefix}_5db3a4bf`,
    `${prefix}_566bceec`,
    `${prefix}_46cfdeec`,
    `${prefix}_199ffeec`,
    `${prefix}_36d0c4bf`,
    `${prefix}_36d5b4bf`,
    `${prefix}_36df14bf`,
    `${prefix}_3a6c44bf`,
    `${prefix}_60fa34bf`,
    `${prefix}_399514bf`,
    `${prefix}_555c04bf`,
    `${prefix}_4790d43e`,
    `${prefix}_51b474bf`,
    `${prefix}_51ce64bf`,
    `${prefix}_41e9d4bf`,
    `${prefix}_41f354bf`,
    `${prefix}_484444bf`,
    `${prefix}_484d54bf`,
    `${prefix}_3b3444bf`,
    `${prefix}_a162942e`,
    `${prefix}_bf4be518`,
    `${prefix}_402924bf`,
    `${prefix}_47d584bf`,
    `${prefix}_47d584bf`,
    `${prefix}_d2d28620`,
    `${prefix}_47fb04bf`,
    `${prefix}_47fe44bf`,
    `${prefix}_53d014bf`,
    `${prefix}_4752843e`,
    `${prefix}_542a34bf`,
    `${prefix}_4718f43e`,
    `${prefix}_3b3994bf`,
    `${prefix}_49d9842e`,
    `${prefix}_7e67742e`,
    `${prefix}_b26e342e`,
    `${prefix}_e1e8342e`,
    `${prefix}_a97d742e`,
    `${prefix}_dd7b542e`,
    `${prefix}_088a142e`,
    `${prefix}_383e142e`,
    `${prefix}_bca6342e`,
    `${prefix}_756e542e`,
    `${prefix}_ae11242e`,
    `${prefix}_e1d4a42e`,
    `${prefix}_1193e42e`,
  ],
});

exports.up = async function (db) {
  // update existing report to be Months of stock
  await db.runSql(`
    update "dashboardReport"
      set id = 'UNFPA_Priority_Medicines_MOS',
        "viewJson" = '{"name": "Priority Life Saving Medicines for Women and Children (Months of stock)", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
      where id = 'UNFPA_Priority_Medicines';
  `);

  // add Stock on hand report
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Priority_Medicines_SOH',
      'tableOfValuesForOrgUnits',
      '${JSON.stringify(createConfig('SOH'))}',
      '{"name": "Priority Life Saving Medicines for Women and Children (Stock on hand)", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
    );
  `);

  // add Average monthly consumption report
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Priority_Medicines_AMC',
      'tableOfValuesForOrgUnits',
      '${JSON.stringify(createConfig('AMC'))}',
      '{"name": "Priority Life Saving Medicines for Women and Children (Average monthly consumption)", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
    );
  `);

  return db.runSql(`
      UPDATE "dashboardGroup"
      SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Priority_Medicines')
      WHERE "name" = 'UNFPA' AND "organisationLevel" IN ('Country', 'Province');

      UPDATE "dashboardGroup"
      SET "dashboardReports" =  '{UNFPA_Priority_Medicines_AMC, UNFPA_Priority_Medicines_SOH, UNFPA_Priority_Medicines_MOS}' || "dashboardReports"
      WHERE "name" = 'UNFPA' AND "organisationLevel" IN ('Country', 'Province');
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update "dashboardReport"
    set id = 'UNFPA_Priority_Medicines',
      "viewJson" = '{"name": "Priority Life Saving Medicines for Women and Children", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
    where id = 'UNFPA_Priority_Medicines_MOS';
  `);

  await db.runSql(`
    DELETE FROM "dashboardReport" where "id" IN ('UNFPA_Priority_Medicines_SOH', 'UNFPA_Priority_Medicines_AMC');
  `);

  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Priority_Medicines_SOH')
    WHERE "name" = 'UNFPA' AND "organisationLevel" IN ('Country', 'Province');
    
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Priority_Medicines_AMC')
    WHERE "name" = 'UNFPA' AND "organisationLevel" IN ('Country', 'Province');
`);
};

exports._meta = {
  version: 1,
};
