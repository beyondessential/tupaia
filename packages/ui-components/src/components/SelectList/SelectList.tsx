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

const fullBorder = css`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 3px;
  padding: 0 1rem;
`;

const topBorder = css`
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 0;
  padding: 0.5rem 0;
`;

const ListWrapper = styled.div<{
  $variant: string;
}>`
  overflow-y: auto;
  max-height: 100%;
  ${({ $variant = 'fullBorder' }) => {
    if ($variant === 'fullBorder') return fullBorder;
    if ($variant === 'topBorder') return topBorder;
    return '';
  }}
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
  margin-block: 0 0.5rem;
  margin-inline: 0 0.9rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    color: ${({ theme }) => theme.palette.text.primary};
    border-block-end: max(0.0265rem, 1px) solid ${({ theme }) => theme.palette.divider};
    margin-block: 0 0.5rem;
    margin-inline: 0;
    padding-block-end: 0.2rem;
    font-weight: 500;
  }
`;

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
  label?: string;
  ListItem?: React.ElementType;
  variant?: 'fullBorder' | 'topBorder' | 'borderless';
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
  variant = 'fullBorder',
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
      <ListWrapper $variant={variant} className="list-wrapper">
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
