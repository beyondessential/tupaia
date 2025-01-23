import React, {
  ChangeEvent,
  Children,
  Fragment,
  ReactElement,
  ReactNode,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemProps,
  ListItemText,
  SelectProps,
  Slide,
  useTheme,
} from '@material-ui/core';
import ChevronIcon from '@material-ui/icons/ChevronRightRounded';
import CheckIcon from '@material-ui/icons/CheckRounded';
import { TransitionProps } from '@material-ui/core/transitions';

import { StickyMobileHeader } from '../layout';
import { DialogContent } from '@tupaia/ui-components';

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
  endIcon: <ChevronIcon />,
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

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: ReactElement }, ref: React.Ref<unknown>) => (
    <Slide direction="left" ref={ref} {...props} />
  ),
);

const Modal = styled(Dialog).attrs({
  PaperComponent: Fragment, // Extra wrapper is semantically meaningless, interferes with layout
  TransitionComponent: Transition,
  disableElevation: true,
  fullScreen: true,
  mountOnEnter: true,
  unmountOnExit: true,
})`
  .MuiDialog-container {
    background-color: ${({ theme }) => theme.palette.background.default};
    display: grid;
    grid-template-rows: auto 1fr;
  }
  .MuiDialog-scrollPaper {
    justify-content: initial;
    align-items: initial;
  }
`;

const StyledDialogTitle = styled(DialogTitle).attrs({ disableTypography: true })`
  display: contents;
  padding: 0;
`;
const StyledDialogContent = styled(DialogContent).attrs({ dividers: true })`
  overflow-y: auto;
  padding-block-end: env(safe-area-inset-bottom, 0);
  padding-block-start: 0;
  padding-inline: 0;
`;

const Header = styled(StickyMobileHeader)`
  inset-block-start: initial;
  inset-inline-start: initial;
  position: initial;
  z-index: initial;
`;

const StyledList = styled(List).attrs({
  disablePadding: true,
  role: 'radiogroup',
})`
  & + * {
    margin-block-start: 1.5rem;
  }
`;
const StyledListItem = styled(ListItem).attrs({
  button: true,
  divider: true,
  role: 'radio',
})`
  background-color: ${({ theme }) => theme.palette.background.paper};
  display: grid;
  grid-template-columns: 1fr minmax(1.5rem, auto);
  grid-template-rows: minmax(1.5rem, auto);
  padding-block: 0.75rem;
  padding-left: max(env(safe-area-inset-left, 0), 1.5rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.5rem);

  &.MuiListItem-root.Mui-selected,
  &.MuiListItem-root.Mui-selected:hover {
    background-color: revert;
  }
`;
const StyledListItemText = styled(ListItemText).attrs({ disableTypography: true })`
  display: contents;
`;

interface SelectOption {
  label: ReactNode;
  value: string;
}

type SelectItemProps = SelectOption & ListItemProps;
const SelectItem = ({ label, selected, value, ...listItemProps }: SelectItemProps) => (
  <StyledListItem {...listItemProps}>
    <StyledListItemText primary={label} />
    {selected && <CheckIcon htmlColor={useTheme().palette.primary.main} width={24} height={24} />}
  </StyledListItem>
);

type FullScreenSelectProps = Pick<
  SelectProps,
  'children' | 'className' | 'id' | 'label' | 'onClose' | 'onOpen' | 'open'
> & {
  defaultValue?: string | number | null;
  onChange?: (
    event: ChangeEvent<{ name?: string | undefined; value: string | number | null }>,
  ) => void;
  value?: string | number | null;
};

export const FullScreenSelect = ({
  children,
  defaultValue,
  label = 'Select an option',
  onChange,
  onClose,
  value,
}: FullScreenSelectProps) => {
  const [selectedItem, setSelectedItem] = useState<typeof value>(
    value !== null ? value : defaultValue,
  );
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
        value: child.props.value ?? (child.props.children as string),
      });
      return;
    }

    otherChildren.push(child);
  });

  const selectedItemLabel = options.find(option => option.value === value)?.label ?? label;
  const listContents = options.map(option => {
    const selected = option.value === selectedItem;

    return (
      <SelectItem
        aria-selected={selected}
        key={option.value}
        onClick={e => {
          onChange?.({ ...e, target: { value: option.value } });
          closeModal();
        }}
        selected={selected}
        {...option}
      />
    );
  });

  return (
    <>
      <StyledButton onClick={openModal}>{selectedItemLabel}</StyledButton>
      <Modal open={isOpen} onClose={onClose}>
        <StyledDialogTitle>
          <Header onBack={closeModal} onClose={closeModal}>
            {label}
          </Header>
        </StyledDialogTitle>
        <StyledDialogContent>
          <StyledList>{listContents}</StyledList>
          {otherChildren}
        </StyledDialogContent>
      </Modal>
    </>
  );
};
