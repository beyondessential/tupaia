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
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Adult weighing scale', 'BCD61', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', "Children's weighing scale", 'BCD62', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Infant weighing scale', 'BCD63', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Measuring tape or height board', 'BCD64', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Thermometer', 'BCD65', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Stethoscope', 'BCD66', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Blood pressure machine', 'BCD67', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Oxygen bottles', 'BCD83', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Oxygen concentrators', 'BCD84', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Peak flow meter', 'BCD92', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Spacer', 'BCD93', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Facility equipment', 'Donor', 'Light microscope', 'BCD94', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Critical Item Availability',
          'PercentageCriticalMedicinesAvailable',
          'circleHeatmap',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Acetylsalicyclic Acid (Aspirin) 100mg tab',
          'ACSA1000TAB000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Albendazole 400mg Tablet', 'ADZL4000TCW000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Amoxicillin oral solid dosage form',
          'AMXCXXXXSOD000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Amoxycillin Suspension', 'AMXCXXXXPOL005', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Ampicillin Injection', 'AMPCXXXXPFI004', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Artemisinin combination therapy (ACT) for malaria',
          'AMLM2012TAB000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Artesunate or Artemether: rectal or injection dosage forms',
          'ARSNXXXXRDF000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Benzathine benzylpenicillin: powder for injection',
          'BZPNXXXXPFI000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Calcium Gluconate Injection', 'CAGNXXXXINJ000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Ceftriaxone Injection', 'CFXNXXXXPFI000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Co-Trimoxazole 480mg tabs (Septrin)',
          'SXTP4008TAB000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Dexamethasone 4mg Injection', 'DEXA0040INJ006', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Diazepam 5 mg cap/tab or inj', 'DZPM0050TAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Enalapril 5mg Tabs', 'ENPL0050TAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Ferrous sulphate + Folic Acid tabs',
          'FRSFXXXXTAB000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Flucloxacillin 250mg Caps', 'CLXNXXXXCAP004', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Flucloxacillin Suspension', 'CLXNXXXXPOL0005', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Gentamicin 40mg Injection', 'GMCN0040INJ002', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Glibenclamide 5mg Tabs', 'GLIB0050TAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Hepatitis B Vaccine', 'HEPB0000VAC000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Hydrazaline Tablets or Injections',
          'HYDZXXXXXXX001',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Hydrochlorothiazide 25mg Tabs', 'HTHZ0250SOD000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Ibuprofen tablets', 'IBFNXXXXTAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Insulin', 'INSN1010INJ000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Magnesium Sulfate 50% Injection',
          'MGSFXXXXINJ002',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Injectable depot contraceptives (Depo Provera)',
          'MXPAXXXXINJ000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Jadelle Contraceptive Implant', 'Jadelle', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Levonorgestrel 750mcg or 1.5mg Tabs',
          'LVGLXXXXTAB000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Metformin 500mg Tabs', 'MTFN0500TAB001', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Methyldopa 250mg Tabs', 'MDPA2500TAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Metronidazole Tablets or Injections',
          'MDZLXXXXXXX000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Metronidazole Injections', 'MDZLXXXXINJ000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Metronidazole Tablets', 'MDZLXXXXTAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'MR Vaccine', 'MUMP0000VAC000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Nifedipine Tabs', 'NFPNXXXXCIR000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Opioid - Oral or Injectable', 'Opioid', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Oral contraceptives', 'ETLEXXXXTAB000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Oral rehydration salts (ORS)', 'ORHS1000PFD000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Oxytocin 10IU inj', 'OXYT0010INJ000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Paracetamol 24 mg/ml susp', 'PCML0024SUS000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Paracetamol 500mg tablets or capsules',
          'PCML1000TAB000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Procaine benzylpenicillin injection',
          'PCBZXXXXPFI000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Salbutamol 0.1 mg/dose inhaler',
          'SBML1000MDI002',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Sodium chloride 0.9% (Normal Saline) 500ml or 1L',
          'NACL0009INS000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          "Sodium lactate compound (Ringer's) solution 500ml or 1L",
          'NALC0000INS000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'STI Treatment Pack (Azithromycin/Cefixime)',
          'AZMNXXXXCAP000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'TB Vaccine (BCG)', 'BCGV0000VAC000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Tetanus vaccine', 'TETN0000VAC000', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Vitamin A 50,000, 100,000 or 200,000 IU caps',
          'RTNLXXXXCAP007',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Zinc sulphate 20 mg tab or dispersible tabs',
          'ZNSF0020SOD000',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Male condoms', 'BCD59', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Female condoms', 'BCD60', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Disposable plastic/latex examination gloves',
          'BCD68',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'IV infusion kits', 'BCD70', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Basic bandages (Gauze or appropriate alternatives)',
          'BCD71',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Plaster of Paris bandages (at least one size)',
          'BCD72',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Needles AND syringes (at least one child-appropriate size)',
          'BCD73',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Needles AND syringes (at least one adult-appropriate size)',
          'BCD74',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Scissors', 'BCD75', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Forceps', 'BCD76', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Scalpel blades', 'BCD77', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Catheters (at least one child-appropriate size)',
          'BCD78',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Medicines & Consumables',
          'Admin',
          'Catheters (at least one adult-appropriate size)',
          'BCD79',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Disposable face masks', 'BCD80', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Sutures or suture kits', 'BCD81', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Delivery Pack or Tray', 'BCD87', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Cord Clamp/s', 'BCD88', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Needle holder', 'BCD89', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Manual vacuum extractor', 'BCD90', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Vacuum Aspirator or D&C kit', 'BCD91', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Medicines & Consumables', 'Admin', 'Peak flow meter', 'BCD92', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Public', 'Clean water', 'BCD29', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Public', 'Is the main source of water drinkable?', 'BCD31', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Public', 'Functional toilet for patients?', 'BCD32', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Donor', 'Type of toilet', 'BCD33', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Donor', 'Water purifying tablets available', 'DP70', 'circle'],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Donor', 'Incinerator', 'SS36', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Donor', 'Hand washing soap (bar or liquid)', 'DP64', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Donor', 'Alcohol based hand rub', 'SS42', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Water and Sanitation', 'Donor', 'Sharps container', 'SS44', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Public', 'Electricity', 'SS9', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType', 'customColors'],
        [
          'Electricity',
          'Public',
          'Main source of electricity',
          'SS20',
          '',
          'Orange,Green,Gold,DarkBlue,LightSkyBlue,Red',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Public', 'Functional generator', 'SS25', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Public', 'Functional solar power', 'SS26', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Fridge/s', 'SS10', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Freezer/s', 'SS11', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Lights', 'SS12', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Medical Equipment', 'SS13', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Computers', 'SS14', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Fan', 'SS15', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Air conditioning', 'SS16', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Lamps or portable emergency lights', 'SS17', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Main electricity source', 'SS20', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Electricity', 'Donor', 'Back-up Electricity', 'SS22', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Public', 'Working fridge', 'BCD25', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'No fridge present', 'BCD24g', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Solar fridge present', 'BCD24a', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Gas fridge present', 'BCD24b', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Domestic fridge present', 'BCD24d', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Other electric fridge present', 'BCD24e', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Other fridge present', 'BCD24f', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Thermometer present', 'BCD26', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Admin', 'Temperature log', 'BCD27', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'MMR or MR vaccine', 'SS172', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Pentavalent vaccine', 'SS173', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Tetanus vaccine', 'SS174', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Hep B vaccine', 'SS175', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Polio vaccine', 'SS176', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Rotavirus vaccine', 'SS177', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'Pneumovax vaccine', 'SS178', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'BCG vaccine', 'SS179', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Cold Chain', 'Donor', 'HPV vaccine', 'SS180', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType', 'customColors'],
        [
          'Services provided',
          'Public',
          'Operational facilities',
          'BCD1',
          'dot',
          'RoyalBlue,RoyalBlue,OrangeRed,OrangeRed',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Inpatient facilities', 'FF6', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Inpatient beds', 'SS1', 'circle'],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Basic first aid and life support', 'DP5', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Initial wound care', 'DP6', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Contraception', 'SS106', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Antenatal care', 'SS120', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Delivery of babies', 'SS128', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Cesarean sections', 'SS155', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Regular immunisation services', 'SS157', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Diagnosis and management of TB', 'SS190', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Diagnosis and treatment of malaria', 'SS192', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Public', 'Treatment for STIs (other than HIV)', 'SS182', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Diagnosis and treatment of malnutrition', 'SS93', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Child growth monitoring', 'SS98', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'HIV testing and counselling', 'SS101', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Services provided',
          'Donor',
          'Post-exposure prophylaxis (PEP) for STI & HIV infections',
          'DP48',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Diagnosis or management of NCDs', 'SS103', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Diagnosis and treatment of diabetes', 'SS104', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        [
          'Services provided',
          'Donor',
          'Diagnosis and management of chronic respiratory diseases',
          'SS105',
          '',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Unmarried youth contraception', 'SS108', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Incision and drainage of abscesses', 'SS196', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Wound debridement', 'SS197', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Acute burn management', 'SS198', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Suturing', 'SS199', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Closed repair of fractures', 'SS200', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Cricothyroidotomy', 'SS201', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Male circumcision', 'SS202', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Hydrocele reduction', 'SS203', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Chest tube insertion', 'SS204', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Closed repair of dislocated joint', 'SS205', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Services provided', 'Donor', 'Blood transfusions', 'SS207', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Public', 'Cholesterol testing', 'SS218', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Public', 'X-Ray Machine', 'SS219', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Public', 'Ultrasound', 'SS220', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Public', 'Pregnancy tests', 'SS212', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Public', 'Malaria Rapid Diagnostic Test Kit', 'BCD95', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Public', 'Blood Glucose testing', 'SS215', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Donor', 'Rapid HIV testing', 'SS210', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Donor', 'Rapid syphillis testing', 'SS211', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Donor', 'Urine protein/Glucose/Ketone', 'SS214', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Donor', 'Rapid Haemoglobin', 'SS216', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Donor', 'General microscopy', 'DP15', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType'],
        ['Laboratory and diagnosis', 'Donor', 'ECG', 'SS221', ''],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'mapOverlay',
        ['groupName', 'userGroup', 'name', 'dataElementCode', 'displayType', 'customColors'],
        ['PEHS', 'Admin', 'ICS', 'PEHS762', '', 'White,Green,Orange,Red,Grey'],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
