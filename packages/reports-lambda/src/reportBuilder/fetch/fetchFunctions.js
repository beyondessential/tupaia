const fetchAnalytics = (aggregator, query, params) => {
  const { organisationUnitCode } = query;
  const { codes: dataElementCodes, aggregationType } = params;
  console.log(dataElementCodes, aggregationType);
  return aggregator.fetchAnalytics(
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
};

const fetchEvents = (aggregator, query, params) => {
  const { programCode, dataServices, entityAggregation, dataSourceEntityFilter } = this.config;
  const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = this.query;

  return aggregator.fetchEvents(eventsProgramCode, {
    dataServices,
    entityAggregation,
    dataSourceEntityFilter,
    organisationUnitCode,
    startDate,
    endDate,
    trackedEntityInstance,
    eventId,
    ...additionalQueryConfig,
  });
};
