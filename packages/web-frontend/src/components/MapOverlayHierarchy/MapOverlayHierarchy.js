/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { HierarchyItem } from './HierarchyItem';

export const MapOverlayHierarchy = ({
  currentMapOverlayCodes,
  onSelectMapOverlay,
  isCheckBox,
  hierarchyData,
}) => {
  const renderNestedHierarchyItems = children =>
    children.map(childObject => {
      let nestedItems;
      if (childObject.children && childObject.children.length) {
        nestedItems = renderNestedHierarchyItems(childObject.children);
      }

      const isSelected = childObject.children
        ? null
        : currentMapOverlayCodes.includes(childObject.mapOverlayCode);

      let onClick = null;
      if (!childObject.children) {
        onClick = () => onSelectMapOverlay(childObject, isSelected);
      }

      return (
        <HierarchyItem
          label={childObject.name}
          info={childObject.info}
          isCheckBox={isCheckBox}
          isSelected={isSelected}
          key={childObject.mapOverlayCode}
          onClick={onClick}
          nestedItems={nestedItems}
        />
      );
    });

  const rootItems = hierarchyData.map(({ name: groupName, children, info }) => {
    if (!Array.isArray(children)) return null;
    const nestedItems = renderNestedHierarchyItems(children);
    if (nestedItems.length === 0) return null;

    return (
      <HierarchyItem
        nestedMargin="0px"
        label={groupName}
        info={info}
        nestedItems={nestedItems}
        key={groupName}
      />
    );
  });

  return rootItems.length > 0 ? rootItems : null;
};
