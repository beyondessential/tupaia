/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { FormLabel, FormLabelProps, Typography } from '@material-ui/core';
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

const Label = styled(FormLabel)<{
  component: React.ElementType;
}>`
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme, color }) => theme.palette.text[color!]};
`;
interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  label?: string;
  ListItem?: React.ElementType;
  variant?: 'fullPage' | 'inline';
  labelProps: FormLabelProps & {
    component?: React.ElementType;
  };
}

export const SelectList = ({
  items = [],
  onSelect,
  label,
  ListItem,
  variant = 'inline',
  labelProps = {},
}: SelectListProps) => {
  return (
    <Wrapper>
      {label && (
        <Label {...labelProps} component={labelProps?.component ?? 'h2'}>
          {label}
        </Label>
      )}
      <ListWrapper $variant={variant} className="list-wrapper">
        {items.length === 0 ? (
          <NoResultsMessage>No items to display</NoResultsMessage>
        ) : (
          <List items={items} onSelect={onSelect} ListItem={ListItem} />
        )}
      </ListWrapper>
    </Wrapper>
  );
};
