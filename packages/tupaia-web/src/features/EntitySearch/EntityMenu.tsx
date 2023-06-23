/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Entity } from '@tupaia/types';
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

type EntityWithChildren = Entity & { children?: Entity[] };
/*
 * ExpandedList is a recursive component that renders a list of entities and their children to
 * display an expandable entity menu.
 */
const ExpandedList = ({
  projectCode,
  children,
  isLoading,
}: {
  projectCode: string;
  children: EntityWithChildren[];
  isLoading: boolean;
}) => {
  const entityList = children.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <List>
      {entityList.map(entity => (
        <EntityMenuItem
          key={entity.code}
          projectCode={projectCode}
          entity={entity}
          parentIsLoading={isLoading}
        />
      ))}
    </List>
  );
};

const EntityMenuItem = ({
  projectCode,
  entity,
  parentIsLoading = false,
}: {
  projectCode: string;
  entity: EntityWithChildren;
  parentIsLoading?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useEntities(projectCode!, entity.code!, { enabled: isExpanded });

  const onExpand = () => {
    setIsExpanded(!isExpanded);
  };

  /*
    Pre-populate the next layer of the menu with children that came from the previous layer of entity
    data then replace them with the children from the API response when it arrives
  */
  const nextChildren = data?.children || entity.children;

  return (
    <div>
      <FlexRow>
        <MenuLink to={entity.name}>
          {entity.name} {entity.type === 'facility' && <HospitalIcon />}
        </MenuLink>
        <IconButton onClick={onExpand} disabled={parentIsLoading || !nextChildren}>
          <ExpandIcon />
        </IconButton>
      </FlexRow>
      {isExpanded && (
        <ExpandedList children={nextChildren} projectCode={projectCode} isLoading={isLoading} />
      )}
    </div>
  );
};

export const EntityMenu = () => {
  const { projectCode, entityCode } = useParams();
  const { data, isLoading } = useEntities(projectCode!, entityCode!);

  return (
    <ExpandedList
      projectCode={projectCode!}
      children={data?.children || []}
      isLoading={isLoading}
    />
  );
};
