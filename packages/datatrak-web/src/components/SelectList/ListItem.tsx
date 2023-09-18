/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactElement, ReactNode, useState } from 'react';
import styled from 'styled-components';
import {
  Collapse,
  ListItem as MuiListItem,
  ListItemProps as MuiListItemProps,
} from '@material-ui/core';
import { Check, KeyboardArrowRight } from '@material-ui/icons';
import { Tooltip } from '@tupaia/ui-components';

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.5rem;
  svg {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

// explicity set the types so that the overrides are applied, for the `button` prop
export const BaseListItem = styled(MuiListItem)<
  MuiListItemProps & {
    appearsDisabled?: boolean;
  }
>`
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 3px;
  padding: 0.3rem 1rem 0.3rem 0.5rem;
  color: ${({ theme, appearsDisabled }) =>
    appearsDisabled ? theme.palette.text.secondary : theme.palette.text.primary};
  &.Mui-selected {
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: transparent;
  }
  .MuiCollapse-container & {
    padding-left: 1rem;
  }
  &.MuiButtonBase-root {
    &:hover,
    &.Mui-selected:hover,
    &:focus,
    &.Mui-selected:focus {
      background-color: ${({ theme }) => theme.palette.primary.main}33;
    }
  }

  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

const Arrow = styled(KeyboardArrowRight)<{
  $open?: boolean;
}>`
  transform: ${({ $open }) => ($open ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.1s ease-in-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export type ListItemType = Record<string, unknown> & {
  children?: ListItemType[];
  content: string | ReactNode;
  value: string;
  selected?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  button?: boolean;
  appearsDisabled?: boolean;
};

interface ListItemProps {
  item: ListItemType;
  children?: ReactNode;
  onSelect: (item: ListItemType) => void;
}

const Wrapper = ({
  children,
  tooltip,
}: {
  children: ReactElement;
  tooltip: ListItemType['tooltip'];
}) => {
  if (tooltip) {
    return <Tooltip title={tooltip}>{children}</Tooltip>;
  }
  return <>{children}</>;
};

export const ListItem = ({ item, children, onSelect }: ListItemProps) => {
  const [open, setOpen] = useState(false);
  const { content, selected, icon, tooltip, button = true, appearsDisabled } = item;
  const isNested = !!item.children;

  const toggleOpen = () => {
    setOpen(!open);
  };

  const onClick = () => {
    if (isNested) {
      return toggleOpen();
    }
    return onSelect(item);
  };

  return (
    <>
      <Wrapper tooltip={tooltip}>
        <BaseListItem
          button={button}
          onClick={onClick}
          selected={selected}
          appearsDisabled={appearsDisabled}
        >
          <ButtonContainer>
            <IconWrapper>{icon}</IconWrapper>
            {content}
            {isNested && <Arrow $open={open} />}
          </ButtonContainer>
          {selected && <Check color="primary" />}
        </BaseListItem>
      </Wrapper>
      {isNested && <Collapse in={open}>{children}</Collapse>}
    </>
  );
};
