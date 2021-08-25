/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import Laos from '../components/icons/laos.svg';
import Province from '../components/icons/province.svg';
import District from '../components/icons/district.svg';
import School from '../components/icons/school.svg';
import { getSvgIconImage } from './getSvgIconImage';

/**
 * Get the display icon for search results
 */
export const getPlaceIcon = type => {
  switch (type) {
    case 'country':
      return getSvgIconImage(Laos);
    case 'district':
      return getSvgIconImage(Province);
    case 'sub_district':
      return getSvgIconImage(District);
    case 'school':
      return getSvgIconImage(School);
    default:
      return getSvgIconImage(District);
  }
};

/**
 * Get the display text for search results
 */
export const getOptionText = (option, entities, hierarchy = []) => {
  const { type, name, parentCode } = option;

  if (type === 'country') {
    if (hierarchy.length === 0) {
      return name; // Return the country name
    }

    return hierarchy.join(', ');
  }

  const newHierarchy = [...hierarchy, name];

  const parentEntity = entities.find(entity => entity.code === parentCode);

  if (!parentEntity) {
    return newHierarchy.join(', ');
  }

  return getOptionText(parentEntity, entities, newHierarchy);
};
