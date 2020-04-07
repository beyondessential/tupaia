'use strict';

var dbm;
var type;
var seed;

// include these by title/group rather than by ID as it isn't guaranteed that
// previous migrations will have assigned the same IDs
const sortValues = [
  ['Adult weighing scale', 'Facility equipment'],
  ["Children's weighing scale", 'Facility equipment'],
  ['Infant weighing scale', 'Facility equipment'],
  ['Measuring tape or height board', 'Facility equipment'],
  ['Thermometer', 'Facility equipment'],
  ['Stethoscope', 'Facility equipment'],
  ['Blood pressure machine', 'Facility equipment'],
  ['Oxygen bottles', 'Facility equipment'],
  ['Oxygen concentrators', 'Facility equipment'],
  ['Peak flow meter', 'Facility equipment'],
  ['Spacer', 'Facility equipment'],
  ['Light microscope', 'Facility equipment'],
  ['Critical Item Availability', 'Medicines & Consumables'],
  ['Acetylsalicyclic Acid (Aspirin) 100mg tab', 'Medicines & Consumables'],
  ['Albendazole 400mg Tablet', 'Medicines & Consumables'],
  ['Amoxicillin oral solid dosage form', 'Medicines & Consumables'],
  ['Amoxycillin Suspension', 'Medicines & Consumables'],
  ['Ampicillin Injection', 'Medicines & Consumables'],
  ['Artemisinin combination therapy (ACT) for malaria', 'Medicines & Consumables'],
  ['Artesunate or Artemether: rectal or injection dosage forms', 'Medicines & Consumables'],
  ['Benzathine benzylpenicillin: powder for injection', 'Medicines & Consumables'],
  ['Calcium Gluconate Injection', 'Medicines & Consumables'],
  ['Ceftriaxone Injection', 'Medicines & Consumables'],
  ['Co-Trimoxazole 480mg tabs (Septrin)', 'Medicines & Consumables'],
  ['Dexamethasone 4mg Injection', 'Medicines & Consumables'],
  ['Diazepam 5 mg cap/tab or inj', 'Medicines & Consumables'],
  ['Enalapril 5mg CardTabs', 'Medicines & Consumables'],
  ['Ferrous sulphate + Folic Acid tabs', 'Medicines & Consumables'],
  ['Flucloxacillin 250mg Caps', 'Medicines & Consumables'],
  ['Flucloxacillin Suspension', 'Medicines & Consumables'],
  ['Gentamicin 40mg Injection', 'Medicines & Consumables'],
  ['Glibenclamide 5mg CardTabs', 'Medicines & Consumables'],
  ['Hepatitis B Vaccine', 'Medicines & Consumables'],
  ['Hydrazaline Tablets or Injections', 'Medicines & Consumables'],
  ['Hydrochlorothiazide 25mg CardTabs', 'Medicines & Consumables'],
  ['Ibuprofen tablets', 'Medicines & Consumables'],
  ['Insulin', 'Medicines & Consumables'],
  ['Magnesium Sulfate 50% Injection', 'Medicines & Consumables'],
  ['Injectable depot contraceptives (Depo Provera)', 'Medicines & Consumables'],
  ['Jadelle Contraceptive Implant', 'Medicines & Consumables'],
  ['Levonorgestrel 750mcg or 1.5mg CardTabs', 'Medicines & Consumables'],
  ['Metformin 500mg CardTabs', 'Medicines & Consumables'],
  ['Methyldopa 250mg CardTabs', 'Medicines & Consumables'],
  ['Metronidazole Tablets or Injections', 'Medicines & Consumables'],
  ['Metronidazole Injections', 'Medicines & Consumables'],
  ['Metronidazole Tablets', 'Medicines & Consumables'],
  ['MR Vaccine', 'Medicines & Consumables'],
  ['Nifedipine CardTabs', 'Medicines & Consumables'],
  ['Opioid - Oral or Injectable', 'Medicines & Consumables'],
  ['Oral contraceptives', 'Medicines & Consumables'],
  ['Oral rehydration salts (ORS)', 'Medicines & Consumables'],
  ['Oxytocin 10IU inj', 'Medicines & Consumables'],
  ['Paracetamol 24 mg/ml susp', 'Medicines & Consumables'],
  ['Paracetamol 500mg tablets or capsules', 'Medicines & Consumables'],
  ['Procaine benzylpenicillin injection', 'Medicines & Consumables'],
  ['Salbutamol 0.1 mg/dose inhaler', 'Medicines & Consumables'],
  ['Sodium chloride 0.9% (Normal Saline) 500ml or 1L', 'Medicines & Consumables'],
  ["Sodium lactate compound (Ringer's) solution 500ml or 1L", 'Medicines & Consumables'],
  ['STI Treatment Pack (Azithromycin/Cefixime)', 'Medicines & Consumables'],
  ['TB Vaccine (BCG)', 'Medicines & Consumables'],
  ['Tetanus vaccine', 'Medicines & Consumables'],
  ['Vitamin A 50,000, 100,000 or 200,000 IU caps', 'Medicines & Consumables'],
  ['Zinc sulphate 20 mg tab or dispersible tabs', 'Medicines & Consumables'],
  ['Male condoms', 'Medicines & Consumables'],
  ['Female condoms', 'Medicines & Consumables'],
  ['Disposable plastic/latex examination gloves', 'Medicines & Consumables'],
  ['IV infusion kits', 'Medicines & Consumables'],
  ['Basic bandages (Gauze or appropriate alternatives)', 'Medicines & Consumables'],
  ['Plaster of Paris bandages (at least one size)', 'Medicines & Consumables'],
  ['Needles AND syringes (at least one child-appropriate size)', 'Medicines & Consumables'],
  ['Needles AND syringes (at least one adult-appropriate size)', 'Medicines & Consumables'],
  ['Scissors', 'Medicines & Consumables'],
  ['Forceps', 'Medicines & Consumables'],
  ['Scalpel blades', 'Medicines & Consumables'],
  ['Catheters (at least one child-appropriate size)', 'Medicines & Consumables'],
  ['Catheters (at least one adult-appropriate size)', 'Medicines & Consumables'],
  ['Disposable face masks', 'Medicines & Consumables'],
  ['Sutures or suture kits', 'Medicines & Consumables'],
  ['Delivery Pack or Tray', 'Medicines & Consumables'],
  ['Cord Clamp/s', 'Medicines & Consumables'],
  ['Needle holder', 'Medicines & Consumables'],
  ['Manual vacuum extractor', 'Medicines & Consumables'],
  ['Vacuum Aspirator or D&C kit', 'Medicines & Consumables'],
  ['Peak flow meter', 'Medicines & Consumables'],
  ['Water available at the facility', 'Water and Sanitation'],
  ['Drinking water available at the facility', 'Water and Sanitation'],
  ['Functional toilet for patients?', 'Water and Sanitation'],
  ['Type of toilet', 'Water and Sanitation'],
  ['Water purifying tablets available', 'Water and Sanitation'],
  ['Incinerator', 'Water and Sanitation'],
  ['Hand washing soap (bar or liquid)', 'Water and Sanitation'],
  ['Alcohol based hand rub', 'Water and Sanitation'],
  ['Sharps container', 'Water and Sanitation'],
  ['Electricity', 'Electricity'],
  ['Main source of electricity', 'Electricity'],
  ['Functional generator', 'Electricity'],
  ['Functional solar power', 'Electricity'],
  ['Fridge/s', 'Electricity'],
  ['Freezer/s', 'Electricity'],
  ['Lights', 'Electricity'],
  ['Medical Equipment', 'Electricity'],
  ['Air conditioning', 'Electricity'],
  ['Lamps or portable emergency lights', 'Electricity'],
  ['Back-up Electricity', 'Electricity'],
  ['Working fridge', 'Cold Chain'],
  ['No fridge present', 'Cold Chain'],
  ['Solar fridge present', 'Cold Chain'],
  ['Gas fridge present', 'Cold Chain'],
  ['Domestic fridge present', 'Cold Chain'],
  ['Other fridge present', 'Cold Chain'],
  ['Thermometer present', 'Cold Chain'],
  ['Temperature log', 'Cold Chain'],
  ['MMR or MR vaccine', 'Cold Chain'],
  ['Pentavalent vaccine', 'Cold Chain'],
  ['Tetanus vaccine', 'Cold Chain'],
  ['Hep B vaccine', 'Cold Chain'],
  ['Polio vaccine', 'Cold Chain'],
  ['Rotavirus vaccine', 'Cold Chain'],
  ['Pneumovax vaccine', 'Cold Chain'],
  ['BCG vaccine', 'Cold Chain'],
  ['HPV vaccine', 'Cold Chain'],
  ['Operational facilities', 'Services provided'],
  ['Inpatient facilities', 'Services provided'],
  ['Inpatient beds', 'Services provided'],
  ['Basic first aid and life support', 'Services provided'],
  ['Initial wound care', 'Services provided'],
  ['Contraception', 'Services provided'],
  ['Antenatal care', 'Services provided'],
  ['Delivery of babies', 'Services provided'],
  ['Cesarean sections', 'Services provided'],
  ['Regular immunisation services', 'Services provided'],
  ['Diagnosis and management of TB', 'Services provided'],
  ['Diagnosis and treatment of malaria', 'Services provided'],
  ['Treatment for STIs (other than HIV)', 'Services provided'],
  ['Diagnosis and treatment of malnutrition', 'Services provided'],
  ['Child growth monitoring', 'Services provided'],
  ['HIV testing and counselling', 'Services provided'],
  ['Post-exposure prophylaxis (PEP) for STI & HIV infections', 'Services provided'],
  ['Diagnosis and management of CVD', 'Services provided'],
  ['Diagnosis and treatment of diabetes', 'Services provided'],
  ['Diagnosis and management of chronic respiratory diseases', 'Services provided'],
  ['Unmarried youth contraception', 'Services provided'],
  ['Incision and drainage of abscesses', 'Services provided'],
  ['Wound debridement', 'Services provided'],
  ['Acute burn management', 'Services provided'],
  ['Suturing', 'Services provided'],
  ['Closed repair of fractures', 'Services provided'],
  ['Cricothyroidotomy', 'Services provided'],
  ['Male circumcision', 'Services provided'],
  ['Hydrocele reduction', 'Services provided'],
  ['Chest tube insertion', 'Services provided'],
  ['Closed repair of dislocated joint', 'Services provided'],
  ['Blood transfusions', 'Services provided'],
  ['Cholesterol testing', 'Laboratory and diagnosis'],
  ['X-Ray Machine', 'Laboratory and diagnosis'],
  ['Ultrasound', 'Laboratory and diagnosis'],
  ['Pregnancy tests', 'Laboratory and diagnosis'],
  ['Malaria Rapid Diagnostic Test Kit', 'Laboratory and diagnosis'],
  ['Blood Glucose testing', 'Laboratory and diagnosis'],
  ['Rapid HIV testing', 'Laboratory and diagnosis'],
  ['Rapid syphillis testing', 'Laboratory and diagnosis'],
  ['Urine protein/Glucose/Ketone', 'Laboratory and diagnosis'],
  ['Rapid Haemoglobin', 'Laboratory and diagnosis'],
  ['General microscopy', 'Laboratory and diagnosis'],
  ['ECG', 'Laboratory and diagnosis'],
  ['Priority Disease IEC', 'PEHS'],
  ['Facility type', ''],
  ['Inpatient beds coloring', ''],
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  let task = db.runSql(`
    ALTER TABLE "mapOverlay"
      ADD COLUMN "sortOrder" REAL NOT NULL DEFAULT 0;
  `);

  sortValues.map(([name, group], i) => {
    task = task.then(() =>
      db.runSql(
        `
      UPDATE "mapOverlay" 
        SET "sortOrder" = ?
        WHERE "name" = ?
          AND "groupName" = ?
    `,
        [i, name, group],
      ),
    );
  });
  return task;
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "mapOverlay"
      DROP COLUMN "sortOrder";
  `);
};

exports._meta = {
  version: 1,
};
