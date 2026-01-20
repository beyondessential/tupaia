import { findOrCreateDummyCountryEntity } from './findOrCreateDummyCountryEntity';

/**
 * Create some sample countries. This is to avoid duplicated code to create dummy records
 */
export const addBaselineTestCountries = async models => {
  const kiribatiCountry = await findOrCreateDummyCountryEntity(models, {
    code: 'KI',
    name: 'Kiribati',
  });

  const laosCountry = await findOrCreateDummyCountryEntity(models, {
    code: 'LA',
    name: 'Laos',
  });

  const solomonIslandsCountry = await findOrCreateDummyCountryEntity(models, {
    code: 'SB',
    name: 'Solomon Islands',
  });

  const vanuatuCountry = await findOrCreateDummyCountryEntity(models, {
    code: 'VU',
    name: 'Vanuatu',
  });

  const tongaCountry = await findOrCreateDummyCountryEntity(models, {
    code: 'TO',
    name: 'Tonga',
  });

  return { kiribatiCountry, laosCountry, solomonIslandsCountry, vanuatuCountry, tongaCountry };
};
