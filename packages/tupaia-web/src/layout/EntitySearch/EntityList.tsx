/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useParams } from 'react-router';
import { useEntityData } from '../../api/queries';
import { List, ListItemProps, ListItem as MuiListItem } from '@material-ui/core';
import styled from 'styled-components';
import { RouterButton } from '../../components';

const ListItem = styled(MuiListItem).attrs({
  component: RouterButton,
})<ListItemProps>`
  padding: 1rem;
  font-size: 0.875rem;
`;

const ExpandedList = ({ listItems }) => {
  const sortedItems = listItems.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <List>
      {sortedItems.map(item => (
        <ListItem to={item.organisationUnitCode}>{item.name}</ListItem>
      ))}
    </List>
  );
};

export const EntityList = () => {
  const { projectCode, entityCode } = useParams();
  const {
    data: { organisationUnitChildren },
    isLoading,
  } = useEntityData(projectCode!, entityCode!);
  if (!organisationUnitChildren) return null;
  if (isLoading) return <p>Loading countries...</p>;
  return <ExpandedList listItems={organisationUnitChildren} />;
};
