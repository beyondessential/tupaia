import React, { Children, ReactNode, isValidElement, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  List,
  ListItem,
  ListItemProps,
  ListItemText,
  SelectProps,
} from '@material-ui/core';
import Chevron from '@material-ui/icons/ChevronRightRounded';

import { StickyMobileHeader } from '../layout';

const Picture = styled.picture`
  object-fit: contain;
  aspect-ratio: 1;
`;
const Img = styled.img`
  block-size: 1em;
  inline-size: auto;
`;
const Pin = () => (
  <Picture>
    <source srcSet="/tupaia-pin.svg" />
    <Img src="/tupaia-pin.svg" width={24} height={24} />
  </Picture>
);

const StyledButton = styled(Button).attrs({
  disableElevation: true,
  fullWidth: true,
  startIcon: <Pin />,
  endIcon: <Chevron />,
  size: 'large',
})`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  border-block-end: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  border-radius: 0.625rem 0.625rem 0 0;
  font-weight: 500;
  gap: 0.5rem;
  letter-spacing: 0.02em;
  margin-block-end: 1rem;
  text-align: start;

  .MuiButton-label {
    display: contents;
  }
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.palette.background.default};
  block-size: 100vb;
  display: grid;
  grid-template-rows: auto 1rem;
  inline-size: 100vi;
  // inset-block-end: 0;
  inset-block-start: 0;
  // inset-inline-end: 0;
  inset-inline-start: 0;
  position: fixed;
  z-index: 9999;
`;

const Header = styled(StickyMobileHeader)`
  position: initial;
  inset-block-start: initial;
  inset-inline-start: initial;
  z-index: initial;
`;

const StyledList = styled(List).attrs({ disablePadding: true, role: 'list' })`
  overflow-y: auto;
`;

interface SelectOption {
  label: ReactNode;
  value: number;
}

type SelectItemProps = SelectOption & ListItemProps;
const SelectItem = ({ label, value, ...listItemProps }: SelectItemProps) => (
  <ListItem {...listItemProps}>
    <ListItemText primary={label} />
  </ListItem>
);

type FullScreenSelectProps = Pick<
  SelectProps,
  | 'children'
  | 'className'
  | 'defaultValue'
  | 'id'
  | 'label'
  | 'onChange'
  | 'onClose'
  | 'onOpen'
  | 'open'
  | 'value'
>;
export const FullScreenSelect = ({
  children,
  defaultValue,
  label = 'Select an option',
  value,
}: FullScreenSelectProps) => {
  const [selectedItem, setSelectedItem] = useState(value !== null ? value : defaultValue);
  useEffect(() => setSelectedItem(value), [value]);

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const options: SelectOption[] = [];
  const otherChildren: unknown[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === 'option') {
      options.push({
        label: child.props.children,
        value: child.props.value,
      });
      return;
    }

    otherChildren.push(child);
  });

  const selectedItemLabel = options.find(option => option.value === value)?.label ?? label;

  return (
    <>
      <StyledButton onClick={openModal}>{selectedItemLabel}</StyledButton>
      {isOpen && (
        <Modal>
          <Header onBack={closeModal} onClose={closeModal}>
            {label}
          </Header>
          <StyledList>
            {options.map(option => (
              <SelectItem key={option.value} selected={option.value === selectedItem} {...option} />
            ))}
            {otherChildren}
          </StyledList>
        </Modal>
      )}
    </>
  );
};
