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

exports.up = async function(db) {
  // mapping with clinics in Kiribati between MS1 and Tuapaia
  const MS1_API_CLINICS = {
    KI_KHPHAR: { name: 'Kiritimati Hospital', distributionId: null },
    KI_GEN: { name: 'Tungaru Central Hospital', distributionId: null },
    KI_SKH: { name: 'SKH Hospital', distributionId: '1409' },
    KI_BETIO: { name: 'Betio Hospital', distributionId: '0705' },
    KI_NRHC10: { name: 'Nonouti Tebobonga H/C', distributionId: '1301' },
    KI_BRHC14: { name: 'Beru Temaraa HC', distributionId: '1701' },
    KI_TMRHC16: { name: 'Tamana Motoia HC', distributionId: '1902' },
    KI_NTRHC05: { name: 'Abaokoro H/C', distributionId: '0501' },
    KI_TBRHC20: { name: 'Tabuaeran Paelau H/C', distributionId: '2201' },
    KI_ARHC17: { name: 'Arorae HC', distributionId: null },
    KI_BRHC22: { name: 'Banaba H/C', distributionId: '0801' },
    KI_PRHC21: { name: 'Teraina Arabwata H/C', distributionId: '2301' },
    KI_ORHC18: { name: 'Canton H/C', distributionId: '2401' },
    KI_RCH02: { name: 'Butaritari H/C', distributionId: '0201' },
    KI_MKRHC03: { name: 'Rawannawi H/C', distributionId: '0301' },
    KI_RHC01: { name: 'Mwakin H/C', distributionId: null },
    KI_MRHC06: { name: 'Maiana HC', distributionId: null },
    KI_KRHC07: { name: 'Kuria H/C', distributionId: '1001' },
    KI_AKHC08: { name: 'Aranuka Buariki H/C', distributionId: '1101' },
    KI_AMRHC09: { name: 'Abemama Kariatebike H/C', distributionId: '1201' },
    KI_ORHC13: { name: 'Onotoa Buraitan H/C', distributionId: '1601' },
    KI_NKRHC15: { name: 'Nikunau Manrunga HC', distributionId: '1801' },
    KI_ABRHC04: { name: 'Abaiang Taburao H/C', distributionId: '0401' },
    KI_TSRHC12: { name: 'Tab South Buariki H/C', distributionId: '1501' },
    KI_AMRD38: { name: 'Kabangaki', distributionId: '1204' },
    KI_AMRD39: { name: 'Tekatirirake', distributionId: '1205' },
    KI_NRD42: { name: 'Temotu', distributionId: '1303' },
    KI_NRD48: { name: 'Abamakoro', distributionId: '1304' },
    KI_NRD50: { name: 'Tabiang (Nonouti)', distributionId: '1203' },
    KI_TNRHC11: { name: 'Utiroa H/C', distributionId: '1401' },
    KI_TSRD57: { name: 'Takuu', distributionId: '1503' },
    KI_ORD59: { name: 'Tekatana', distributionId: '1604' },
    KI_ORD60: { name: 'Tabuarorae', distributionId: '1603' },
    KI_BRD63: { name: 'Namon', distributionId: '1702' },
    KI_NKRD65: { name: 'Nikumatang', distributionId: '0202' },
    KI_NKRD66: { name: 'Muritoa', distributionId: '1803' },
    KI_NTRD27: { name: 'Buariki', distributionId: '0505' },
    KI_NTRD24: { name: 'Tearinibai', distributionId: '0502' },
    KI_CRHC70: { name: 'Banana clinic', distributionId: '2102' },
    KI_TEMUC02: { name: 'Temaiku clinic', distributionId: '0608' },
    KI_NTRD28: { name: 'Nabeina', distributionId: '0506' },
    KI_CRD69: { name: 'Tabwakea clinic', distributionId: '2104' },
    KI_CRD71: { name: 'Poland clinic', distributionId: '2103' },
    KI_BIKUC03: { name: 'Bikenibeu East clinic', distributionId: '0602' },
    KI_UC09: { name: 'Banraeaba clinic', distributionId: '0604' },
    KI_UC10: { name: 'Teaoraereke clinic', distributionId: '0605' },
    KI_BEUC08: { name: 'Temakin clinic', distributionId: '0101' },
    KI_NTRD23: { name: 'Taratai', distributionId: '0504' },
    KI_ABRD20: { name: 'Ubwarano', distributionId: '0407' },
    KI_ABRD22: { name: 'Riboono', distributionId: '0403' },
    KI_MRD32: { name: 'Tanimaeao', distributionId: '0908' },
    KI_MRD29: { name: 'Bubutei', distributionId: '0903' },
    KI_AKRD34: { name: 'Baurua', distributionId: '1102' },
    KI_AKRD35: { name: 'Takaeang', distributionId: '1103' },
    KI_BEUC07: { name: 'Temanoku clinic', distributionId: '0701' },
    KI_NRD49: { name: 'Temanoku', distributionId: null },
    KI_NTRD30: { name: 'Notoue', distributionId: '0508' },
    KI_BRD64: { name: 'Aonnati', distributionId: '1703' },
    KI_MRD31: { name: 'Tekaraanga', distributionId: '0905' },
    KI_NTRD29: { name: 'Tabonibara Disp', distributionId: '0507' },
    KI_RD02: { name: 'Kiebu', distributionId: '0102' },
    KI_RD01: { name: 'Anrawa', distributionId: '0103' },
    KI_AMRD42: { name: 'Tebwanga Dispensary', distributionId: '1207' },
    KI_BTRD05: { name: 'Ukiangang', distributionId: '0204' },
    KI_BTRD009: { name: 'Tekananuea', distributionId: '0206' },
    KI_ABRD21: { name: 'Tanimaiaki', distributionId: '1602' },
    KI_ABRD17: { name: 'Koinawa', distributionId: '0404' },
    KI_ABRD14: { name: 'Toonga', distributionId: null },
    KI_ABRD19: { name: 'Nuotaea', distributionId: '0402' },
    KI_MRD30: { name: 'Tebikerai', distributionId: '0902' },
    KI_KRD33: { name: 'Oneeke', distributionId: '1002' },
    KI_AMRD37: { name: 'Abatiku', distributionId: '1202' },
    KI_NRD47: { name: 'Mataboou', distributionId: '1307' },
    KI_MRD10: { name: 'Raweai', distributionId: '0306' },
    KI_TNRD49: { name: 'Tanaeang', distributionId: '1402' },
    KI_TNRD50: { name: 'Tekabuibui', distributionId: '1408' },
    KI_TNRD52: { name: 'Tauma', distributionId: '1406' },
    KI_TNRD54: { name: 'Tenatorua', distributionId: '1405' },
    KI_NTRD26: { name: 'Tabiteuea', distributionId: '0503' },
    KI_TBRHC74: { name: 'Napali', distributionId: '2202' },
    KI_TBRD73: { name: 'Aramari', distributionId: '2203' },
    KI_AMBO: { name: 'Ambo clinic', distributionId: '0620' },
    KI_MKRD11: { name: 'Tekarakan', distributionId: '0302' },
    KI_TABA: { name: 'Tuarabu', distributionId: '0410' },
    KI_TNRD53: { name: 'Kabuna', distributionId: '1403' },
    KI_TSRD56: { name: 'Tewai', distributionId: '1502' },
    KI_ORD58: { name: 'Otowae', distributionId: '1605' },
    KI_TNRD28: { name: 'Buota clinic', distributionId: '1407' },
    KI_BEUC06: { name: 'Takoronga clinic', distributionId: '0702' },
    KI_BTRD06: { name: 'Tanimaiaki', distributionId: '1602' },
    KI_RD03: { name: 'Bikaati', distributionId: '0205' },
    KI_AMRD40: { name: 'Tabiang (Abemama)', distributionId: '1203' },
    KI_BONUC01: { name: 'Bonriki clinic', distributionId: '0609' },
    KI_BTRD08: { name: 'Nakiroro', distributionId: '0203' },
    KI_MKRD12: { name: 'Terawarawa', distributionId: '0304' },
    KI_NRD43: { name: 'Taboiaki', distributionId: '1306' },
    KI_BIKUC04: { name: 'Bikenibeu West clinic', distributionId: '0603' },
    KI_EITA: { name: 'Eita clinic', distributionId: '0607' },
    KI_BTRD04: { name: 'Kuma', distributionId: '0202' },
    KI_MKRD13: { name: 'Bainuea', distributionId: '0303' },
    KI_NRD46: { name: 'Teuabu ', distributionId: '1302' },
    KI_NANIKAI: { name: 'Nanikai clinic', distributionId: '0614' },
    KI_BTRD07: { name: 'Keuea', distributionId: '0207' },
    KI_NRD44: { name: 'Rotimwa', distributionId: '1305' },
    KI_TNRD55: { name: 'Buota', distributionId: '0610' },
    KI_TNRD51: { name: 'Aiwa', distributionId: '1404' },
    KI_BAUCO5: { name: 'Bairiki clinic', distributionId: '0606' },
    KI_ABRD18: { name: 'Taniau', distributionId: '0409' },
    KI_AMRD41A: { name: 'Baretoa', distributionId: '1206' },
    KI_ORD61: { name: 'Aiaki', distributionId: '1602' },
    KI_CRD68: { name: 'London Dispensary', distributionId: '2105' },
  };
  await db.runSql(`
    ALTER TABLE entity ADD COLUMN metadata JSON;
  `);
  await Promise.all(
    Object.keys(MS1_API_CLINICS).map(key => {
      const value = MS1_API_CLINICS[key];
      if (!value.distributionId) return true;
      return db.runSql(`
        UPDATE entity SET metadata = '{"ms1DistributionId": "${value.distributionId}"}'
          WHERE code = '${key}';
      `);
    }),
  );
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
