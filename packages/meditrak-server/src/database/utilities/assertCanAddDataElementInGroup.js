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

  const events = await models.event.getEventsThatIncludeElement({
    code: dataElementCode,
  });
  const otherEvents = events.filter(({ code }) => code !== dataGroupCode);
  otherEvents.forEach(otherEvent => {
    const { service_type: serviceType, config } = otherEvent;

    if (areBothDefinedAndDifferent(serviceType, newServiceType)) {
      throw new Error(
        constructErrorMessage({
          property: 'service type',
          value: newServiceType,
          dataElementCode,
          otherGroupCode: otherEvent.code,
        }),
      );
    }

    if (areBothDefinedAndDifferent(config.isDataRegional, newConfig.isDataRegional)) {
      throw new Error(
        constructErrorMessage({
          property: 'DHIS server',
          value: `${config.isDataRegional ? '' : 'non '}regional`,
          dataElementCode,
          otherGroupCode: otherEvent.code,
        }),
      );
    }
  });
};
