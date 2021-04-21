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

exports.up = async function (db) {
  await db.runSql(`
    DELETE from entity
    where code = 'Gerard Kepa'
  `);

  // Change entity code
  const originalEntityCodes = [
    'FETP_iGKep67',
    'FETP_iJSau15',
    'FETP_iDRes21',
    'FETP_iAPuk8',
    'FETP_iBSaf49',
    'FETP_iSJoe14',
    'FETP_iHYiy90',
    'FETP_iHKam70',
    'FETP_iMKup2',
    'FETP_iDUla4',
    'FETP_iRMwa1',
    'FETP_iSSum18',
    'FETP_iGWop91',
    'FETP_iLMol92',
    'FETP_iETur88',
    'FETP_iADuu85',
    'FETP_iJTim3',
    'FETP_iMTou25',
    'FETP_iGWam34',
    'FETP_iRLul81',
    'FETP_iTYam84',
    'FETP_iGGua89',
    'FETP_iMPog44',
    'FETP_iMWil41',
    'FETP_iTApa69',
    'FETP_iPPop63',
    'FETP_iKKam29',
    'FETP_iBSma23',
    'FETP_iRBul75',
    'FETP_iMMor27',
    'FETP_iDPol52',
    'FETP_iGNdr61',
    'FETP_iKMic71',
    'FETP_iRBam57',
    'FETP_iBMan73',
    'FETP_iRAla54',
    'FETP_iEHap17',
    'FETP_iMKin53',
    'FETP_iCKer74',
    'FETP_iRPar38',
    'FETP_iPMax72',
    'FETP_iASen13',
    'FETP_iPAti28',
    'FETP_iAFab50',
    'FETP_iMDin58',
    'FETP_iGKai68',
    'FETP_iJLan51',
    'FETP_iCAnd56',
    'FETP_iWUgo87',
    'FETP_iRUra95',
    'FETP_iGKam5',
    'FETP_iPUlg55',
    'FETP_iSMas65',
    'FETP_iSSar26',
    'FETP_iCAni20',
    'FETP_iSHag86',
    'FETP_iRJoe83',
    'FETP_iJKep96',
    'FETP_iCPid46',
    'FETP_iEPun59',
    'FETP_iCAqu76',
    'FETP_iWBia32',
    'FETP_iTAna94',
    'FETP_iNTum45',
    'FETP_iRBat22',
    'FETP_iJSau36',
    'FETP_iYMwa37',
    'FETP_iGTow39',
    'FETP_iMKae64',
    'FETP_iKYam47',
    'FETP_iSEli80',
    'FETP_iRWak82',
    'FETP_iTTun77',
    'FETP_iLLak9',
    'FETP_iRGat42',
    'FETP_iGKun11',
    'FETP_iEBen10',
    'FETP_iATab93',
    'FETP_iESta62',
    'FETP_iINar40',
    'FETP_iJAme78',
    'FETP_iJTei31',
    'FETP_iGSui30',
    'FETP_iROak35',
    'FETP_iBBom24',
    'FETP_iGTen16',
    'FETP_iPMuk33',
    'FETP_iCJos79',
    'FETP_iWMar7',
    'FETP_iDKis66',
    'FETP_iJKum6',
    'FETP_iBPen12',
    'FETP_iAKum48',
    'FETP_iAMar43',
    'FETP_iEHev19',
    'FETP_iRRob60',
  ];
  const newEntityCodes = [
    'FETP-3C3X',
    'FETP-Q6IR',
    'FETP-PEIX',
    'FETP-DYO3',
    'FETP-PHEF',
    'FETP-CS2L',
    'FETP-IO9M',
    'FETP-WSLS',
    'FETP-V6U5',
    'FETP-IHNV',
    'FETP-NKJM',
    'FETP-3VCJ',
    'FETP-7O3P',
    'FETP-SVT1',
    'FETP-1H38',
    'FETP-AWYS',
    'FETP-ISN8',
    'FETP-0L1U',
    'FETP-XYMR',
    'FETP-14CZ',
    'FETP-AN0I',
    'FETP-P7S9',
    'FETP-POPN',
    'FETP-S72P',
    'FETP-R8WC',
    'FETP-36WM',
    'FETP-MBNV',
    'FETP-SKGQ',
    'FETP-SMZS',
    'FETP-5QZG',
    'FETP-HTR7',
    'FETP-S9XO',
    'FETP-0WX7',
    'FETP-TODV',
    'FETP-END6',
    'FETP-FL45',
    'FETP-4KNV',
    'FETP-XPV5',
    'FETP-PLE1',
    'FETP-A5NM',
    'FETP-UOVP',
    'FETP-P1YX',
    'FETP-E7SF',
    'FETP-FYML',
    'FETP-Z2WP',
    'FETP-COF9',
    'FETP-GUND',
    'FETP-HFQU',
    'FETP-D8DS',
    'FETP-WAUD',
    'FETP-SU1C',
    'FETP-LNZW',
    'FETP-QBXC',
    'FETP-XDRP',
    'FETP-Y1O2',
    'FETP-U9TW',
    'FETP-IO9O',
    'FETP-1D1V',
    'FETP-I96L',
    'FETP-S3CU',
    'FETP-MSH3',
    'FETP-JPT6',
    'FETP-RW3S',
    'FETP-KHGF',
    'FETP-9SFK',
    'FETP-5VLT',
    'FETP-IHBP',
    'FETP-78NT',
    'FETP-2G3X',
    'FETP-WZIN',
    'FETP-LT0O',
    'FETP-ZUIX',
    'FETP-3J2M',
    'FETP-PWEI',
    'FETP-FTHC',
    'FETP-YJDU',
    'FETP-C04B',
    'FETP-YLUK',
    'FETP-2BY0',
    'FETP-KJZP',
    'FETP-L5ZX',
    'FETP-832V',
    'FETP-56E3',
    'FETP-ZAEL',
    'FETP-OOJO',
    'FETP-TG6Z',
    'FETP-ML91',
    'FETP-B08Y',
    'FETP-QLGW',
    'FETP-P4N7',
    'FETP-EJQ2',
    'FETP-QPQN',
    'FETP-JCOT',
    'FETP-Y3TO',
    'FETP-3F0Y',
    'FETP-M5BJ',
  ];
  for (let i = 0; i < originalEntityCodes.length; i++) {
    await db.runSql(`
    UPDATE entity 
    SET code = '${newEntityCodes[i]}'
    where code = '${originalEntityCodes[i]}';
  `);
  }

  // Trim entity code
  const clinicEntityCodes = ['WS_VPL438 ', 'KH_Phnom Penh Municipality ', 'TO_princessfusipala '];
  for (const entityCode of clinicEntityCodes) {
    const trimmedEntityCode = entityCode.trim();
    await db.runSql(`
      UPDATE entity 
      SET code = '${trimmedEntityCode}'
      where code = '${entityCode}';

      UPDATE clinic 
      SET code = '${trimmedEntityCode}'
      where code = '${entityCode}';
    `);
  }
  const nonClinicEntityCodes = ['NR_Yaren ', 'NR_Anibare ', 'FJ-14_HC_Sawakasa '];
  for (const entityCode of nonClinicEntityCodes) {
    const trimmedEntityCode = entityCode.trim();
    await db.runSql(`
      UPDATE entity 
      SET code = '${trimmedEntityCode}'
      where code = '${entityCode}';
    `);
  }
  // Trim entity name
  const entityName = 'Phnom Penh Municipality ';
  await db.runSql(`
  UPDATE entity 
  SET name = '${entityName.trim()}'
  where name = '${entityName}';

  UPDATE clinic 
  SET name = '${entityName.trim()}'
  where name = '${entityName}';
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
