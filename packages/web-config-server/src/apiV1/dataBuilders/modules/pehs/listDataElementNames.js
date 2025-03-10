import { getDataElementCodesInGroup } from '/apiV1/utils';

/**
 * Return either the data element name, or the value stored by the user if the name matches the
 * regex passed in.
 * Use case: In PEHS each question is asking how well a given service is performed. If it isn't
 * given a "green light", another set of "suggested improvements" pops up, for the user to select
 * from, e.g. "More training". The final "suggested improvement" is a free text box that they
 * can write any improvement they want, so on the front end in that case we want to show what
 * they wrote, rather than the question text.
 *
 * @param {string} useValueIfNameMatches  Regex to test the data element name against
 * @param {string} name                   Data element name
 * @param {string} value                  Value stored by user against the data element
 */
const getNameOrValue = (useValueIfNameMatches, name, value) => {
  if (useValueIfNameMatches && name.match(useValueIfNameMatches)) {
    return value;
  }
  return name;
};

export const listDataElementNames = async ({ dataBuilderConfig, query }, aggregator, dhisApi) => {
  const { dataServices, useValueIfNameMatches } = dataBuilderConfig;

  const dataElementCodes = await getDataElementCodesInGroup(
    dhisApi,
    `${query.dataElementCode}_suggestions`,
  );
  const { results, metadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  // Translate the json so that the data element names are the values
  const returnJson = {};
  const { dataElementCodeToName } = metadata;
  returnJson.data = results
    .filter(({ value }) => value && value !== '0')
    .map(({ dataElement: dataElementCode, value }) => {
      const dataElementName = dataElementCodeToName[dataElementCode];
      return {
        code: dataElementName,
        value: getNameOrValue(useValueIfNameMatches, dataElementName, value),
      };
    });

  return returnJson;
};
