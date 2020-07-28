export const FIJI_ENTITIES_NEW_VILLAGES = [
  // Kenani (settlement)
  // Dawasamu	Tailevu	Kenani (settlement)	-17.627799°	178.509803°
  {
    code: 'FJ_KNI',
    parent_code: 'FJ',
    name: 'Kenani',
    type: 'village',
    point: { type: 'Point', coordinates: [178.509803, -17.627799] },
  },
  // Naqiri (settlement)
  // Dawasamu	Tailevu	Naqiri (settlement)		-17.626312°	178.508625°
  {
    code: 'FJ_NQI',
    parent_code: 'FJ',
    name: 'Naqiri',
    type: 'village',
    point: { type: 'Point', coordinates: [178.508625, -17.626312] },
  },
  // Nakoroni  (settlement)
  // Dawasamu	Tailevu	Nakoroni  (settlement)	-17.635074°	178.474101°
  {
    code: 'FJ_NKI',
    parent_code: 'FJ',
    name: 'Nakoroni',
    type: 'village',
    point: { type: 'Point', coordinates: [178.474101, -17.635074] },
  },
  // Wainisarava (settlement)
  // Namosi	Namosi	Wainisarava (settlement)	-18.016140°	178.083163°
  {
    code: 'FJ_WSV',
    parent_code: 'FJ',
    name: 'Wainisarava',
    type: 'village',
    point: { type: 'Point', coordinates: [178.083163, -18.01614] },
  },
  // Driti (village) (Bua)
  // Dama	Bua	Driti (village)		-16.885522°	178.721410°
  {
    code: 'FJ_DIB',
    parent_code: 'FJ',
    name: 'Driti (Bua)',
    type: 'village',
    point: { type: 'Point', coordinates: [178.72141, -16.885522] },
  },
];

// Catchment Codes:
// Dawasamu Catchment 'FJ_CATCH_Dawasamu',
// Waibula Catchment 'FJ_CATCH_Waibula',
// Namosi Catchment 'FJ_CATCH_Namosi',
// Dama Catchment 'FJ_CATCH_Dama',
// Bureta (Ovalau Island) Catchment 'FJ_CATCH_Bureta',

export const FIJI_ENTITIES_VILLAGES_HEIRARCHIES = [
  // Dawasamu	Tailevu	Driti (village) FJ_DRI
  {
    code: 'FJ_DRI',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Veilolo (settlement) FJ_DII
  {
    code: 'FJ_DII',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Nabualau (village) FJ_NB
  {
    code: 'FJ_NB',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Kenani (settlement) FJ_KNI
  {
    code: 'FJ_KNI',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Naqiri (settlement) FJ_NQI
  {
    code: 'FJ_NQI',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Delakado (village) FJ_DLK
  {
    code: 'FJ_DLK',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Nakoroni  (settlement) FJ_NKI
  {
    code: 'FJ_NKI',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Natadradave (village) FJ_NTD
  {
    code: 'FJ_NTD',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Dawasamu	Tailevu	Vorovoro (village) FJ_VRV
  {
    code: 'FJ_VRV',
    parent_code: 'FJ_CATCH_Dawasamu',
  },
  // Waibula	Tailevu	Matacaucau (village) FJ_MAT
  {
    code: 'FJ_MAT',
    parent_code: 'FJ_CATCH_Waibula',
  },
  // Waibula	Tailevu	Matacula (village) FJ_MTL
  {
    code: 'FJ_MTL',
    parent_code: 'FJ_CATCH_Waibula',
  },
  // Waibula	Tailevu	Nakorovou (village) FJ_NKR
  {
    code: 'FJ_NKR',
    parent_code: 'FJ_CATCH_Waibula',
  },
  // Waibula	Tailevu	Navunisole (village) FJ_NVS
  {
    code: 'FJ_NVS',
    parent_code: 'FJ_CATCH_Waibula',
  },
  // Waibula	Tailevu	Deepwater (settlement) FJ_DEP
  {
    code: 'FJ_DEP',
    parent_code: 'FJ_CATCH_Waibula',
  },
  // Waibula	Tailevu	Nabilo (settlement) FJ_NBO
  {
    code: 'FJ_NBO',
    parent_code: 'FJ_CATCH_Waibula',
  },
  // Namosi	Namosi	Naraiyawa (village) FJ_NRI
  {
    code: 'FJ_NRI',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Namosi	Namosi	Wainimakutu (village) FJ_WII
  {
    code: 'FJ_WII',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Namosi	Namosi	Naqarawai (village) FJ_NQR
  {
    code: 'FJ_NQR',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Namosi	Namosi	Saliadrau (village) FJ_SLA
  {
    code: 'FJ_SLA',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Namosi	Namosi	Wainitava (settlement) FJ_WIA
  {
    code: 'FJ_WIA',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Namosi	Namosi	Wainisarava (settlement) FJ_WSV
  {
    code: 'FJ_WSV',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Namosi	Namosi	Navunikabi (village) FJ_NVK
  {
    code: 'FJ_NVK',
    parent_code: 'FJ_CATCH_Namosi',
  },
  // Dama	Bua	Dama (village) FJ_DAM
  {
    code: 'FJ_DAM',
    parent_code: 'FJ_CATCH_Dama',
  },
  // Dama	Bua	Nasau (village) FJ_NSU
  {
    code: 'FJ_NSU',
    parent_code: 'FJ_CATCH_Dama',
  },
  // Dama	Bua	Tavulomo (village) FJ_TVU
  {
    code: 'FJ_TVU',
    parent_code: 'FJ_CATCH_Dama',
  },
  // Dama	Bua	Naruwai (village) FJ_NRW
  {
    code: 'FJ_NRW',
    parent_code: 'FJ_CATCH_Dama',
  },
  // Dama	Bua	Nagadoa (village) FJ_NGD
  {
    code: 'FJ_NGD',
    parent_code: 'FJ_CATCH_Dama',
  },
  // Dama	Bua	Driti (village) FJ_DIB
  {
    code: 'FJ_DIB',
    parent_code: 'FJ_CATCH_Dama',
  },
  // Bureta (Ovalau Island)	Lomaiviti	Naviteitei (village) FJ_NVT
  {
    code: 'FJ_NVT',
    parent_code: 'FJ_CATCH_Bureta',
  },
  // Bureta (Ovalau Island)	Lomaiviti	Nasaga (village) FJ_NSA
  {
    code: 'FJ_NSA',
    parent_code: 'FJ_CATCH_Bureta',
  },
  // Bureta (Ovalau Island)	Lomaiviti	Tai (village) FJ_TAI
  {
    code: 'FJ_TAI',
    parent_code: 'FJ_CATCH_Bureta',
  },
  // Bureta (Ovalau Island)	Lomaiviti	Nauvloa (village) FJ_NVL
  {
    code: 'FJ_NVL',
    parent_code: 'FJ_CATCH_Bureta',
  },
  // Bureta (Ovalau Island)	Lomaiviti	Nasaumatua (Village) FJ_NSM
  {
    code: 'FJ_NSM',
    parent_code: 'FJ_CATCH_Bureta',
  }, // Bureta (Ovalau Island)	Lomaiviti	Lovoni (village) FJ_LVO
  {
    code: 'FJ_LVO',
    parent_code: 'FJ_CATCH_Bureta',
  },
  // Bureta (Ovalau Island)	Lomaiviti	Vuniivisavu (village) FJ_VNI
  {
    code: 'FJ_VNI',
    parent_code: 'FJ_CATCH_Bureta',
  },
];
