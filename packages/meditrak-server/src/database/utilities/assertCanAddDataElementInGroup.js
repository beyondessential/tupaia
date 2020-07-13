/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * TODO this method can be simplified and defined in the DataSource model
 * when tupaia-backlog#663 is implemented
 */
const getDataGroupsThatIncludeElement = async (models, dataElementCode) => {
  const dataGroups = await models.database.executeSql(
    `
    SELECT ds.* FROM data_source ds
    JOIN survey s ON s.code = ds.code
    JOIN survey_screen ss ON ss.survey_id = s.id
    JOIN survey_screen_component ssc ON ssc.screen_id = ss.id
    JOIN question q ON q.id = ssc.question_id
    WHERE q.code = ? AND ds.type = 'dataGroup'
  `,
    [dataElementCode],
  );

  return Promise.all(dataGroups.map(models.dataSource.generateInstance));
};

const areBothDefinedAndDifferent = (oldValue, newValue) =>
  oldValue !== undefined && newValue !== undefined && oldValue !== newValue;

const constructErrorMessage = ({ property, value, dataElementCode, otherGroupCode }) =>
  `Cannot set ${property} to '${value}': data element '${dataElementCode}' is included in data group '${otherGroupCode}', which uses another ${property}`;

export const assertCanAddDataElementInGroup = async (
  models,
  dataElementCode,
  dataGroupCode,
  updatedFields = {},
) => {
  const { service_type: newServiceType, config: newConfig = {} } = updatedFields;

  const dataGroups = await getDataGroupsThatIncludeElement(models, dataElementCode);
  const otherDataGroups = dataGroups.filter(({ code }) => code !== dataGroupCode);
  otherDataGroups.forEach(otherDataGroup => {
    const { service_type: serviceType, config } = otherDataGroup;

    if (areBothDefinedAndDifferent(serviceType, newServiceType)) {
      throw new Error(
        constructErrorMessage({
          property: 'service type',
          value: newServiceType,
          dataElementCode,
          otherGroupCode: otherDataGroup.code,
        }),
      );
    }

    if (areBothDefinedAndDifferent(config.isDataRegional, newConfig.isDataRegional)) {
      throw new Error(
        constructErrorMessage({
          property: 'DHIS server',
          value: `${config.isDataRegional ? '' : 'non '}regional`,
          dataElementCode,
          otherGroupCode: otherDataGroup.code,
        }),
      );
    }
  });
};
