import { inspect } from 'util';
import { Entity } from '/models';

export const mapAnalyticsToCountries = analytics => {
  const analyticsMappedToCountry = analytics.map(async res => {
    const resultEntity = await Entity.findOne({ code: res.organisationUnit });
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
