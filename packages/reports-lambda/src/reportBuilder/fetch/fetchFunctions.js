const fetchAnalytics = async (aggregator, query, params) => {
  const { organisationUnitCode } = query;
  const { dataElementCodes, aggregationType } = params;
  console.log(dataElementCodes, aggregationType);
  const response = await aggregator.fetchAnalytics(
    dataElementCodes,
    {
      dataServices: [
        {
          isDataRegional: false,
        },
      ],
      organisationUnitCodes: [organisationUnitCode],
    },
    {},
    {
      aggregationType,
    },
  );
  response.results.forEach(row => {
    row[row.dataElement] = row.value;
    delete row.dataElement;
    delete row.value;
  });
  return response;
};

const fetchEvents = async (aggregator, query, params) => {
  const {
    programCode,
    dataElementCodes,
    dataServices,
    entityAggregation,
    dataSourceEntityFilter,
  } = params;
  const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = query;
  const response = await aggregator.fetchEvents(programCode, {
    useDeprecatedApi: false,
    dataServices,
    entityAggregation,
    dataSourceEntityFilter,
    organisationUnitCodes: [organisationUnitCode],
    startDate,
    endDate,
    trackedEntityInstance,
    eventId,
    dataElementCodes,
  });
  response.forEach(row => {
    Object.entries(row.dataValues).forEach(([key, value]) => {
      row[key] = value;
    });
    delete row.dataValues;
  });
  return {
    results: response,
  };
};

export const fetchFunctions = {
  fetchAnalytics,
  fetchEvents,
};
