'use strict';

import { updateValues } from '../migrationUtilities';

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

const NEW_CONFIGS = {
  TO_RH_Descriptive_IMMS_Coverage: {
    range: [0, 1],
    dataClasses: {
      'Hep B Birth Dose': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS43'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS42'] } },
      },
      'DPT/HepB/HIB Dose 3': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS49'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS48'] } },
      },
      'MR Dose 2': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS63'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS62'] } },
      },
      'Td for School Entry Students >7 years old': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS79_2'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS79_1'] } },
      },
      'OPV Dose 1': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS53'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS52'] } },
      },
      'OPV Dose 3': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS57'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS56'] } },
      },
      'DPT/HepB/HIB Dose 1': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS45'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS44'] } },
      },
      'IPV Dose 1': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS51'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS50'] } },
      },
      'DPT5 for School Entry Students 5-6 years old': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS79'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS78'] } },
      },
      'DPT/HepB/HIB Dose 2': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS47'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS46'] } },
      },
      'MR Dose 1': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS61'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS60'] } },
      },
      'BCG Infant': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS41'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS40'] } },
      },
      'Td for High School Leavers': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS81'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS80'] } },
      },
      'OPV Dose 2': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS55'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS54'] } },
      },
      'DPT Dose 4': {
        numerator: { dataSource: { type: 'single', codes: ['IMMS59'] } },
        denominator: { dataSource: { type: 'single', codes: ['IMMS58'] } },
      },
    },
  },
  TO_CH_DM_HTN_Complications_Screening: {
    range: [0, 1],
    dataClasses: {
      eGFR: {
        numerator: { dataSource: { type: 'group', codes: ['eGFR_Screenings'] } },
        denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
      },
      'Eye Check': {
        numerator: { dataSource: { type: 'group', codes: ['Eye_Check_Screenings'] } },
        denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
      },
      'Foot Check': {
        numerator: { dataSource: { type: 'group', codes: ['Foot_Check_Screenings'] } },
        denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
      },
      'Fasting Cholesterol': {
        numerator: { dataSource: { type: 'group', codes: ['Fasting_Cholesterol_Screenings'] } },
        denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
      },
      HBa1c: {
        numerator: { dataSource: { type: 'group', codes: ['HBa1c_Screenings'] } },
        denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
      },
    },
  },
  TO_CH_DM_HTN_Newly_Diagnosed: {
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
  TO_CH_NCD_Cases: {
    series: {
      Males: {
        dataClasses: {
          Gout: { dataSource: { type: 'group', codes: ['Gout_Males_25_plus'] } },
          Asthma: { dataSource: { type: 'group', codes: ['Asthma_Males_25_plus'] } },
          Cancer: { dataSource: { type: 'group', codes: ['Cancer_Males_25_plus'] } },
          Diabetes: { dataSource: { type: 'group', codes: ['DM_Males_25_plus'] } },
          Dyslipidemia: { dataSource: { type: 'group', codes: ['Dyslipidemia_Males_25_plus'] } },
          Hypertension: { dataSource: { type: 'group', codes: ['HTN_Males_25_plus'] } },
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
          Dyslipidemia: { dataSource: { type: 'group', codes: ['Dyslipidemia_Females_25_plus'] } },
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
};

exports.up = function(db) {
  return Promise.all(
    Object.entries(NEW_CONFIGS).map(([id, config]) =>
      db.runSql(
        `UPDATE
          "dashboardReport"
        SET
          "dataBuilderConfig" = '${JSON.stringify(config)}'
        WHERE
          id = '${id}'`,
      ),
    ),
  );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
