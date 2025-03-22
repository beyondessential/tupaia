const getDataElementsInRange = (prefix, startIndex, endIndex) => {
  const dataElements = [];
  for (let index = startIndex; index <= endIndex; index++) {
    dataElements.push(`${prefix}${index}`);
  }

  return dataElements;
};

const MALES_25_PLUS = [
  'POP28AND30',
  'POP3234AND36',
  'POP20AND22',
  'POP14',
  'POP16AND18',
  'POP24AND26',
];
const FEMALES_25_PLUS = [
  'POP3335AND37',
  'POP21AND23',
  'POP15',
  'POP29AND31',
  'POP25AND27',
  'POP17AND19',
];

// prettier-ignore
export const DATA_BUILDER_CONFIGS = [
  {
    id: '20',
    new: { dataElementCodes: getDataElementsInRange('BCD', 61, 96) },
    old: { dataElementCodes: ['DE_GROUP-FMI'] },
  },
  {
    id: 'TO_RH_D07.1',
    new: {
      dataGroups: {
        'Home Visits': [...getDataElementsInRange('MCH', 25, 39), 'MCH25_1', 'MCH26_1'],
        'Clinic Visits': [...getDataElementsInRange('MCH', 42, 55), 'MCH42_1', 'MCH43_1'],
      },
    },
    old: {
      dataElementCodes: ['DE_GROUP-Monthly_Home_Visit_Counts', 'DE_GROUP-Monthly_Clinic_Visit_Counts'],
    },
  },
  {
    id: 'TO_RH_Descriptive_MCH05_01',
    new: {
      range: [0, 1],
      series: [
        {
          key: '4 Months',
          numerator: ['MCH60', 'MCH61'],
          denominator: ['MCH59', 'MCH58'],
        },
        {
          key: '6 Months',
          numerator: ['MCH69', 'MCH68'],
          denominator: ['MCH67', 'MCH66'],
        },
      ],
    },
    old: {
      range: [0, 1],
      series: [
        {
          key: '4 Months',
          numeratorDataElementGroupCode: 'Breastfeeding_Number_EBF_4_Months',
          denominatorDataElementGroupCode: 'Breastfeeding_Number_Interviewed_4_Months',
        },
        {
          key: '6 Months',
          numeratorDataElementGroupCode: 'Breastfeeding_Number_EBF_6_Months',
          denominatorDataElementGroupCode: 'Breastfeeding_Number_Interviewed_6_Months',
        },
      ],
    },
  },
  {
    id: 'TO_RH_Descriptive_FP01_02',
    new: {
      fillEmptyDenominatorValues: true,
      numerator: [
        'Family_Planning_Acceptors_Other',
        'Family_Planning_Acceptors_Condom_Female',
        'Family_Planning_Acceptors_Natural_Method',
        'Family_Planning_Acceptors_Depo_Provera',
        'Family_Planning_Acceptors_Jadelle',
        'Family_Planning_Acceptors_Pill_Single',
        'Family_Planning_Acceptors_Sterilization_Male',
        'Family_Planning_Acceptors_Sterilization_Female',
        'Family_Planning_Acceptors_Pill_Combined',
        'Family_Planning_Acceptors_Condom_Male',
        'Family_Planning_Acceptors_IUD',
      ],
      denominator: ['POP21AND23', 'POP15', 'POP17AND19', 'POP13', 'POP11'],
    },
    old: {
      fillEmptyDenominatorValues: true,
      numeratorDataElementGroupCode: 'FP_Change_Counts_8_Acceptors',
      denominatorDataElementGroupCode: 'Women_of_Child_Bearing_Age',
    },
  },
  {
    id: 'TO_CH_DM_HTN_Prevalence',
    new: {
      range: [0, 1],
      series: [
        {
          key: 'DM males',
          numerator: ['CH73', 'CH75', 'CH77', 'CH79', 'CH81', 'CH83', 'CH101', 'CH103', 'CH105', 'CH107', 'CH109', 'CH111'],
          denominator: MALES_25_PLUS,
        },
        {
          key: 'HTN males',
          numerator: ['CH87', 'CH89', 'CH91', 'CH93', 'CH95', 'CH97', 'CH101', 'CH103', 'CH105', 'CH107', 'CH109', 'CH111'],
          denominator: MALES_25_PLUS,
        },
        {
          key: 'DM females',
          numerator: ['CH74', 'CH76', 'CH78', 'CH80', 'CH82', 'CH84', 'CH102', 'CH104', 'CH106', 'CH108', 'CH110', 'CH112'],
          denominator: FEMALES_25_PLUS,
        },
        {
          key: 'HTN females',
          numerator: ['CH88', 'CH90', 'CH92', 'CH94', 'CH96', 'CH98', 'CH102', 'CH104', 'CH106', 'CH108', 'CH110', 'CH112'],
          denominator: FEMALES_25_PLUS,
        },
      ],
      fillEmptyDenominatorValues: true,
    },
    old: {
      range: [0, 1],
      series: [
        {
          key: 'DM males',
          numeratorDataElementGroupCode: 'DM_Males_25_plus',
          denominatorDataElementGroupCode: 'Males_25_plus',
        },
        {
          key: 'HTN males',
          numeratorDataElementGroupCode: 'HTN_Males_25_plus',
          denominatorDataElementGroupCode: 'Males_25_plus',
        },
        {
          key: 'DM females',
          numeratorDataElementGroupCode: 'DM_Females_25_plus',
          denominatorDataElementGroupCode: 'Females_25_plus',
        },
        {
          key: 'HTN females',
          numeratorDataElementGroupCode: 'HTN_Females_25_plus',
          denominatorDataElementGroupCode: 'Females_25_plus',
        },
      ],
      fillEmptyDenominatorValues: true,
    },
  },
  {
    id: 'TO_RH_Descriptive_FP01_03',
    new: {
      targetDataElementCodes: ['IMMS12'],
      achievedDataElementCodes: ['FP3', 'FP2', 'FP12', 'FP11', 'FP5', 'FP4', 'FP6', 'FP8', 'FP10', 'FP7', 'FP9'],
    },
    old: {
      targetDataElementCode: 'IMMS12',
      achievedDataElementGroupCode: 'FP_Change_Counts_1_New_Acceptors',
    },
  },
  {
    id: 'TO_RH_Descriptive_IMMS01_03',
    new: {
      targetDataElementCodes: ['IMMS7', 'IMMS9'],
      achievedDataElementCodes: ['IMMS4', 'IMMS2'],
    },
    old: {
      targetDataElementGroupCode: 'IMMS_School_Immunizations_Target',
      achievedDataElementGroupCode: 'IMMS_School_Immunizations_Achieved',
    },
  },
  {
    id: 'TO_CH_DM_HTN_Incidence',
    new: {
      range: [0, 1],
      series: [
        {
          key: 'DM males',
          numerator: ['CH69', 'CH67', 'CH65', 'CH37', 'CH63', 'CH61', 'CH35', 'CH41', 'CH59', 'CH31', 'CH33', 'CH39'],
          denominator: MALES_25_PLUS,
        },
        {
          key: 'HTN males',
          numerator: ['CH63', 'CH69', 'CH61', 'CH67', 'CH35', 'CH65', 'CH37', 'CH41', 'CH59', 'CH31', 'CH33', 'CH39'],
          denominator: MALES_25_PLUS,
        },
        {
          key: 'DM females',
          numerator: ['CH42', 'CH66', 'CH70', 'CH32', 'CH38', 'CH36', 'CH62', 'CH64', 'CH40', 'CH68', 'CH34', 'CH60'],
          denominator: FEMALES_25_PLUS,
        },
        {
          key: 'HTN females',
          numerator: ['CH46', 'CH66', 'CH70', 'CH56', 'CH54', 'CH48', 'CH62', 'CH52', 'CH50', 'CH64', 'CH68', 'CH60'],
          denominator: FEMALES_25_PLUS,
        },
      ],
      fillEmptyDenominatorValues: true,
    },
    old: {
      range: [0, 1],
      series: [
        {
          key: 'DM males',
          numeratorDataElementGroupCode: 'Newly_Diagnosed_DM_Males_25_plus',
          denominatorDataElementGroupCode: 'Males_25_plus',
        },
        {
          key: 'HTN males',
          numeratorDataElementGroupCode: 'Newly_Diagnosed_HTN_Males_25_plus',
          denominatorDataElementGroupCode: 'Males_25_plus',
        },
        {
          key: 'DM females',
          numeratorDataElementGroupCode: 'Newly_Diagnosed_DM_Females_25_plus',
          denominatorDataElementGroupCode: 'Females_25_plus',
        },
        {
          key: 'HTN females',
          numeratorDataElementGroupCode: 'Newly_Diagnosed_HTN_Females_25_plus',
          denominatorDataElementGroupCode: 'Females_25_plus',
        },
      ],
      fillEmptyDenominatorValues: true,
    },
  },
  {
    id: 'Imms_FridgeDailyTemperatures',
    new: {
      series: [
        { key: 'Max', dataElementCodes: ['FRIDGE_MAX_TEMP'] },
        { key: 'Min', dataElementCodes: ['FRIDGE_MIN_TEMP'] },
      ],
      programCode: 'FRIDGE_DAILY',
    },
    old: {
      series: [
        { key: 'Max', dataElementCode: 'FRIDGE_MAX_TEMP' },
        { key: 'Min', dataElementCode: 'FRIDGE_MIN_TEMP' },
      ],
      programCode: 'FRIDGE_DAILY',
    },
  },
  {
    id: '2',
    new: { dataElementCodes: ['TVSH'] },
    old: { outputIdScheme: 'code', dataElementCodes: ['TVSH'] },
  },
  {
    id: '3',
    new: { dataElementCodes: ['TVSH'] },
    old: { outputIdScheme: 'code', dataElementCodes: ['TVSH'] },
  },
  {
    id: '38',
    new: {
      dataElementGroupCode: 'PEHSS',
      valuesOfInterest: [1, 2, 3],
    },
    old: {
      outputIdScheme: 'code',
      dataElementCodes: ['DE_GROUP-PEHSS'],
      valuesOfInterest: [1, 2, 3],
    },
  },
  {
    id: '39',
    new: {
      dataElementGroupCode: 'PEHSS',
      valuesOfInterest: [1, 2, 3],
      // Note: `useValueIfNameMatches` is not used in this data builder
      // useValueIfNameMatches: '.*Please provide more details',
    },
    old: {
      dataElementCodes: ['DE_GROUP-PEHSS'],
      valuesOfInterest: [1, 2, 3],
      useValueIfNameMatches: '.*Please provide more details',
    },
  },
  {
    id: '39',
    drillDownLevel: 1,
    new: {
      measureCriteria: { EQ: '{serviceStatus}' },
      dataElementGroupCode: 'PEHSS',
      /* Note: The fields below were not actually used by the data builder */
      // valuesOfInterest: [1, 2, 3],
      // useValueIfNameMatches: '.*Please provide more details',
    },
    old: {
      measureCriteria: { EQ: '{serviceStatus}' },
      dataElementCodes: ['DE_GROUP-PEHSS'],
      valuesOfInterest: [1, 2, 3],
      useValueIfNameMatches: '.*Please provide more details',
    },
  },
  {
    id: '39',
    drillDownLevel: 2,
    new: {
      /* Note: The fields below were not actually used by the data builder */
      // sqlViewId: 'Jh5GNQyMCeG',
      // variables: {
      //   dataElementUID: '{dataElementUID}',
      //   lastUpdatedDuration: '600d',
      //   organisationUnitCode: '{organisationUnitCode}',
      // },
      // valuesOfInterest: [1, 2, 3],
      useValueIfNameMatches: '.*Please provide more details',
    },
    old: {
      sqlViewId: 'Jh5GNQyMCeG',
      variables: {
        dataElementUID: '{dataElementUID}',
        lastUpdatedDuration: '600d',
        organisationUnitCode: '{organisationUnitCode}',
      },
      valuesOfInterest: [1, 2, 3],
      useValueIfNameMatches: '.*Please provide more details',
    },
  },
  {
    id: '36',
    new: {
      range: [0, 1],
      dataElementGroupCode: 'PEHSS',
      valuesOfInterest: [1, 2, 3],
    },
    old: {
      range: [0, 1],
      dataElementCodes: ['DE_GROUP-PEHSS'],
      valuesOfInterest: [1, 2, 3],
    },
  },
  {
    id: 'SB_IHR_Bar',
    new: {
      range: [0, 1],
      dataElementGroupCode: 'IHR_Survey',
      valuesOfInterest: [0, 1, 2, 3, 4],
      organisationUnitLevel: 'District',
    },
    old: {
      range: [0, 1],
      dataElementCodes: ['DE_GROUP-IHR_Survey'],
      valuesOfInterest: [0, 1, 2, 3, 4],
      organisationUnitLevel: 'District',
    },
  },
  {
    id: 'TO_CH_DM_HTN_Newly_Diagnosed',
    new: {
      series: {
        Males: {
          'DM/HTN': ['CH59', 'CH61', 'CH63', 'CH65', 'CH67', 'CH69'],
          'DM only': ['CH31', 'CH33', 'CH35', 'CH37', 'CH39', 'CH41'],
          'HTN only': ['CH45', 'CH47', 'CH49', 'CH51', 'CH53', 'CH55'],
        },
        Females: {
          'DM/HTN': ['CH60', 'CH62', 'CH64', 'CH66', 'CH68', 'CH70'],
          'DM only': ['CH32', 'CH34', 'CH36', 'CH38', 'CH40', 'CH42'],
          'HTN only': ['CH46', 'CH48', 'CH50', 'CH52', 'CH54', 'CH56'],
        },
      },
    },
    old: {
      series: {
        Males: {
          dataClasses: {
            'DM/HTN': {
              dataSource: { type: 'group', codes: ['Newly_Diagnosed_DM_HTN_Males_25_plus'] },
            },
            'DM only': {
              dataSource: { type: 'group', codes: ['Newly_Diagnosed_DM_Only_Males_25_plus'] },
            },
            'HTN only': {
              dataSource: { type: 'group', codes: ['Newly_Diagnosed_HTN_Only_Males_25_plus'] },
            },
          },
        },
        Females: {
          dataClasses: {
            'DM/HTN': {
              dataSource: { type: 'group', codes: ['Newly_Diagnosed_DM_HTN_Females_25_plus'] },
            },
            'DM only': {
              dataSource: { type: 'group', codes: ['Newly_Diagnosed_DM_Only_Females_25_plus'] },
            },
            'HTN only': {
              dataSource: { type: 'group', codes: ['Newly_Diagnosed_HTN_Only_Females_25_plus'] },
            },
          },
        },
      },
    },
  },
  {
    id: 'TO_CH_NCD_Cases',
    new: {
      series: {
        Males: {
          Gout: ['CH199', 'CH201', 'CH203', 'CH205', 'CH207', 'CH209'],
          Asthma: ['CH115', 'CH117', 'CH119', 'CH121', 'CH123', 'CH125'],
          Cancer: ['CH129', 'CH131', 'CH133', 'CH135', 'CH137', 'CH139'],
          Diabetes: ['CH101', 'CH103', 'CH105', 'CH107', 'CH109', 'CH111', 'CH73', 'CH75', 'CH77', 'CH79', 'CH81', 'CH83'],
          Dyslipidemia: ['CH185', 'CH187', 'CH189', 'CH191', 'CH193', 'CH195'],
          Hypertension: ['CH101', 'CH103', 'CH105', 'CH107', 'CH109', 'CH111', 'CH87', 'CH89', 'CH91', 'CH93', 'CH95', 'CH97'],
          'Chronic Kidney Disease': ['CH157', 'CH159', 'CH161', 'CH163', 'CH165', 'CH167'],
          'Ischemic Heart Disease': ['CH213', 'CH215', 'CH217', 'CH219', 'CH221', 'CH223'],
          'Rheumatic Heart Disease': ['CH227', 'CH229', 'CH231', 'CH233', 'CH235', 'CH237'],
          'Cerebral Vascular Accident': ['CH143', 'CH145', 'CH147', 'CH149', 'CH151', 'CH153'],
          'Chronic Obstructive Airway Disease': ['CH171', 'CH173', 'CH175', 'CH177', 'CH179', 'CH181'],
        },
        Females: {
          Gout: ['CH200', 'CH202', 'CH204', 'CH206', 'CH208', 'CH210'],
          Asthma: ['CH116', 'CH118', 'CH120', 'CH122', 'CH124', 'CH126'],
          Cancer: ['CH130', 'CH132', 'CH134', 'CH136', 'CH138', 'CH140'],
          Diabetes: ['CH102', 'CH104', 'CH106', 'CH108', 'CH110', 'CH112', 'CH74', 'CH76', 'CH78', 'CH80', 'CH82', 'CH84'],
          Dyslipidemia: ['CH186', 'CH188', 'CH190', 'CH192', 'CH194', 'CH196'],
          Hypertension: ['CH102', 'CH104', 'CH106', 'CH108', 'CH110', 'CH112', 'CH88', 'CH90', 'CH92', 'CH94', 'CH96', 'CH98'],
          'Chronic Kidney Disease': ['CH158', 'CH160', 'CH162', 'CH164', 'CH166', 'CH168'],
          'Ischemic Heart Disease': ['CH214', 'CH216', 'CH218', 'CH220', 'CH222', 'CH224'],
          'Rheumatic Heart Disease': ['CH116', 'CH118', 'CH120', 'CH122', 'CH124', 'CH126'],
          'Cerebral Vascular Accident': ['CH144', 'CH146', 'CH148', 'CH150', 'CH152', 'CH154'],
          'Chronic Obstructive Airway Disease': ['CH172', 'CH174', 'CH176', 'CH178', 'CH180', 'CH182'],
        },
      },
    },
    old: {
      series: {
        Males: {
          dataClasses: {
            Gout: {
              dataSource: { type: 'group', codes: ['Gout_Males_25_plus'] },
            },
            Asthma: {
              dataSource: { type: 'group', codes: ['Asthma_Males_25_plus'] },
            },
            Cancer: {
              dataSource: { type: 'group', codes: ['Cancer_Males_25_plus'] },
            },
            Diabetes: {
              dataSource: { type: 'group', codes: ['DM_Males_25_plus'] },
            },
            Dyslipidemia: {
              dataSource: { type: 'group', codes: ['Dyslipidemia_Males_25_plus'] },
            },
            Hypertension: {
              dataSource: { type: 'group', codes: ['HTN_Males_25_plus'] },
            },
            'Chronic Kidney Disease': {
              dataSource: { type: 'group', codes: ['Chronic_Kidney_Disease_Males_25_plus'] },
            },
            'Ischemic Heart Disease': {
              dataSource: { type: 'group', codes: ['Ischemic_Heart_Disease_Males_25_plus'] },
            },
            'Rheumatic Heart Disease': {
              dataSource: { type: 'group', codes: ['RHD_Males_25_plus'] },
            },
            'Cerebral Vascular Accident': {
              dataSource: { type: 'group', codes: ['Cerebral_Vascular_Accident_Males_25_plus'] },
            },
            'Chronic Obstructive Airway Disease': {
              dataSource: {
                type: 'group',
                codes: ['Chronic_Obstructive_Airway_Disease_Males_25_plus'],
              },
            },
          },
        },
        Females: {
          dataClasses: {
            Gout: { dataSource: { type: 'group', codes: ['Gout_Females_25_plus'] } },
            Asthma: { dataSource: { type: 'group', codes: ['Asthma_Females_25_plus'] } },
            Cancer: { dataSource: { type: 'group', codes: ['Cancer_Females_25_plus'] } },
            Diabetes: { dataSource: { type: 'group', codes: ['DM_Females_25_plus'] } },
            Dyslipidemia: {
              dataSource: { type: 'group', codes: ['Dyslipidemia_Females_25_plus'] },
            },
            Hypertension: { dataSource: { type: 'group', codes: ['HTN_Females_25_plus'] } },
            'Chronic Kidney Disease': {
              dataSource: { type: 'group', codes: ['Chronic_Kidney_Disease_Females_25_plus'] },
            },
            'Ischemic Heart Disease': {
              dataSource: { type: 'group', codes: ['Ischemic_Heart_Disease_Females_25_plus'] },
            },
            'Rheumatic Heart Disease': {
              dataSource: { type: 'group', codes: ['RHD_Females_25_plus'] },
            },
            'Cerebral Vascular Accident': {
              dataSource: { type: 'group', codes: ['Cerebral_Vascular_Accident_Females_25_plus'] },
            },
            'Chronic Obstructive Airway Disease': {
              dataSource: {
                type: 'group',
                codes: ['Chronic_Obstructive_Airway_Disease_Females_25_plus'],
              },
            },
          },
        },
      },
    },
  },
  {
    id: 'WHO_SURVEY',
    new: { programCode: 'WSRS', dataElementCodes: ['WHOSPAR'] },
    old: { programCode: 'WSRS', dataElementCode: 'WHOSPAR' },
  }
];
