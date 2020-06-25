import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { reduceToDictionary } from '@tupaia/utils';

import moment from 'moment';

const RAW_VALUE_DATE_FORMAT = 'D-M-YYYY h:mma';

class RawDataValuesBuilder extends DataBuilder {
  async build() {
    const surveyCodes = this.query.surveyCodes;
    const data = await this.fetchResults(surveyCodes.split(','));
    return { data };
  }

  async fetchResults(surveyCodes) {
    const data = {};

    const surveyCodeToName = reduceToDictionary(this.config.surveys, 'code', 'name');

    //Loop through each selected survey and fetch the analytics of that survey,
    //then build a matrix around the analytics
    for (let surveyCodeIndex = 0; surveyCodeIndex < surveyCodes.length; surveyCodeIndex++) {
      const surveyCode = surveyCodes[surveyCodeIndex];

      const { dataElements: dataElementsMetadata } = await this.fetchDataGroup(surveyCode);

      const dataElementCodes = this.config.excludeCodes ? 
            dataElementsMetadata.map(d => d.code).filter(code => !this.config.excludeCodes.includes(code)) 
            : dataElementsMetadata.map(d => d.code);

      const events = await this.fetchEvents({ dataElementCodes }, surveyCode);

      const columns = this.buildColumns(events);

      const dataElementCodeToText = reduceToDictionary(dataElementsMetadata, 'code', 'text');

      let rows = [];

      if (columns && columns.length) {
        rows = await this.buildRows(events, dataElementCodeToText);
      }

      const tableData = {
        columns,
        rows,
      };
    
      let isTransformed = false;
      let newTableData = {};
      if(this.config.transformations && this.config.transformations.includes('transpose')) {
          newTableData = this.transposeMatrix(columns, rows);
          isTransformed = true;
      }

      data[surveyCodeToName[surveyCode]] = {
        // need the nested 'data' property to be interpreted as the input to a matrix
        data: isTransformed ? newTableData : tableData,
      };
    }

    return data;
  }

  /**
   * Build columns for each organisationUnit - period combination
   */
  buildColumns = events => {
    const builtColumnsMap = {};

    events.forEach(({ event }) => {
      //event = id of survey_response
      builtColumnsMap[event] = {
        key: event,
        title: event,
      };
    });

    return Object.values(builtColumnsMap);
  };

  /**
   * Build row values for data elements of different organisationUnit - period combination
   */
  buildRows = async (events, dataElementCodeToText) => {
    const builtRows = [];

    const DEFAULT_DATA_KEY_TO_TEXT = {
      entityCode: 'Entity Code',
      name: 'Name',
      date: 'Date',
    };

    const dataKeyToName = {
      ...DEFAULT_DATA_KEY_TO_TEXT,
      ...dataElementCodeToText,
    };

    //Loop through each data key and build a row for each organisationUnit - period combination
    Object.entries(dataKeyToName).forEach(([dataKey, text]) => {
      //First column is the name of the data element
      const row = {
        dataElement: text,
      };

      //Build a row for each organisationUnit - period combination
      events.forEach(({ event, orgUnit, orgUnitName, eventDate, dataValues }) => {
        Object.entries(dataValues).forEach(([code, dataValue]) => {
          if (dataKey === code || DEFAULT_DATA_KEY_TO_TEXT[dataKey]) {
            let value;

            switch (dataKey) {
              case 'name':
                value = orgUnitName;
                break;
              case 'entityCode':
                value = orgUnit;
                break;
              case 'date':
                value = moment(eventDate).format(RAW_VALUE_DATE_FORMAT);
                break;
              default:
                value = dataValue;
                break;
            }

            row[event] = value;
          }
        });
      });

      builtRows.push(row);
    });

    return builtRows;
  };

  /* swap columns and rows */
  transposeMatrix = (columns, rows) => {
    let newRows = [];
    const columnMap = {};
    columns.forEach(column=>columnMap[column.key] = {});

    const newColumns = rows.map( row => {
        for (let col in row) {
            if(col !== 'dataElement') 
                columnMap[col][row.dataElement] = row[col];
        }
        return ({
            key: row.dataElement,
            title: row.dataElement,
        });
    });
    
    //bit of a hacky way to add column headers
    const columnHeader = {};
    newColumns.forEach(col=>columnHeader[col.key] = col.key);
    newRows.push({dataElement: '', ...columnHeader});

    columns.forEach(col => {
        newRows.push({dataElement: '', ...columnMap[col.key]});
    });
    return {
        columns: newColumns,
        rows: newRows        
    };
  };
}

export const rawDataValues = async ({ dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new RawDataValuesBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.RAW_DATA,
  );

  return builder.build();
};
