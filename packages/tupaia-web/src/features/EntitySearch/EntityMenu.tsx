/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { EntityResponse, ProjectCode } from '../../types';
import { LocalHospital as HospitalIcon, ExpandMore as ExpandIcon } from '@material-ui/icons';
import { Button, IconButton, List as MuiList, ListItemProps } from '@material-ui/core';
import { useEntities } from '../../api/queries';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const List = styled(MuiList)`
  margin-left: 1rem;

  // Hide expand icon when there are no children but keep the element on the page for spacing
  .MuiButtonBase-root.MuiIconButton-root.Mui-disabled .MuiSvgIcon-root {
    color: transparent;
  }
`;

const MenuLink = styled(Button).attrs({
  component: Link,
})<ListItemProps>`
  display: inline;
  flex: 1;
  justify-content: flex-start;
  text-transform: none;
  padding: 0.8rem;
  font-size: 0.875rem;

  .MuiSvgIcon-root {
    vertical-align: bottom;
  }
`;

interface EntityMenuProps {
  projectCode: ProjectCode;
  children: EntityResponse[];
  grandChildren: EntityResponse[];
  onClose: () => void;
}

/*
 * ExpandedList is a recursive component that renders a list of entities and their children to
 * display an expandable entity menu.
 */
export const EntityMenu = ({ projectCode, children, grandChildren, onClose }: EntityMenuProps) => {
  const sortedChildren = children.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <List aria-expanded>
      {sortedChildren.map(entity => (
        <EntityMenuItem
          key={entity.code}
          projectCode={projectCode}
          children={grandChildren.filter(child => child.parentCode === entity.code)}
          entity={entity}
          onClose={onClose}
        />
      ))}
    </List>
  );
};

interface EntityMenuItemProps {
  projectCode: ProjectCode;
  entity: EntityResponse;
  onClose: () => void;
  children?: EntityResponse[];
}
const EntityMenuItem = ({ projectCode, entity, children, onClose }: EntityMenuItemProps) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data = [] } = useEntities(projectCode!, entity.code!, {}, { enabled: isExpanded });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  /*
   Pre-populate the next layer of the menu with children that came from the previous layer of entity
   data then replace them with the children from the API response when it arrives
 */
  const nextChildren =
    data?.filter(childEntity => childEntity.parentCode === entity.code) || children;

  const grandChildren = data.filter(childEntity => childEntity.parentCode !== entity.code);

  const link = { ...location, pathname: `/${projectCode}/${entity.code}` };

  return (
    <div>
      <FlexRow>
        <MenuLink to={link} onClick={onClose}>
          {entity.name} {entity.type === 'facility' && <HospitalIcon />}
        </MenuLink>
        <IconButton
          onClick={toggleExpanded}
          disabled={!entity.childCodes}
          aria-label="toggle menu for this entity"
        >
          <ExpandIcon />
        </IconButton>
      </FlexRow>
      {isExpanded && (
        <EntityMenu
          children={nextChildren!}
          grandChildren={grandChildren}
          projectCode={projectCode}
          onClose={onClose}
        />
      )}
    </div>
  );
};
