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
    case 'Province':
      return <Province />;
    case 'District':
      return <District />;
    case 'Village':
      return <School />;
    default:
      return <District />;
  }
};

/**
 * Get the display text for search results
 */
export const getOptionText = (option, countryHeirarchy, hierarchy = []) => {
  const { type, name, parent } = option;

  const newHierarchy = [...hierarchy, name];

  if (type === 'Country') {
    return newHierarchy.join(', ');
  }

  const parentOrgUnit = countryHeirarchy.find(entity => entity.organisationUnitCode === parent);

  if (!parentOrgUnit) {
    return newHierarchy.join(', ');
  }

  return getOptionText(parentOrgUnit, countryHeirarchy, newHierarchy);
};
