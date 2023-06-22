/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button, IconButton, List as MuiList, ListItemProps } from '@material-ui/core';
import { useEntities } from '../../api/queries';
import ExpandIcon from '@material-ui/icons/ExpandMore';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const List = styled(MuiList)`
  margin-left: 10px;
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

const ExpandedList = ({ listItems }) => {
  const sortedItems = listItems.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <List>
      {sortedItems.map(({ code: entityCode, name: entityName, children }) => (
        <EntityMenuItem key={entityCode} entityName={entityName} listItems={children} />
      ))}
    </List>
  );
};

export const EntityMenuItem = ({ entityName, listItems }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const onExpand = () => {
    console.log('Expand');
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <FlexRow>
        <MenuLink to={entityName}>{entityName}</MenuLink>
        {listItems.length > 0 && (
          <IconButton onClick={onExpand}>
            <ExpandIcon />
          </IconButton>
        )}
      </FlexRow>
      {isExpanded && <ExpandedList listItems={listItems} />}
    </div>
  );
};

export const EntityMenu = () => {
  const { projectCode, entityCode } = useParams();
  const { data, isLoading } = useEntities(projectCode!, entityCode!);
  if (isLoading) return <p>Loading...</p>;

  const listItems = data?.children || [];
  return <ExpandedList listItems={listItems} />;
};
