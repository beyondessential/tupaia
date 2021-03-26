/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { ReactComponent as Province } from '../icons/province.svg';
import { ReactComponent as District } from '../icons/district.svg';
import { ReactComponent as School } from '../icons/school.svg';

/**
 * Get the display icon for search results
 */
export const getPlaceIcon = type => {
  switch (type) {
    case 'province':
      return <Province />;
    case 'district':
      return <District />;
    case 'village':
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

  const newHierarchy = [...hierarchy, name];

  if (type === 'country') {
    return newHierarchy.join(', ');
  }

  const parentEntity = entities.find(entity => entity.entityCode === parentCode);

  if (!parentEntity) {
    return newHierarchy.join(', ');
  }

  return getOptionText(parentEntity, entities, newHierarchy);
};
