import { dataElementMustMatchDataGroupServiceType } from './dataElementMustMatchDataGroupServiceType';

const areBothDefinedAndDifferent = (a, b) => a !== undefined && b !== undefined && a !== b;

const constructErrorMessage = ({
  property,
  newValue,
  dataElementCode,
  otherGroupCode,
  otherValue,
}) =>
  `Cannot set ${property} to '${newValue}': data element '${dataElementCode}' is included in data group '${otherGroupCode}', which has ${property}: '${otherValue}'. These must match.`;

export const assertCanAddDataElementInGroup = async (
  models,
  dataElementCode,
  dataGroupCode,
  updatedFields = {},
) => {
  const { service_type: newServiceType, config: newConfig = {} } = updatedFields;

  const dataElement = await models.dataElement.findOne({ code: dataElementCode });
  const dataGroups = await models.dataGroup.getDataGroupsThatIncludeElement({
    code: dataElementCode,
  });
  const otherDataGroups = dataGroups.filter(({ code }) => code !== dataGroupCode);
  otherDataGroups.forEach(otherDataGroup => {
    const { service_type: otherServiceType, config: otherConfig } = otherDataGroup;

    // Tupaia data elements can be in either dhis or tupaia data groups
    if (
      dataElementMustMatchDataGroupServiceType(dataElement.service_type) &&
      areBothDefinedAndDifferent(otherServiceType, newServiceType)
    ) {
      throw new Error(
        constructErrorMessage({
          property: 'service type',
          newValue: newServiceType,
          dataElementCode,
          otherGroupCode: otherDataGroup.code,
          otherValue: otherServiceType,
        }),
      );
    }

    if (otherConfig.dhisInstanceCode !== newConfig.dhisInstanceCode) {
      throw new Error(
        constructErrorMessage({
          property: 'DHIS server',
          newValue: newConfig.dhisInstanceCode,
          dataElementCode,
          otherGroupCode: otherDataGroup.code,
          otherValue: otherConfig.dhisInstanceCode,
        }),
      );
    }
  });
};
