import { getDhisApiInstance } from '/dhis';
import { getDataElementsInGroupSet } from '/apiV1/utils/getDataElementsInGroupSet';
import { preaggregateDataElement } from '/preaggregation/preaggregateDataElement';
import { preaggregateTransactionalDataElement } from '/preaggregation/preaggregateTransactionalDataElement';

const OPERATORS_FOR_CHANGE_TYPES = {
  FP_Change_Counts_1_New_Acceptors: '+', // New acceptors
  FP_Change_Counts_2_Change_In_Method_To: '+', // Change to
  FP_Change_Counts_3_Change_In_Method_From: '-', // Change from
  FP_Change_Counts_4_Transfers_In: '+', // Transfers in
  FP_Change_Counts_5_Transfers_Out: '-', // Transfers out
  FP_Change_Counts_6_Discontinuation: '-', // Discontinued
};

const BASELINE_DATA_ELEMENTS = {
  FP_Method_Counts_A_IUD: 'FP172',
  FP_Method_Counts_B_Pill_Combined: 'FP173',
  FP_Method_Counts_C_Pill_Single: 'FP174',
  FP_Method_Counts_D_Condom_Male: 'FP175',
  FP_Method_Counts_E_Condom_Female: 'FP176',
  FP_Method_Counts_F_Natural_Method: 'FP177',
  FP_Method_Counts_G_Sterilization_Male: 'FP178',
  FP_Method_Counts_H_Sterilization_Female: 'FP179',
  FP_Method_Counts_I_Depo_Provera: 'FP180',
  FP_Method_Counts_J_Jadelle: 'FP181',
  FP_Method_Counts_K_Other: 'FP182',
};

const ANALYTICS_QUERY = {
  organisationUnitCode: 'TO',
  dataServices: [{ isDataRegional: false }],
  period: 'LAST_5_YEARS;THIS_YEAR',
};

export const tongaFamilyPlanning = async aggregator => {
  const tongaDhisApi = getDhisApiInstance({ entityCode: 'TO', isDataRegional: false });
  const { dataElementToGroupMapping: dataElementToChangeType } = await getDataElementsInGroupSet(
    tongaDhisApi,
    'FP_Change_Counts',
    'code',
  );
  const { dataElementToGroupMapping: dataElementToMethod } = await getDataElementsInGroupSet(
    tongaDhisApi,
    'FP_Method_Counts',
    'code',
  );
  const formulae = {};
  const methodToNetChangeDataElement = {};
  const methodToAcceptorsDataElement = {};
  Object.entries(dataElementToMethod).forEach(([dataElementCode, methodCode]) => {
    const changeTypeCode = dataElementToChangeType[dataElementCode];
    const operator = OPERATORS_FOR_CHANGE_TYPES[changeTypeCode];
    if (operator) {
      if (!formulae[methodCode]) {
        formulae[methodCode] = {};
      }
      formulae[methodCode][dataElementCode] = operator;
    } else if (dataElementCode.includes('Net_Change')) {
      // No operator, this is the Net Change data element
      methodToNetChangeDataElement[methodCode] = dataElementCode;
    } else if (dataElementCode.includes('Acceptors')) {
      // No operator, this is the Total Acceptors data element
      methodToAcceptorsDataElement[methodCode] = dataElementCode;
    }
  });

  // Aggregate the net change for each family planning method sequentially to avoid a spike in load
  const methodCodes = Object.keys(formulae);
  await tongaDhisApi.updateAnalyticsTables();
  for (let i = 0; i < methodCodes.length; i++) {
    const methodCode = methodCodes[i];
    await preaggregateDataElement(
      aggregator,
      methodToNetChangeDataElement[methodCode],
      formulae[methodCode],
      ANALYTICS_QUERY,
    );
  }
  await tongaDhisApi.updateAnalyticsTables();

  // Aggregate the total acceptors for each family planning method sequentially to avoid a spike in load
  for (let i = 0; i < methodCodes.length; i++) {
    const methodCode = methodCodes[i];
    await preaggregateTransactionalDataElement(
      aggregator,
      methodToAcceptorsDataElement[methodCode],
      BASELINE_DATA_ELEMENTS[methodCode],
      methodToNetChangeDataElement[methodCode],
      ANALYTICS_QUERY,
    );
  }
  await tongaDhisApi.updateAnalyticsTables();
};
