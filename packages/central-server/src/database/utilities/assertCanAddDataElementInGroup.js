/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

  const dataElement = await models.dataSource.findOne({ code: dataElementCode });
  const dataGroups = await models.dataSource.getDataGroupsThatIncludeElement({
    code: dataElementCode,
  });
  const otherDataGroups = dataGroups.filter(({ code }) => code !== dataGroupCode);
  otherDataGroups.forEach(otherDataGroup => {
    const { service_type: serviceType, config } = otherDataGroup;

    // Tupaia data elements can be in either dhis or tupaia data groups
    if (
      dataElement.service_type !== 'tupaia' &&
      areBothDefinedAndDifferent(serviceType, newServiceType)
    ) {
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
