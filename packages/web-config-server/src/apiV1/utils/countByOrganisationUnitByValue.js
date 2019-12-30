export const countByOrganisationUnitByValue = (results, entities, valuesOfInterest) => {
  const countsByOrganisationUnit = {};
  results.forEach(({ organisationUnit: organisationUnitCode, value }) => {
    if (valuesOfInterest && !valuesOfInterest.includes(value)) {
      // not interested in this value, ignore it
      return;
    }
    if (!countsByOrganisationUnit[organisationUnitCode]) {
      const { name } = entities.find(e => e.code === organisationUnitCode);
      countsByOrganisationUnit[organisationUnitCode] = { name, total: 0 };
    }
    if (!countsByOrganisationUnit[organisationUnitCode][value]) {
      countsByOrganisationUnit[organisationUnitCode][value] = 0;
    }
    countsByOrganisationUnit[organisationUnitCode][value] += 1;
    countsByOrganisationUnit[organisationUnitCode].total += 1;
  });
  return countsByOrganisationUnit;
};
