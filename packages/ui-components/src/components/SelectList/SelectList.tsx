import React from 'react';
import styled, { css } from 'styled-components';
import { FormLabel, Typography, FormLabelProps } from '@material-ui/core';
import { ListItemType } from './types';
import { List, ListSkeleton } from './List';

const Wrapper = styled.div`
  padding: 0;
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ListWrapper = styled.div<{
  $variant: 'borderless' | 'fullBorder';
}>`
  block-size: 100%;
  flex: 1;
  max-block-size: 100%;
  overflow-y: auto;
  padding-block: 0.5rem;

  ${props =>
    props.$variant === 'fullBorder'
      ? css`
          border: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
          padding-inline: 1rem;
          border-radius: 0.1875rem;
        `
      : null}
`;

const NoResultsMessage = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  padding-block: 0.8rem;
  padding-inline: 0.5rem;
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
  variant?: 'fullBorder' | 'borderless';
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
  noResultsMessage?: string;
  showLoader?: boolean;
  subTitle?: string | null;
}

export const SelectList = ({
  items = [],
  onSelect,
  label,
  ListItem,
  variant = 'fullBorder',
  labelProps,
  noResultsMessage = 'No items to display',
  showLoader = false,
  subTitle,
}: SelectListProps) => {
  const renderList = () => {
    if (showLoader) return <ListSkeleton />;
    if (items.length === 0) return <NoResultsMessage>{noResultsMessage}</NoResultsMessage>;
    return <List items={items} onSelect={onSelect} ListItem={ListItem} />;
  };

  return (
    <Wrapper>
      {label && (
        <Label {...labelProps} component={labelProps?.component ?? 'h2'}>
          {label}
        </Label>
      )}
      <ListWrapper $variant={variant} className="list-wrapper">
        {subTitle && <Subtitle>{subTitle}</Subtitle>}
        {renderList()}
      </ListWrapper>
    </Wrapper>
  );
};
