import React from 'react';
import { LaosFlag } from '../components/Icons/LaosFlag';
import { Province } from '../components/Icons/Province';
import { District } from '../components/Icons/District';
import { School } from '../components/Icons/School';

/**
 * Get the display icon for search results
 */
export const getPlaceIcon = type => {
  switch (type) {
    case 'country':
      return <LaosFlag />;
    case 'district':
      return <Province />;
    case 'sub_district':
      return <District />;
    case 'school':
      return <School />;
    default:
      return <District />;
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
