import { inspect } from 'util';

export const mapAnalyticsToCountries = (models, analytics) => {
  const analyticsMappedToCountry = analytics.map(async res => {
    // TUP-3156: bare findOne on a duplicated-per-project code is safe here —
    // we only consume resultEntity.country_code below, and that's identical
    // across all per-project copies of a sub-country entity.
    const resultEntity = await models.entity.findOne({ code: res.organisationUnit });
    if (!resultEntity) {
      throw new Error(
        `Could not find entity with code: ${res.organisationUnitCode} for result: ${inspect(
          res,
          false,
          null,
          true,
        )}.`,
      );
    }

    return { ...res, organisationUnit: resultEntity.country_code };
  });

  return Promise.all(analyticsMappedToCountry);
};
