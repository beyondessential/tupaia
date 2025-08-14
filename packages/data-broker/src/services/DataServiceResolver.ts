import { RECORDS } from '@tupaia/database';
import { DataBrokerModelRegistry, DataGroup, DataSourceTypeInstance, Entity } from '../types';
import { DataServiceMapping, DataServiceMappingEntry } from './DataServiceMapping';

/**
 * A data service e.g. tupaia or a specific instance of DHIS can be configured for each
 * Data Element and Data Group. It can also be configured by country, so one Data Element
 * could be pulled from one of many data services. This resolver looks at this map and
 * returns which data service to use.
 *
 * After https://linear.app/bes/issue/RN-594/dataelement-dg-multiple-data-services-mapping
 * this should return DataService instances instead of serviceType+serviceConfig pairs.
 */
export class DataServiceResolver {
  private models: DataBrokerModelRegistry;

  public constructor(models: DataBrokerModelRegistry) {
    this.models = models;
  }

  public async getMapping(
    dataSources: DataSourceTypeInstance[],
    orgUnit?: Entity,
  ): Promise<DataServiceMapping> {
    const dataElements = dataSources.filter(ds => ds.databaseRecord === RECORDS.DATA_ELEMENT);
    const dataGroups = dataSources.filter(ds => ds.databaseRecord === RECORDS.DATA_GROUP);
    const syncGroups = dataSources.filter(
      ds => ds.databaseRecord === RECORDS.DATA_SERVICE_SYNC_GROUP,
    );

    const mapping = new DataServiceMapping();
    mapping.dataElementMapping = await this.resolveDataElements(dataElements, orgUnit);
    mapping.dataGroupMapping = await this.resolveDataGroups(dataGroups);
    mapping.syncGroupMapping = await this.resolveSyncGroups(syncGroups);
    return mapping;
  }

  public async getMappingByOrgUnitCode(
    dataSources: DataSourceTypeInstance[],
    orgUnitCode?: string,
  ): Promise<DataServiceMapping> {
    const orgUnit = orgUnitCode
      ? await this.models.entity.findOne({ code: orgUnitCode })
      : undefined;
    return this.getMapping(dataSources, orgUnit);
  }

  public async getMappingByCountryCode(
    dataSources: DataSourceTypeInstance[],
    countryCode: string,
  ): Promise<DataServiceMapping> {
    const orgUnit = await this.models.entity.findOne({ code: countryCode, type: 'country' });
    return this.getMapping(dataSources, orgUnit);
  }

  private async resolveDataElements(
    dataElements: DataSourceTypeInstance[],
    orgUnit?: Entity,
  ): Promise<DataServiceMappingEntry[]> {
    const countryCode = orgUnit ? orgUnit.country_code : null;
    const dataElementCodes = dataElements.map(de => de.code);

    const mappings = countryCode
      ? await this.models.dataElementDataService.find({
          country_code: countryCode,
          data_element_code: dataElementCodes,
        })
      : [];

    const resolved = [];
    for (const dataElement of dataElements) {
      const deMappings = mappings.filter(m => m.data_element_code === dataElement.code);

      if (deMappings.length > 1) {
        throw new Error(
          `Multiple mappings found for Data Element ${dataElement.code} for country ${countryCode}`,
        );
      }

      if (deMappings.length === 1) {
        const [deMapping] = deMappings;
        resolved.push({
          dataSource: dataElement,
          service_type: deMapping.service_type,
          config: deMapping.service_config,
        });
        continue;
      }

      // No mappings, use default
      resolved.push({
        dataSource: dataElement,
        service_type: dataElement.service_type,
        config: dataElement.config,
      });
    }

    return resolved;
  }

  /**
   * Convenience method. Only Data Elements are supported, Data Groups use their default mapping.
   */
  private async resolveDataGroups(dataGroups: DataGroup[]): Promise<DataServiceMappingEntry[]> {
    const resolved = [];
    for (const dataGroup of dataGroups) {
      resolved.push({
        dataSource: dataGroup,
        service_type: dataGroup.service_type,
        config: dataGroup.config,
      });
    }
    return resolved;
  }

  /**
   * Convenience method. Only Data Elements are supported, Sync Groups use their default mapping.
   */
  private async resolveSyncGroups(
    syncGroups: DataSourceTypeInstance[],
  ): Promise<DataServiceMappingEntry[]> {
    const resolved = [];
    for (const syncGroup of syncGroups) {
      resolved.push({
        dataSource: syncGroup,
        service_type: syncGroup.service_type,
        config: syncGroup.config,
      });
    }
    return resolved;
  }
}
