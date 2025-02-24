import {
  Collapse,
  ListItem as MuiListItem,
  ListItemProps as MuiListItemProps,
} from '@material-ui/core';
import { Check, KeyboardArrowRight } from '@material-ui/icons';
import React, { ReactElement, ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';

import { Tooltip } from '../Tooltip';
import { ListItemType } from './types';

// explicitly set the types so that the overrides are applied, for the `button` prop
export const BaseListItem = styled(MuiListItem)<MuiListItemProps>`
  align-items: center;
  border-radius: 3px;
  border: max(0.0625rem, 1px) solid transparent;
  display: flex;
  padding-block: 0.3rem;
  padding-inline: 0.5rem 1rem;

  &.Mui-selected {
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: transparent;
  }

  .MuiCollapse-container & {
    padding-inline-start: 1rem;
  }

  &.MuiButtonBase-root:is(
      :hover,
      :focus-visible,
      .Mui-selected:hover,
      .Mui-selected:focus-visible
    ) {
    ${props => {
      const { palette } = props.theme;
      return palette.type === 'light'
        ? css`
            background-color: oklch(from ${palette.primary.main} l c h / 10%);
            @supports not (color: oklch(from black l c h)) {
              background-color: ${palette.primary.main}1a;
            }
          `
        : css`
            background-color: oklch(50% 0.0088 260.73 / 50%);
          `;
    }}

    ${({ theme }) => theme.breakpoints.up('sm')} {
      background-color: initial;
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
    margin-inline-start: 0.4em;
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
  --icon-width: 1.5rem;
  align-items: center;
  display: flex;
  inline-size: var(--icon-width);
  justify-content: center;
  padding-inline-end: 0.5rem;

  svg {
    block-size: auto;
    color: ${({ theme }) => theme.palette.primary.main};
    max-inline-size: var(--icon-width);
  }

  ${({ theme }) => theme.breakpoints.down('sm')} {
    --icon-width: 1.3rem;
  }
`;

const CheckIcon = styled(Check).attrs({ color: 'primary' })`
  &.MuiSvgIcon-root {
    font-size: 1.2rem;
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
        component="div"
      >
        <Wrapper tooltip={tooltip}>
          <ButtonContainer $fullWidth={button}>
            <IconWrapper>{icon}</IconWrapper>
            {content}
            {isNested && <Arrow $open={open} />}
          </ButtonContainer>
        </Wrapper>
        {selected && <CheckIcon />}
      </BaseListItem>
      {isNested && <Collapse in={open}>{children}</Collapse>}
    </li>
  );
};
