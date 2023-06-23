/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import ExpandIcon from '@material-ui/icons/ExpandMore';
import { Button, IconButton, List as MuiList, ListItemProps } from '@material-ui/core';
import { useEntities } from '../../api/queries';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const List = styled(MuiList)`
  margin-left: 10px;

  .MuiButtonBase-root.MuiIconButton-root.Mui-disabled .MuiSvgIcon-root {
    color: transparent;
  }
`;

const MenuLink = styled(Button).attrs({
  component: Link,
})<ListItemProps>`
  flex: 1;
  justify-content: flex-start;
  text-transform: none;
  padding: 1rem;
  font-size: 0.875rem;
`;

const ExpandedList = ({ projectCode, children, isLoading }) => {
  const entityList = children.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <List>
      {entityList.map(entity => (
        <EntityMenuItem
          key={entity.code}
          projectCode={projectCode}
          entityName={entity.name}
          entityCode={entity.code}
          children={entity.children}
          parentIsLoading={isLoading}
        />
      ))}
    </List>
  );
};

export const EntityMenuItem = ({
  projectCode,
  entityName,
  entityCode,
  children,
  parentIsLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useEntities(projectCode!, entityCode!, { enabled: isExpanded });

  const onExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const nextChildren = data?.children || children;
  const showButton = parentIsLoading || nextChildren;

  return (
    <div>
      <FlexRow>
        <MenuLink to={entityName}>{entityName}</MenuLink>
        {showButton && (
          <IconButton onClick={onExpand} disabled={parentIsLoading}>
            <ExpandIcon />
          </IconButton>
        )}
      </FlexRow>
      {isExpanded && (
        <ExpandedList children={nextChildren} projectCode={projectCode} isLoading={isLoading} />
      )}
    </div>
  );
};

/*
 * Todo:
 *  Facility type icons
 *  Remove Australian state numbers
 *  Typescript
 *  Show on focus
 *  Expand button style
 *
 *
 *  */
export const EntityMenu = () => {
  const { projectCode, entityCode } = useParams();
  const { data } = useEntities(projectCode!, entityCode!);
  return <ExpandedList projectCode={projectCode} children={data?.children || []} />;
};
