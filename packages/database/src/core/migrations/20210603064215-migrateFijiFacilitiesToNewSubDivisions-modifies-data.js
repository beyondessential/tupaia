'use strict';

import { codeToId, arrayToDbString, generateId, insertObject } from '../utilities';

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

const facilitiesToMigrate = {
  FJ_023: 'FJ_sdRewa_Nausori', //	Baulevu Nursing Station
  FJ_013: 'FJ_sdSerua_Namosi', //	Beqa Health Centre
  FJ_001: 'FJ_sdSuva', //	Colonial War Memorial Divisional Hospital
  FJ_032: 'FJ_sdTailevu', //	Dawasamu Nursing Station
  FJ_246: 'FJ_sdNasinu', //	Fiji Centre for Disease Control
  FJ_247: 'FJ_sdSuva', //	Fiji Pharmaceutical and Biomedical Services Warehouse
  FJ_016: 'FJ_sdSerua_Namosi', //	Galoa Nursing Station
  FJ_245: 'FJ_sdSuva', //	Kidney Dialysis Centre
  FJ_014: 'FJ_sdSerua_Namosi', //	Korovisilou Health Centre
  FJ_028: 'FJ_sdTailevu', //	Korovou Health Centre
  FJ_225: 'FJ_sdSuva', //	Korovou Prison Station
  FJ_027: 'FJ_sdTailevu', //	Korovou Sub-divisional Hospital
  FJ_007: 'FJ_sdSuva', //	Lami Health Centre
  FJ_039: 'FJ_sdNaitasiri', //	Laselevu Health Centre
  FJ_029: 'FJ_sdTailevu', //	Lodoni Health Centre
  FJ_041: 'FJ_sdNaitasiri', //	Lomaivuna Nursing Station
  FJ_208: 'FJ_sdNasinu', //	Makoi Birthing Unit
  FJ_008: 'FJ_sdNasinu', //	Makoi Health Centre
  FJ_022: 'FJ_sdRewa_Nausori', //	Mokani Health Centre
  FJ_209: 'FJ_sdSuva', //	Muanikau Health Centre
  FJ_010: 'FJ_sdSuva', //	Naboro Nursing Station
  FJ_045: 'FJ_sdNaitasiri', //	Naboubuco Nursing Station
  FJ_025: 'FJ_sdRewa_Nausori', //	Naililili Nursing Station
  FJ_211: 'FJ_sdNasinu', //	Nakasi Health Centre
  FJ_040: 'FJ_sdNaitasiri', //	Nakorosule Health Centre
  FJ_024: 'FJ_sdRewa_Nausori', //	Namara Nursing Station
  FJ_015: 'FJ_sdSerua_Namosi', //	Namuamua Health Centre
  FJ_038: 'FJ_sdNaitasiri', //	Naqali Health Centre
  FJ_019: 'FJ_sdSerua_Namosi', //	Naqarawai Nursing Station
  FJ_043: 'FJ_sdNaitasiri', //	Narokorokoyawa Nursing Station
  FJ_046: 'FJ_sdNaitasiri', //	Nasoqo Nursing Station
  FJ_021: 'FJ_sdRewa_Nausori', //	Nausori Health Centre
  FJ_212: 'FJ_sdRewa_Nausori', //	Nausori Maternity Hospital
  FJ_012: 'FJ_sdSerua_Namosi', //	Navua Health Centre
  FJ_011: 'FJ_sdSerua_Namosi', //	Navua Sub-divisional Hospital
  FJ_018: 'FJ_sdSerua_Namosi', //	Navunikabi Nursing Station
  FJ_030: 'FJ_sdTailevu', //	Nayavu Health Centre
  FJ_005: 'FJ_sdNasinu', //	Nuffield Health Centre
  FJ_034: 'FJ_sdTailevu', //	QVS Nursing Station
  FJ_003: 'FJ_sdSuva', //	Raiwaqa Health Centre
  FJ_214: 'FJ_sdSerua_Namosi', //	Raviravi Nursing Station
  FJ_218: 'FJ_sdSuva', //	Reproductive and Family Health Association of Fiji Clinic
  FJ_033: 'FJ_sdTailevu', //	RKS Nursing Station
  FJ_229: 'FJ_sdSuva', //	Royal Fiji Military Forces
  FJ_228: 'FJ_sdSuva', //	Royal Fiji Police
  FJ_004: 'FJ_sdSuva', //	Samabula Health Centre
  FJ_227: 'FJ_sdSuva', //	Sexual and Reproductive Health Clinic
  FJ_226: 'FJ_sdSuva', //	St. Giles Hospital
  FJ_002: 'FJ_sdSuva', //	Suva Health Centre
  FJ_009: 'FJ_sdSuva', //	Suva Hub Centre
  FJ_248: 'FJ_sdNasinu', //	Tamavua Sub-divisional Hospital
  FJ_035: 'FJ_sdTailevu', //	Tonia Nursing Station
  FJ_006: 'FJ_sdNasinu', //	Valelevu Health Centre
  FJ_220: 'FJ_sdTailevu', //	Vatukarasa Nursing Station
  FJ_031: 'FJ_sdTailevu', //	Verata Nursing Station
  FJ_037: 'FJ_sdNaitasiri', //	Vunidawa Health Centre
  FJ_036: 'FJ_sdNaitasiri', //	Vunidawa Sub-divisional Hospital
  FJ_042: 'FJ_sdNaitasiri', //	Waidina Nursing Station
  FJ_111: 'FJ_sdRa', //	Waimaro Health Centre
  FJ_222: 'FJ_sdRewa_Nausori', //	Wainibokasi Health Centre
  FJ_020: 'FJ_sdRewa_Nausori', //	Wainibokasi Sub-divisional Hospital
  FJ_017: 'FJ_sdSerua_Namosi', //	Waivaka Nursing Station
  FJ_160: 'FJ_sdLomaiviti', //	Batiki Nursing Station
  FJ_159: 'FJ_sdLomaiviti', //	Bureta Health Centre
  FJ_191: 'FJ_sdLakeba', //	Cakova Nursing Station
  FJ_202: 'FJ_sdLomaloma', //	Cicia Health Centre
  FJ_171: 'FJ_sdKadavu', //	Daviqele Health Centre
  FJ_193: 'FJ_sdLakeba', //	Dravuwalu Nursing Station
  FJ_197: 'FJ_sdLakeba', //	Fulaga Nursing Station
  FJ_174: 'FJ_sdKadavu', //	Gasele Nursing Station
  FJ_157: 'FJ_sdLomaiviti', //	Qarani Health Centre
  FJ_183: 'FJ_sdLakeba', //	Kabara Health Centre
  FJ_195: 'FJ_sdLakeba', //	Kabara Nursing Station
  FJ_170: 'FJ_sdKadavu', //	Kavala Health Centre
  FJ_188: 'FJ_sdLakeba', //	Komo Nursing Station
  FJ_158: 'FJ_sdLomaiviti', //	Koro Health Centre
  FJ_180: 'FJ_sdLakeba', //	Lakeba Health Centre
  FJ_179: 'FJ_sdLakeba', //	Lakeba Sub-divisional Hospital
  FJ_156: 'FJ_sdLomaiviti', //	Levuka Health Centre
  FJ_155: 'FJ_sdLomaiviti', //	Levuka Sub-divisional Hospital
  FJ_194: 'FJ_sdLakeba', //	Levuka-I-Daku Nursing Station
  FJ_201: 'FJ_sdLomaloma', //	Lomaloma Health Centre
  FJ_200: 'FJ_sdLomaloma', //	Lomaloma Sub-divisional Hospital
  FJ_182: 'FJ_sdLakeba', //	Matuku Health Centre
  FJ_181: 'FJ_sdLakeba', //	Moala Health Centre
  FJ_189: 'FJ_sdLakeba', //	Moce Nursing Station
  FJ_167: 'FJ_sdLomaiviti', //	Moturiki Nursing Station
  FJ_203: 'FJ_sdLomaloma', //	Mualevu Nursing Station
  FJ_165: 'FJ_sdLomaiviti', //	Nabasovi Nursing Station
  FJ_166: 'FJ_sdLomaiviti', //	Nacamaki Nursing Station
  FJ_162: 'FJ_sdLomaiviti', //	Nacavanadi Nursing Station
  FJ_161: 'FJ_sdLomaiviti', //	Nairai Nursing Station
  FJ_177: 'FJ_sdKadavu', //	Nalotu Nursing Station
  FJ_196: 'FJ_sdLakeba', //	Namuka Nursing Station
  FJ_175: 'FJ_sdKadavu', //	Naqara Nursing Station
  FJ_163: 'FJ_sdLomaiviti', //	Narocake Nursing Station
  FJ_190: 'FJ_sdLakeba', //	Nasoki Nursing Station
  FJ_164: 'FJ_sdLomaiviti', //	Nawaikama Nursing Station
  FJ_186: 'FJ_sdLomaloma', //	Nayau Nursing Station
  FJ_198: 'FJ_sdLakeba', //	Ogea Nursing Station
  FJ_187: 'FJ_sdLakeba', //	Oneata Nursing Station
  FJ_184: 'FJ_sdLakeba', //	Ono-i-Lau Health Centre
  FJ_172: 'FJ_sdKadavu', //	Ravitaki Nursing Station
  FJ_206: 'FJ_sdLomaloma', //	Rotuma Health Centre
  FJ_205: 'FJ_sdLomaloma', //	Rotuma Sub-divisional Hospital
  FJ_173: 'FJ_sdKadavu', //	Soso Nursing Station
  FJ_178: 'FJ_sdKadavu', //	Talaulia Nursing Station
  FJ_192: 'FJ_sdLakeba', //	Totoya Nursing Station
  FJ_204: 'FJ_sdLomaloma', //	Tuvuca Nursing Station
  FJ_176: 'FJ_sdKadavu', //	Vacalea Nursing Station
  FJ_185: 'FJ_sdLakeba', //	Vanuavatu Nursing Station
  FJ_199: 'FJ_sdLakeba', //	Vatoa Nursing Station
  FJ_169: 'FJ_sdKadavu', //	Vunisea Health Centre
  FJ_168: 'FJ_sdKadavu', //	Vunisea Sub-divisional Hospital
  FJ_138: 'FJ_sdCakaudrove', //	Bagasau Nursing Station
  FJ_147: 'FJ_sdTaveuni', //	Bouma Nursing Station
  FJ_151: 'FJ_sdBua', //	Bua Nursing Station
  FJ_120: 'FJ_sdMacuata', //	Cikobia Nursing Station
  FJ_126: 'FJ_sdMacuata', //	Coqeloa Nursing Station
  FJ_124: 'FJ_sdMacuata', //	Dogotuki Nursing Station
  FJ_117: 'FJ_sdMacuata', //	Dreketi Health Centre
  FJ_125: 'FJ_sdMacuata', //	Kia Nursing Station
  FJ_139: 'FJ_sdCakaudrove', //	Kioa Nursing Station
  FJ_135: 'FJ_sdCakaudrove', //	Korotasere Health Centre
  FJ_154: 'FJ_sdBua', //	Kubulau Nursing Station
  FJ_112: 'FJ_sdMacuata', //	Labasa Divisional Hospital
  FJ_231: 'FJ_sdMacuata', //	Labasa Golden Age Home
  FJ_113: 'FJ_sdMacuata', //	Labasa Health Centre
  FJ_115: 'FJ_sdMacuata', //	Lagi Health Centre
  FJ_150: 'FJ_sdBua', //	Lekutu Health Centre
  FJ_141: 'FJ_sdCakaudrove', //	Nabalebale Nursing Station
  FJ_210: 'FJ_sdBua', //	Nabouwalu Health Centre
  FJ_233: 'FJ_sdBua', //	Nabouwalu Sub-divisional Hospital
  FJ_116: 'FJ_sdMacuata', //	Naduri Health Centre
  FJ_136: 'FJ_sdCakaudrove', //	Nakorovatu Health Centre
  FJ_128: 'FJ_sdMacuata', //	Naqumu Nursing Station
  FJ_119: 'FJ_sdMacuata', //	Nasea Health Centre
  FJ_133: 'FJ_sdCakaudrove', //	Natewa Health Centre
  FJ_140: 'FJ_sdCakaudrove', //	Navakaka Nursing Station
  FJ_153: 'FJ_sdBua', //	Navakasiga Nursing Station
  FJ_137: 'FJ_sdCakaudrove', //	Naweni Nursing Station
  FJ_145: 'FJ_sdTaveuni', //	Qamea Health Centre
  FJ_134: 'FJ_sdCakaudrove', //	Rabi Health Centre
  FJ_132: 'FJ_sdCakaudrove', //	Saqani Health Centre
  FJ_130: 'FJ_sdCakaudrove', //	Savusavu Health Centre
  FJ_129: 'FJ_sdCakaudrove', //	Savusavu Sub-divisional Hospital
  FJ_118: 'FJ_sdMacuata', //	Seaqaqa Health Centre
  FJ_142: 'FJ_sdTaveuni', //	Taveuni Sub-divisional hospital
  FJ_127: 'FJ_sdCakaudrove', //	Tawake Nursing Station
  FJ_131: 'FJ_sdCakaudrove', //	Tukavesi Health Centre
  FJ_123: 'FJ_sdMacuata', //	Udu Nursing Station
  FJ_121: 'FJ_sdMacuata', //	Visoqo Nursing Station
  FJ_144: 'FJ_sdTaveuni', //	Vuna Health Centre
  FJ_146: 'FJ_sdTaveuni', //	Vuna Nursing Station
  FJ_122: 'FJ_sdMacuata', //	Vunivutu Nursing Station
  FJ_216: 'FJ_sdTaveuni', //	Waimaqera Health Centre
  FJ_114: 'FJ_sdMacuata', //	Wainikoro Health Centre
  FJ_217: 'FJ_sdBua', //	Wainunu Health Centre
  FJ_143: 'FJ_sdTaveuni', //	Waiyevo Health Centre
  FJ_232: 'FJ_sdTaveuni', //	Waiyevo Sub-divisional Hospital
  FJ_148: 'FJ_sdTaveuni', //	Yacata Nursing Station
  FJ_152: 'FJ_sdBua', //	Yadua Nursing Station
  FJ_075: 'FJ_sdBa', //	Ba Health Centre
  FJ_074: 'FJ_sdBa', //	Ba Mission Sub-divisional Hospital
  FJ_077: 'FJ_sdBa', //	Balevuto Health Centre
  FJ_068: 'FJ_sdNadi', //	Bukuya Health Centre
  FJ_092: 'FJ_sdNadroga', //	Cuvu Health Centre
  FJ_061: 'FJ_sdLautoka_Yasawa', //	Kamikamica Health Centre
  FJ_087: 'FJ_sdNadroga', //	Keiyasi Health Centre
  FJ_049: 'FJ_sdLautoka_Yasawa', //	Kese Health Centre
  FJ_088: 'FJ_sdNadroga', //	Korolevu Health Centre
  FJ_047: 'FJ_sdLautoka_Yasawa', //	Lautoka Divisional Hospital
  FJ_048: 'FJ_sdLautoka_Yasawa', //	Lautoka Health Centre
  FJ_213: 'FJ_sdLautoka_Yasawa', //	Lautoka Hope Centre
  FJ_054: 'FJ_sdLautoka_Yasawa', //	Lautoka Hub Centre
  FJ_238: 'FJ_sdNadroga', //	Loma Nursing Station
  FJ_089: 'FJ_sdNadroga', //	Lomawai Health Centre
  FJ_050: 'FJ_sdLautoka_Yasawa', //	Malolo Health Centre
  FJ_073: 'FJ_sdNadi', //	Momi Health Centre
  FJ_244: 'FJ_sdNadroga', //	Nabou Nursing Station
  FJ_051: 'FJ_sdLautoka_Yasawa', //	Nacula Health Centre
  FJ_082: 'FJ_sdTavua', //	Nadarivatu Health Centre
  FJ_065: 'FJ_sdNadi', //	Nadi Health Centre
  FJ_064: 'FJ_sdNadi', //	Nadi Sub-divisional Hospital
  FJ_084: 'FJ_sdTavua', //	Nadrau Nursing Station
  FJ_069: 'FJ_sdNadi', //	Nagado Nursing Station
  FJ_083: 'FJ_sdTavua', //	Nagatagata Nursing Station
  FJ_076: 'FJ_sdBa', //	Nailaga Health Centre
  FJ_079: 'FJ_sdBa', //	Nalotawa Nursing Station
  FJ_067: 'FJ_sdNadi', //	Namaka Health Centre
  FJ_219: 'FJ_sdNadi', //	Namaka Reproductive Health
  FJ_104: 'FJ_sdRa', //	Namarai Health Centre
  FJ_078: 'FJ_sdBa', //	Namau Nursing Station
  FJ_070: 'FJ_sdNadi', //	Nanoko Nursing Station
  FJ_103: 'FJ_sdRa', //	Nanukuloa Health Centre
  FJ_096: 'FJ_sdNadroga', //	Naqalimare Nursing Station
  FJ_105: 'FJ_sdRa', //	Nasau Health Centre
  FJ_110: 'FJ_sdRa', //	Nasavu Nursing Station
  FJ_052: 'FJ_sdLautoka_Yasawa', //	Natabua Health Centre
  FJ_071: 'FJ_sdNadi', //	Nausori Highland Nursing Station
  FJ_072: 'FJ_sdNadi', //	Nawaicoba Nursing Station
  FJ_109: 'FJ_sdRa', //	Nayavuira Nursing Station
  FJ_097: 'FJ_sdNadroga', //	Nukuilau Nursing Station
  FJ_062: 'FJ_sdLautoka_Yasawa', //	Punjas Health Centre
  FJ_236: 'FJ_sdRa', //	Ra Maternity Hospital
  FJ_090: 'FJ_sdNadroga', //	Raiwaqa Health Centre
  FJ_102: 'FJ_sdRa', //	Rakiraki Health Centre
  FJ_100: 'FJ_sdRa', //	Rakiraki Sub-divisional Hospital
  FJ_053: 'FJ_sdLautoka_Yasawa', //	Sai Veiseisei Health Centre
  FJ_215: 'FJ_sdNadi', //	Sarada Medical Centre
  FJ_086: 'FJ_sdNadroga', //	Sigatoka Health Centre
  FJ_085: 'FJ_sdNadroga', //	Sigatoka Sub-divisional Hospital
  FJ_060: 'FJ_sdLautoka_Yasawa', //	Somosomo Nursing Station
  FJ_099: 'FJ_sdNadroga', //	Tau Nursing Station
  FJ_081: 'FJ_sdTavua', //	Tavua Health Centre
  FJ_235: 'FJ_sdTavua', //	Tavua Maternity
  FJ_080: 'FJ_sdTavua', //	Tavua Sub-divisional Hospital
  FJ_055: 'FJ_sdLautoka_Yasawa', //	Teci Nursing Station
  FJ_107: 'FJ_sdRa', //	Tokaimalo Nursing Station
  FJ_098: 'FJ_sdNadroga', //	Tuvu Nursing Station
  FJ_093: 'FJ_sdNadroga', //	Vatukarasa Health Centre
  FJ_091: 'FJ_sdNadroga', //	Vatulele Health Centre
  FJ_058: 'FJ_sdLautoka_Yasawa', //	Viwa Nursing Station
  FJ_108: 'FJ_sdRa', //	Vunitogoloa Nursing Station
  FJ_095: 'FJ_sdNadroga', //	Wauosi Nursing Station
  FJ_056: 'FJ_sdLautoka_Yasawa', //	Yalobi Nursing Station
  FJ_057: 'FJ_sdLautoka_Yasawa', //	Yanuya Nursing Station
  FJ_059: 'FJ_sdLautoka_Yasawa', //	Yaqeta Nursing Stations
  FJ_063: 'FJ_sdLautoka_Yasawa', //	Yasawa-I-Rara Nursing Station
};

const hierarchyName = 'supplychain_fiji';

exports.up = async function (db) {
  const hierarchyId = (
    await db.runSql(`
      select id from entity_hierarchy where "name" = '${hierarchyName}';
    `)
  ).rows[0].id;

  await Promise.all(
    Object.keys(facilitiesToMigrate).map(async facilityCode =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: await codeToId(db, 'entity', facilitiesToMigrate[facilityCode]),
        child_id: await codeToId(db, 'entity', facilityCode),
        entity_hierarchy_id: hierarchyId,
      }),
    ),
  );
};

exports.down = function (db) {
  return db.runSql(`
    delete from entity_relation where "child_id" in (select id from entity where code in (${arrayToDbString(
      Object.keys(facilitiesToMigrate),
    )})';
  `);
};

exports._meta = {
  version: 1,
};
