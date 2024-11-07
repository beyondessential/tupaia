/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { FormLabel, Typography, FormLabelProps } from '@material-ui/core';
import { ListItemType } from './types';
import { List } from './List';

const Wrapper = styled.div`
  padding: 0;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ListWrapper = styled.div`
  overflow-y: auto;
  max-height: 100%;
  flex: 1;
  height: 100%;
`;

const NoResultsMessage = styled(Typography)`
  padding: 0.8rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const Label = styled(FormLabel)<{
  component: React.ElementType;
}>`
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: ${({ theme, color }) => theme.palette.text[color!]};
  font-weight: 400;
`;

const Subtitle = styled(Typography)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 400;
  margin: 0 0 0.5rem 0.9rem;
`;

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  label?: string;
  ListItem?: React.ElementType;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
  noResultsMessage?: string;
  subTitle?: string;
}

export const SelectList = ({
  items = [],
  onSelect,
  label,
  ListItem,
  labelProps = {},
  noResultsMessage = 'No items to display',
  subTitle = '',
}: SelectListProps) => {
  return (
    <Wrapper>
      {label && (
        <Label {...labelProps} component={labelProps?.component ?? 'h2'}>
          {label}
        </Label>
      )}
      <ListWrapper className="list-wrapper">
        {subTitle && <Subtitle>{subTitle}</Subtitle>}
        {items.length === 0 ? (
          <NoResultsMessage>{noResultsMessage}</NoResultsMessage>
        ) : (
          <List items={items} onSelect={onSelect} ListItem={ListItem} />
        )}
      </ListWrapper>
    </Wrapper>
  );
};
