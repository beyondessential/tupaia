import { inspect } from 'util';

export const mapAnalyticsToCountries = (models, analytics) => {
  const analyticsMappedToCountry = analytics.map(async res => {
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
