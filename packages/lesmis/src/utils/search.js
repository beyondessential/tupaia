/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { ReactComponent as Laos } from '../components/icons/laos.svg';
import { ReactComponent as Province } from '../components/icons/province.svg';
import { ReactComponent as District } from '../components/icons/district.svg';
import { ReactComponent as School } from '../components/icons/school.svg';

/**
 * Get the display icon for search results
 */
export const getPlaceIcon = type => {
  switch (type) {
    case 'country':
      return <Laos />;
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
