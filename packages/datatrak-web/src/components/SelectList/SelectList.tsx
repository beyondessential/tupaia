/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { FormLabel, Typography } from '@material-ui/core';
import { ListItemType } from './ListItem';
import { List } from './List';

const Wrapper = styled.div`
  padding: 0;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FullBorder = css`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 3px;
  padding: 0 1rem;
`;

const TopBorder = css`
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 0;
  padding: 0.5rem 0;
`;

const ListWrapper = styled.div<{
  $variant: string;
}>`
  overflow-y: auto;
  max-height: 100%;
  ${({ $variant }) => ($variant === 'fullPage' ? TopBorder : FullBorder)};
  flex: 1;
  height: 100%;
`;

const NoResultsMessage = styled(Typography)`
  padding: 0.8rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const Label = styled(FormLabel).attrs({
  component: 'h2',
})`
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;
interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  label?: string;
  ListItem?: React.ElementType;
  variant?: 'fullPage' | 'inline';
}

export const SelectList = ({
  items = [],
  onSelect,
  label,
  ListItem,
  variant = 'inline',
}: SelectListProps) => {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <ListWrapper $variant={variant}>
        {items.length === 0 ? (
          <NoResultsMessage>No items to display</NoResultsMessage>
        ) : (
          <List items={items} onSelect={onSelect} ListItem={ListItem} />
        )}
      </ListWrapper>
    </Wrapper>
  );
};
