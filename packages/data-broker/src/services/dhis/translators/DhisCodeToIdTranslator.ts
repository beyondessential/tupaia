import type { DhisApi } from '@tupaia/dhis-api';
import {
  translateElementKeysInEventAnalytics,
  translateMetadataInAnalytics,
} from '@tupaia/dhis-api';
import { runDatabaseFunctionInBatches } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import { DataBrokerModelRegistry, DataServiceEntity, RequireKeys } from '../../../types';
import { DhisAnalytics, DhisEventAnalytics } from '../types';

interface Query {
  dataElementCodes: string[];
  programCode?: string;
  programCodes?: string[];
  organisationUnitCode?: string;
  organisationUnitCodes?: string[];
  dataElementIdScheme?: 'id' | 'code';
  inputIdScheme?: 'uid' | 'code';
  outputIdScheme?: 'uid' | 'code';
}

interface DhisQuery {
  dataElementIds: string[];
  organisationUnitIds: string[];
  programIds?: string[];
  dataElementIdScheme: 'id' | 'code';
  inputIdScheme: 'uid' | 'code';
  outputIdScheme: 'uid' | 'code';
}

type ModifiedQuery = Partial<Query & DhisQuery>;

/**
 * DhisCodeToIdTranslator can be used for data pulls from a DHIS instance where there are no codes set against
 * the Data Elements, Org Units etc.
 *
 * It detects such instances, and swaps all the codes it is given to ids for the fetch, then does the same for
 * the data coming back (swapping ids in the response data for codes).
 */
export class DhisCodeToIdTranslator {
  private readonly models: DataBrokerModelRegistry;
  private readonly api: DhisApi;

  public constructor(models: DataBrokerModelRegistry, api: DhisApi) {
    this.models = models;
    this.api = api;
  }

  private async getAnalyticsByMethod(
    query: Query,
    getAnalyticsMethod: (query: DhisQuery) => Promise<DhisAnalytics>,
  ): Promise<DhisAnalytics> {
    const { dataElementCodes } = query;
    const { organisationUnitCode, organisationUnitCodes } = query;
    const orgUnitCodes = organisationUnitCode
      ? [organisationUnitCode]
      : (organisationUnitCodes as string[]);
    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(dataElementCodes);
    const allOrgUnitsHaveDhisId = await this.allOrgUnitsHaveDhisId(orgUnitCodes);
    const modifiedQuery = await this.getModifiedAnalyticsQuery(
      query,
      allDataElementsHaveDhisId,
      allOrgUnitsHaveDhisId,
    );
    const response = await getAnalyticsMethod(modifiedQuery);

    return this.getTranslatedAnalyticsResponse(
      response,
      dataElementCodes,
      orgUnitCodes,
      allDataElementsHaveDhisId,
      allOrgUnitsHaveDhisId,
    );
  }

  public async getAnalytics(query: Query) {
    const getAnalyticsMethod = this.api.getAnalytics.bind(this);
    return this.getAnalyticsByMethod(query, getAnalyticsMethod);
  }

  public async getAggregatedAnalytics(query: Query) {
    const getAnalyticsMethod = this.api.getAggregatedAnalytics.bind(this);
    return this.getAnalyticsByMethod(query, getAnalyticsMethod);
  }

  private async getModifiedAnalyticsQuery(
    query: Query,
    allDataElementsHaveDhisId: boolean,
    allOrgUnitsHaveDhisId: boolean,
  ) {
    let modifiedQuery: ModifiedQuery = { ...query };

    if (allDataElementsHaveDhisId && allOrgUnitsHaveDhisId) {
      // the analytics endpoints only allow a single "inputIdScheme", which means
      // both the dataElements and orgUnits need to be ids
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery as Query);
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
      modifiedQuery.inputIdScheme = 'uid';
      modifiedQuery.outputIdScheme = 'uid';
    }

    return modifiedQuery as DhisQuery;
  }

  private async getTranslatedAnalyticsResponse(
    response: DhisAnalytics,
    dataElementCodes: string[],
    orgUnitCodes: string[],
    allDataElementsHaveDhisId: boolean,
    allOrgUnitsHaveDhisId: boolean,
  ) {
    let translatedResponse = { ...response };

    // If all data elements have dhisId, it implies that we are using internal mapping and likely there are no data element codes on DHIS2
    // So we are translate them from ids to our internal data element codes here.
    if (allDataElementsHaveDhisId) {
      const dataElementIdToCode = await this.getDataElementDhisIdToCode(dataElementCodes);
      translatedResponse = translateMetadataInAnalytics(
        translatedResponse,
        dataElementIdToCode,
        'dx',
        'code',
      );
    }

    // Similar to data elements above, translating org unit ids to our internal entity codes.
    if (allOrgUnitsHaveDhisId) {
      const entityIdToCode = await this.getEntityDhisIdToCode(orgUnitCodes);
      // It's a little bit more complex with org units, as dhis may return
      // different org units than were requested
      translatedResponse = translateMetadataInAnalytics(
        translatedResponse,
        entityIdToCode,
        'ou',
        'code',
      );
    }

    return this.translateDefaultCoInResponse(translatedResponse) as DhisAnalytics;
  }

  private translateDefaultCoInResponse = (response: DhisAnalytics) => {
    if (!response?.rows?.length) return response;
    const coIndex = response.headers.findIndex(({ name }) => name === 'co');
    if (coIndex < 0) return response;

    const { metaData } = response;
    const defaultCoItem = Object.values(metaData.items).find(item => item.name === 'default');
    if (defaultCoItem) {
      const { uid: coId } = defaultCoItem;
      metaData.items[coId].code = 'default';
    }

    return { ...response, metaData };
  };

  private async getEntityDhisIdToCode(orgUnitCodes: string[]) {
    const orgUnitIdToCode: Record<string, string> = {};
    const mappings = await this.models.dataServiceEntity.find({ entity_code: orgUnitCodes });

    for (const orgUnitCode of orgUnitCodes) {
      const mapping = mappings.find(m => m.entity_code === orgUnitCode);
      if (!mapping) {
        throw new Error('Org Unit not found in data_service_entity');
      }
      if (!mapping.config.dhis_id) {
        throw new Error('Mapping config in data_service_entity does not include required dhis_id');
      }
      orgUnitIdToCode[mapping.config.dhis_id] = orgUnitCode;
    }

    return orgUnitIdToCode;
  }

  private async getDataElementDhisIdToCode(dataElementCodes: string[]) {
    const dataElementIdToCode: Record<string, string> = {};
    const dataElements = await this.models.dataElement.find({
      code: dataElementCodes,
    });

    for (const dataElement of dataElements) {
      if (!dataElement.config.dhisId) {
        throw new Error('Data element does not have dhisId');
      }
      dataElementIdToCode[dataElement.config.dhisId as string] = dataElement.code;
    }

    return dataElementIdToCode;
  }

  public async getEventAnalytics(query: Query): Promise<DhisEventAnalytics> {
    let modifiedQuery: ModifiedQuery = { ...query };

    // The base method here, DhisApi#getEventAnalytics will convert codes to ids before submitting the
    // actual data request. It does that with separate calls e.g. /api/dataElements. However, with dhis
    // setups where the Data Elements do not have codes, this api call will give us no new information.
    // To prevent this, we pre-emptively swap out codes for ids, using our internal mapping, so that
    // DhisApi#getEventAnalytics does not need to make these code-to-id conversion calls.
    const { dataElementCodes, dataElementIdScheme = 'code' } = query;
    const programCodes = query.programCode ? [query.programCode] : query.programCodes || [];
    const { organisationUnitCode, organisationUnitCodes } = query;
    const orgUnitCodes = organisationUnitCode
      ? [organisationUnitCode]
      : (organisationUnitCodes as string[]);
    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(dataElementCodes);
    const allProgramsHaveDhisId = await this.allProgramsHaveDhisId(programCodes);
    const allOrgUnitsHaveDhisId = await this.allOrgUnitsHaveDhisId(orgUnitCodes);

    if (allDataElementsHaveDhisId) {
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery as Query);
      modifiedQuery.dataElementIdScheme = 'id';
    }

    if (allProgramsHaveDhisId) {
      modifiedQuery = await this.replaceProgramCodesWithIds(modifiedQuery);
    }

    if (allOrgUnitsHaveDhisId) {
      modifiedQuery = await this.replaceOrgUnitCodesWithIds(modifiedQuery);
    }

    if (allDataElementsHaveDhisId && allProgramsHaveDhisId && allOrgUnitsHaveDhisId) {
      modifiedQuery.inputIdScheme = 'uid';
    }

    const response: DhisEventAnalytics = await this.api.getEventAnalytics(modifiedQuery);

    let translatedResponse = { ...response };

    // The api response will contain data elements with ids, and DhisApi will not be able to translate these
    // back into codes (because the codes are not set in dhis). So, we have to do it ourselves using the internal
    // mapping.
    if (allDataElementsHaveDhisId && dataElementIdScheme === 'code') {
      translatedResponse = await this.translateDataElementIdsToCodesInEventAnalyticResponse(
        translatedResponse,
        query.dataElementCodes,
      );
    }

    // It's a little bit more complex with org units, as dhis may return
    // different org units than were requested
    translatedResponse = await this.translateOrgUnitIdsToCodesInResponse(translatedResponse);

    return translatedResponse;
  }

  private allDataElementsHaveDhisId = async (dataElementCodes: string[]) => {
    const dataElements = await this.models.dataElement.find({ code: dataElementCodes });

    for (const dataElementCode of dataElementCodes) {
      const dataElement = dataElements.find(d => d.code === dataElementCode);
      if (!dataElement?.config?.dhisId) {
        return false;
      }
    }

    return true;
  };

  private allOrgUnitsHaveDhisId = async (orgUnitCodes: string[]) => {
    const mappings = await this.models.dataServiceEntity.find({ entity_code: orgUnitCodes });

    for (const orgUnitCode of orgUnitCodes) {
      const mapping = mappings.find(m => m.entity_code === orgUnitCode);

      if (!mapping) {
        return false;
      }
    }

    return true;
  };

  private allProgramsHaveDhisId = async (programCodes: string[]) => {
    const dataGroups = await this.models.dataGroup.find({ code: programCodes });

    for (const dataGroup of dataGroups) {
      if (!dataGroup.config.dhisId) {
        return false;
      }
    }

    return true;
  };

  private replaceDataElementCodesWithIds = async (
    query: RequireKeys<ModifiedQuery, 'dataElementCodes'>,
  ) => {
    const modifiedQuery: RequireKeys<ModifiedQuery, 'dataElementIds'> = {
      ...query,
      dataElementIds: [],
    };

    const { dataElementCodes } = query;

    const dataElements = await this.models.dataElement.find({ code: dataElementCodes });

    for (const dataElementCode of dataElementCodes) {
      const dataElement = dataElements.find(d => d.code === dataElementCode);

      if (!dataElement) {
        throw new Error(
          'DataElement not found in data_group, attempted to replace its code with an id',
        );
      }

      if (!dataElement.config.dhisId) {
        throw new Error(
          'DataElement does not have a dhisId, attempted to replace its code with the id',
        );
      }

      modifiedQuery.dataElementIds.push(dataElement.config.dhisId as string);
    }

    delete modifiedQuery.dataElementCodes;
    return modifiedQuery;
  };

  private translateDataElementIdsToCodesInEventAnalyticResponse = async (
    response: DhisEventAnalytics,
    dataElementCodes: string[],
  ): Promise<DhisEventAnalytics> => {
    const dataElementIdToCode: Record<string, string> = {};

    const dataElements = await this.models.dataElement.find({ code: dataElementCodes });

    for (const dataElement of dataElements) {
      if (dataElement.config.dhisId) {
        dataElementIdToCode[dataElement.config.dhisId as string] = dataElement.code;
      }
    }

    return translateElementKeysInEventAnalytics(response, dataElementIdToCode);
  };

  private translateOrgUnitIdsToCodesInResponse = async (response: DhisEventAnalytics) => {
    if (!response?.rows?.length) return response;

    const orgUnitIdIndex = response.headers.findIndex(({ name }) => name === 'ou');
    const orgUnitCodeIndex = response.headers.findIndex(({ name }) => name === 'oucode');
    if (orgUnitIdIndex === -1 || orgUnitCodeIndex === -1)
      throw new Error("Can't read org unit id/code from dhis");

    const dhisIds = response.rows.map(row => row[orgUnitIdIndex]) as string[];
    const mappings = (await runDatabaseFunctionInBatches(
      dhisIds,
      async (batchOfRecords: string[]) =>
        this.models.dataServiceEntity.find({
          'config->>dhis_id': batchOfRecords,
        }),
    )) as DataServiceEntity[];

    const mappingsByDhisId = reduceToDictionary(
      mappings,
      (el: DataServiceEntity) => el.config.dhis_id,
      'entity_code',
    );

    const newRows = response.rows.map(row => {
      const newRow = [...row];
      const dhisId = row[orgUnitIdIndex];
      const entityCode = mappingsByDhisId[dhisId];
      if (entityCode) newRow[orgUnitCodeIndex] = entityCode;
      return newRow;
    });

    return { ...response, rows: newRows };
  };

  private replaceOrgUnitCodesWithIds = async (query: ModifiedQuery) => {
    const modifiedQuery: RequireKeys<ModifiedQuery, 'organisationUnitIds'> = {
      ...query,
      organisationUnitIds: [],
    };

    const { organisationUnitCode, organisationUnitCodes } = query;

    const orgUnitCodes = organisationUnitCode
      ? [organisationUnitCode]
      : (organisationUnitCodes as string[]);

    const mappings = await this.models.dataServiceEntity.find({ entity_code: orgUnitCodes });

    for (const orgUnitCode of orgUnitCodes) {
      const mapping = mappings.find(m => m.entity_code === orgUnitCode);

      if (!mapping) {
        throw new Error(
          'Org Unit not found in data_service_entity, attempted to replace its code with the id',
        );
      }

      if (!mapping.config.dhis_id) {
        throw new Error('Mapping config in data_service_entity does not include required dhis_id');
      }

      modifiedQuery.organisationUnitIds.push(mapping.config.dhis_id);
    }

    delete modifiedQuery.organisationUnitCode;
    delete modifiedQuery.organisationUnitCodes;
    return modifiedQuery;
  };

  private replaceProgramCodesWithIds = async (query: ModifiedQuery) => {
    const modifiedQuery = { ...query };

    const programCodes = query.programCode ? [query.programCode] : query.programCodes || [];

    if (programCodes.length === 0) {
      throw new Error('No program codes to replace');
    }

    const dataGroups = await this.models.dataGroup.find({ code: programCodes });

    const programIds: string[] = [];

    for (const programCode of programCodes) {
      const dataGroup = dataGroups.find(d => d.code === programCode);

      if (!dataGroup) {
        throw new Error(
          `Program/DataGroup ${programCode} not found in data_group, attempted to replace its code with an id`,
        );
      }

      if (!dataGroup.config.dhisId) {
        throw new Error(
          `Program/DataGroup ${programCode} does not have a dhisId, attempted to replace its code with the id`,
        );
      }

      programIds.push(dataGroup.config.dhisId as string);
    }

    modifiedQuery.programIds = programIds;
    delete modifiedQuery.programCode;
    delete modifiedQuery.programCodes;
    return modifiedQuery;
  };

  public async fetchIndicators(query: Query): Promise<DhisQuery> {
    let modifiedQuery: ModifiedQuery = { ...query };
    const { dataElementCodes } = query;
    const allDataElementsHaveDhisId = await this.allDataElementsHaveDhisId(dataElementCodes);

    if (allDataElementsHaveDhisId) {
      modifiedQuery = await this.replaceDataElementCodesWithIds(modifiedQuery as Query);
    }

    return this.api.fetchIndicators(modifiedQuery);
  }
}
