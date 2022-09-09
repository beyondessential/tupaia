/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import isequal from 'lodash.isequal';
import { DataServiceMapping } from './DataServiceMapping';

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
  constructor(models) {
    this.models = models;
  }

  /**
   * @public
   * @param {DataSource[]} dataSources
   * @param {Entity} [orgUnit]
   * @returns {Promise<DataServiceMapping>}
   */
  async getMapping(dataSources, orgUnit) {
    if (orgUnit) {
      return this.getMappingMultipleOrgUnits(dataSources, [orgUnit]);
    }
    return this.getMappingMultipleOrgUnits(dataSources, []);
  }

  /**
   * Similar to getMapping, but allows passing multiple orgUnitCodes where each
   * dataSource must resolve to a single DataServiceMappingEntry or an error will be thrown.
   *
   * This can be used when e.g. you have a data element which is stored on a DHIS Server
   * which stores data for multiple countries against that data element. If you ask for the
   * data service for that data element, you should get the single DHIS Server.
   *
   * @public
   * @param {DataSource[]} dataSources
   * @param {Entity[]} [orgUnits]
   * @returns {Promise<DataServiceMapping>}
   */
  async getMappingMultipleOrgUnits(dataSources, orgUnits = []) {
    const dataElements = dataSources.filter(ds => ds.databaseType === TYPES.DATA_ELEMENT);
    const dataGroups = dataSources.filter(ds => ds.databaseType === TYPES.DATA_GROUP);

    const mapping = new DataServiceMapping();
    mapping.dataElementMapping = await this.resolveDataElements(dataElements, orgUnits);
    mapping.dataGroupMapping = await this.resolveDataGroups(dataGroups);
    return mapping;
  }

  /**
   * Convenience method
   * @see getMapping
   * @public
   * @param {DataSource[]} dataSources
   * @param {string} [orgUnitCode]
   * @returns {Promise<DataServiceMapping>}
   */
  async getMappingByOrgUnitCode(dataSources, orgUnitCode) {
    const orgUnit = orgUnitCode
      ? await this.models.entity.findOne({ code: orgUnitCode })
      : undefined;
    return this.getMapping(dataSources, orgUnit);
  }

  /**
   * Convenience method
   * @see getMappingMultipleOrgUnits
   * @public
   * @param {DataSource[]} dataSources
   * @param {string[]} orgUnitCodes
   * @return {Promise<DataServiceMapping>}
   */
  async getMappingByOrgUnitCodes(dataSources, orgUnitCodes) {
    if (Array.isArray(orgUnitCodes) && orgUnitCodes.length > 0) {
      const orgUnits = await this.models.entity.find({ code: orgUnitCodes });
      return this.getMappingMultipleOrgUnits(dataSources, orgUnits);
    }
    return this.getMapping(dataSources, undefined);
  }

  /**
   * @private
   * @param {DataElement[]} dataElement
   * @param {Entity[]} [orgUnits]
   * @returns {Promise<DataServiceMappingEntry[]>}
   */
  async resolveDataElements(dataElements, orgUnits = []) {
    const countryCodes = orgUnits
      .map(orgUnit => orgUnit.country_code)
      .filter(countryCode => countryCode !== null && countryCode !== undefined);
    const dataElementCodes = dataElements.map(de => de.code);

    const mappings =
      countryCodes.length > 0
        ? await this.models.dataElementDataService.find({
            country_code: countryCodes,
            data_element_code: dataElementCodes,
          })
        : [];

    const resolved = [];
    for (const dataElement of dataElements) {
      const deMappings = mappings.filter(m => m.data_element_code === dataElement.code);

      if (deMappings.length > 1) {
        // If they all resolve to the same data service, this is fine
        const resolveToTheSameDataService = (mappingA, mappingB) => {
          if (mappingA.service_type !== mappingB.service_type) return false;
          return isequal(mappingA.service_config, mappingB.service_config);
        };
        for (const mappingA of deMappings) {
          for (const mappingB of deMappings) {
            if (mappingA === mappingB) continue;
            if (!resolveToTheSameDataService(mappingA, mappingB)) {
              throw new Error(
                `Conflicting mappings found for Data Source ${
                  dataElement.code
                } when fetching for orgUnits ${orgUnits.map(o => o.code).join(',')}`,
              );
            }
          }
        }
        // all data element mappings are the same, use first
        const [deMapping] = deMappings;
        resolved.push({
          dataSource: dataElement,
          service_type: deMapping.service_type,
          config: deMapping.service_config,
        });
        continue;
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
   * @private
   * @param {DataGroup[]} dataGroups
   * @returns {Promise<DataServiceMappingEntry[]>}
   */
  async resolveDataGroups(dataGroups) {
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
}
