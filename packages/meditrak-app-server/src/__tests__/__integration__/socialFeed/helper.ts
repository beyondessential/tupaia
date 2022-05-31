/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

/**
 * Remove 'id' field and empty fields
 */
export const filterItemFields = (items: Record<string, any>[]) =>
  items.map(({ id, template_variables, ...restOfItem }) => {
    const fieldsWithValues = Object.fromEntries(
      Object.entries(restOfItem).filter(([, value]) => value !== null),
    );
    if (Object.keys(template_variables).length > 0) {
      return { ...fieldsWithValues, template_variables };
    }
    return fieldsWithValues;
  });

export const replaceItemsCountryWithCountryId = (
  items: Record<string, any>[],
  countryCodeToId: Record<string, string>,
) =>
  items.map(({ country, ...restOfItem }) => {
    if (!country) {
      return restOfItem;
    }

    return { ...restOfItem, country_id: countryCodeToId[country] };
  });

export const addLeaderboardAsThirdItem = (
  items: Record<string, any>[],
  leaderboardItem: Record<string, any>,
) => items.splice(2, 0, leaderboardItem);
