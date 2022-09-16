/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { format, differenceInYears, addDays, isDate } from 'date-fns';
import { createAggregator } from '@tupaia/aggregator';
import { ReportServerAggregator } from '../../aggregator';
import { FetchReportQuery, Event } from '../../types';
import { ReqContext } from '../context';
import SURVEYS from './data/tongaCovidRawData.json';

interface RelationshipsOptions {
  hierarchy: string;
  individualsByCode: string[];
  groupBy: 'ancestor' | 'descendant';
  queryOptions?: any;
  ancestorOptions?: any;
  descendantOptions?: any;
}

interface Options {
  programCode: string;
  dataElementCodes: string[];
}

interface AncestorData {
  villageByIndividual: Record<string, Record<string, string>>;
  islandByIndividual: Record<string, string>;
}

const getRelationships = (reqContext: ReqContext, options: RelationshipsOptions) => {
  const {
    hierarchy,
    individualsByCode,
    groupBy,
    queryOptions,
    ancestorOptions,
    descendantOptions,
  } = options;
  return reqContext.services.entity.getRelationshipsOfEntities(
    hierarchy,
    individualsByCode,
    groupBy,
    queryOptions,
    ancestorOptions,
    descendantOptions,
  );
};

const useAncestorData = async (
  reqContext: ReqContext,
  hierarchy: string,
  individualsByCode: string[],
) => {
  const villageOptions: RelationshipsOptions = {
    hierarchy,
    individualsByCode,
    groupBy: 'descendant',
    queryOptions: {},
    ancestorOptions: { filter: { type: 'village' } },
    descendantOptions: { filter: { type: 'individual' } },
  };

  const islandOptions: RelationshipsOptions = {
    hierarchy,
    individualsByCode,
    groupBy: 'descendant',
    queryOptions: { field: 'name' },
    ancestorOptions: { filter: { type: 'district' } },
    descendantOptions: { filter: { type: 'individual' } },
  };
  const villageCodeByIndividualCodes: Record<string, string> = await getRelationships(
    reqContext,
    villageOptions,
  );
  const villageCodes = new Set<string>();
  Object.values(villageCodeByIndividualCodes).forEach((code: string) => {
    villageCodes.add(code);
  });
  const includedVillageCodes = [...villageCodes];
  const villageCodesAndNames = await reqContext.services.entity.getEntities(
    hierarchy,
    includedVillageCodes,
    {
      fields: ['code', 'name'],
    },
  );
  const individualCodeByVillageNameAndCode: Record<string, Record<string, string>> = {};
  Object.keys(villageCodeByIndividualCodes).forEach(individualCode => {
    const villageCode = villageCodeByIndividualCodes[individualCode];
    const { name } = villageCodesAndNames.find(
      (village: Record<string, string>) => village.code === villageCode,
    );
    individualCodeByVillageNameAndCode[individualCode] = {
      code: villageCode,
      name,
    };
  });

  const islandNameByIndividualCodes = await getRelationships(reqContext, islandOptions);

  return {
    villageByIndividual: individualCodeByVillageNameAndCode,
    islandByIndividual: islandNameByIndividualCodes,
  };
};

const fetchEvents = async (
  reqContext: ReqContext,
  individualsByCode: string[],
  hierarchy: string,
  startDate?: string,
  endDate?: string,
  period?: string,
) => {
  const registrationOptions = {
    programCode: 'C19T_Registration',
    dataElementCodes: SURVEYS.C19T_Registration.dataElementCodes,
  };
  const resultsOptions = {
    programCode: 'C19T_Results',
    dataElementCodes: SURVEYS.C19T_Results.dataElementCodes,
  };

  const aggregator = new ReportServerAggregator(createAggregator(undefined, reqContext));
  const fetch = async (options: Options) => {
    const { programCode, dataElementCodes } = options;
    return aggregator.fetchEvents(
      programCode,
      undefined,
      individualsByCode,
      hierarchy,
      { startDate, endDate, period },
      dataElementCodes,
    );
  };

  const [registrationEvents, resultsEvents] = await Promise.all(
    [registrationOptions, resultsOptions].map(fetch),
  );

  return { registrationEvents, resultsEvents };
};

const combineAndFlatten = (
  registrationEvents: Event[],
  resultEvents: Event[],
  ancestorData: AncestorData,
) => {
  const matchedData: Record<string, any>[] = resultEvents.map(resultEvent => {
    const { dataValues: resultDataValues, orgUnit: resultOrgUnit, eventDate } = resultEvent;
    const matchingRegistration = registrationEvents.find(
      registrationEvent => registrationEvent.orgUnit === resultEvent.orgUnit,
    );
    if (!matchingRegistration) {
      return {
        orgUnit: resultOrgUnit,
        eventDate,
        ...resultDataValues,
      };
    }
    const { dataValues: registrationDataValues, orgUnit } = matchingRegistration;

    return {
      orgUnit,
      eventDate,
      ...registrationDataValues,
      ...resultDataValues,
    };
  });
  const { villageByIndividual, islandByIndividual } = ancestorData;
  const now = new Date();
  const dataWithUpdatesAndAddOns = matchedData.map(event => {
    const {
      orgUnit,
      C19T033: result,
      C19T042: onsetDate,
      C19T004: dob,
      eventDate: dateSpecimenCollected,
    } = event;
    const { code: villageCode, name: villageName } = villageByIndividual[
      orgUnit as keyof typeof Event
    ];
    const islandName: string = islandByIndividual[orgUnit];

    const age = getAge(dob, now);
    return {
      'Test ID': orgUnit,
      'Island Group': islandName,
      'Village Code': villageCode,
      Address: villageName,
      'Estimated Recovery Date': getEstimatedRecoveryDate(result, dateSpecimenCollected, onsetDate),
      dateSpecimenCollected,
      Age: age,
      ...event,
    };
  });

  return dataWithUpdatesAndAddOns;
};

const getAge = (dob: string | undefined, now: Date) => {
  if (!dob) {
    return 'unknown';
  }
  const dobDate = new Date(dob);
  const age = isDate(dobDate) && differenceInYears(now, dobDate);
  return age;
};

const getEstimatedRecoveryDate = (
  result: string,
  collectionDate: string,
  onsetDate: string | undefined,
) => {
  if (result !== 'Positive') {
    return 'Not applicable';
  }

  if (onsetDate) {
    const recoveryDate = addDays(new Date(onsetDate), 13);

    return isDate(recoveryDate) && format(recoveryDate, 'yyy-mm-dd');
  }

  const recoveryDate = addDays(new Date(collectionDate), 13);
  return isDate(recoveryDate) && format(recoveryDate, 'yyyy-mm-dd');
};

const parseRowData = (rowData: Record<string, any>) => {
  const formattedRow: Record<string, any> = {};
  const { codesToNames } = SURVEYS;
  Object.keys(rowData).forEach(fieldKey => {
    switch (fieldKey) {
      case 'dateSpecimenCollected': {
        formattedRow['Date of Test'] = rowData[fieldKey];
        break;
      }
      case 'C19T004': {
        if (!rowData[fieldKey]) {
          formattedRow['Date of Birth'] = 'Unknown';
        }
        const rawDate = new Date(rowData[fieldKey]);
        const dobValue = isDate(rawDate) && format(rawDate, 'yyyy-mm-dd');
        formattedRow['Date of Birth'] = dobValue;
        break;
      }
      case 'Test ID':
      case 'Island Group':
      case 'Village Code':
      case 'Address':
      case 'Age':
      case 'Estimated Recovery Date':
        formattedRow[fieldKey] = rowData[fieldKey];
        break;
      default: {
        const name = codesToNames[fieldKey as keyof typeof codesToNames];
        if (!name) {
          formattedRow[fieldKey] = rowData[fieldKey];
        } else {
          formattedRow[name] = rowData[fieldKey];
        }
      }
    }
  });
  return formattedRow;
};

export const tongaCovidRawData = async (reqContext: ReqContext, query: FetchReportQuery) => {
  const { organisationUnitCodes: entityCodes, hierarchy, startDate, endDate, period } = query;
  const individuals = await reqContext.services.entity.getDescendantsOfEntities(
    hierarchy,
    entityCodes,
    { filter: { type: 'individual' } },
  );
  const individualsByCode = individuals.map((ind: Record<string, unknown>) => ind.code);

  const ancestorData: AncestorData = await useAncestorData(
    reqContext,
    hierarchy,
    individualsByCode,
  );

  const { registrationEvents, resultsEvents } = await fetchEvents(
    reqContext,
    individualsByCode,
    hierarchy,
    startDate,
    endDate,
    period,
  );

  const builtEvents: Record<string, any>[] = combineAndFlatten(
    registrationEvents,
    resultsEvents,
    ancestorData,
  );
  const rows = builtEvents
    .map(rowData => parseRowData(rowData))
    .sort((row, nextRow) => {
      if (row['Test ID'] === nextRow['Test ID']) {
        return 0;
      }
      return 1;
    });

  const columns: Record<string, string>[] = SURVEYS.columns.map(key => {
    return { title: key, key };
  });

  return { columns, rows: rows.filter((row, index) => index < 20) };
};
