import React, { ReactElement, ReactNode, useState } from 'react';
import styled from 'styled-components';
import {
  Collapse,
  ListItem as MuiListItem,
  ListItemProps as MuiListItemProps,
} from '@material-ui/core';
import { Check, KeyboardArrowRight } from '@material-ui/icons';
import { Tooltip } from '../Tooltip';
import { ListItemType } from './types';

// explicitly set the types so that the overrides are applied, for the `button` prop
export const BaseListItem = styled(MuiListItem)<MuiListItemProps>`
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 3px;
  padding: 0.3rem 1rem 0.3rem 0.5rem;
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
      background-color: ${({ theme }) =>
        theme.palette.type === 'light'
          ? `${theme.palette.primary.main}33`
          : 'rgba(96, 99, 104, 0.50)'};
    }
  }
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
  &.Mui-disabled {
    opacity: 1; // still have the icon as the full opacity
    color: ${({ theme }) => theme.palette.text.disabled};
  }
  .text-secondary {
    color: ${({ theme }) => theme.palette.text.secondary};
    margin-left: 0.4em;
  }
`;

const Arrow = styled(KeyboardArrowRight)<{
  $open?: boolean;
}>`
  transform: ${({ $open }) => ($open ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.1s ease-in-out;
`;

const ButtonContainer = styled.div<{
  $fullWidth?: boolean;
}>`
  display: flex;
  align-items: center;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const IconWrapper = styled.div`
  padding-right: 0.5rem;
  display: flex;
  align-items: center;
  width: 1.5rem;
  svg {
    color: ${({ theme }) => theme.palette.primary.main};
    height: auto;
  }
`;

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
    return (
      <Tooltip title={tooltip} enterDelay={1000}>
        {children}
      </Tooltip>
    );
  }
  return <>{children}</>;
};

export const ListItem = ({ item, children, onSelect }: ListItemProps) => {
  const [open, setOpen] = useState(false);
  const { content, selected, icon, tooltip, button = true, disabled } = item;
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
    <li>
      {/*@ts-ignore*/}
      <BaseListItem
        button={button}
        onClick={button ? onClick : null}
        selected={selected}
        disabled={disabled}
      >
        <Wrapper tooltip={tooltip}>
          <ButtonContainer $fullWidth={button}>
            <IconWrapper>{icon}</IconWrapper>
            {content}
            {isNested && <Arrow $open={open} />}
          </ButtonContainer>
        </Wrapper>
        {selected && <Check color="primary" />}
      </BaseListItem>
      {isNested && <Collapse in={open}>{children}</Collapse>}
    </li>
  );
};
