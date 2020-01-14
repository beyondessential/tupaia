/**
 * Removes redundant fields from an analytics query to prevent the following DHIS errors:
 * 1. `Periods and start and end dates cannot be specified simultaneously`
 * 2. `Request-URI Too Large`
 */
const removeRedundantFields = queryIn => {
  const query = { ...queryIn };

  if (queryIn.period) {
    // [`startDate`, `endDate`] and `period` cannot be used at the same data value analytic query
    delete query.startDate;
    delete query.endDate;
  }

  // Remove redundant properties which can significantly increase the request uri
  delete query.period;
  delete query.dataElementCodes;
  delete query.dataElementGroupCode;
  delete query.dataElementGroupCodes;
  delete query.organisationUnitCodes;

  return query;
};

export const buildAnalyticsQuery = queryIn => {
  const query = { ...queryIn };

  // Add common defaults for input and output id schemes
  query.inputIdScheme = 'code';
  query.outputIdScheme = query.outputIdScheme || 'uid';

  // Transform the easily understood 'dataElementCodes', 'period', etc. to DHIS2 language
  const {
    dataElementCodes,
    dataElementGroupCode,
    dataElementGroupCodes,
    organisationUnitCode,
    period,
  } = query;
  const getDxString = () => {
    if (dataElementCodes) {
      return dataElementCodes.join(';');
    }
    return (dataElementGroupCodes || [dataElementGroupCode])
      .map(groupCode => `DE_GROUP-${groupCode}`)
      .join(';');
  };
  const dxString = getDxString();

  query.dimension = [`dx:${dxString}`, `pe:${period}`, `ou:${organisationUnitCode}`];
  query.includeMetadataDetails = true;

  return removeRedundantFields(query);
};
