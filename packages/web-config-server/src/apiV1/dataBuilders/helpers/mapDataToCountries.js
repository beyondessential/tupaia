import { inspect } from 'util';
import { Entity } from '/models';

export const mapDataToCountries = data => {
  const dataMappedToCountry = data.map(async res => {
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
    const country = await resultEntity.getCountry();

    return { ...res, organisationUnit: country.name };
  });

  return Promise.all(dataMappedToCountry);
};
