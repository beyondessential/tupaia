import { TransitionProps } from '@material-ui/core/transitions';
import { Skeleton } from '@material-ui/lab';
import { ChevronRight } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Dialog, ListItem as MuiListItem, Slide } from '@material-ui/core';
import { ROUTES } from '../../constants';
import { StickyMobileHeader } from '../../layout';
import { ListItemType } from '../useGroupedSurveyList';

const Content = styled.div`
  flex: 1;
`;

const Arrow = styled(ChevronRight)`
  font-size: 1rem;
  color: ${({ theme }) => theme.palette.primary.main};
`;

export const BaseListItem = styled(MuiListItem).attrs({ button: true })`
  align-items: center;
  background: white;
  border-radius: 0.625rem;
  border: max(0.0625rem, 1px) solid transparent;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem;
  text-align: start;

  & + & {
    margin-block-start: 0.75rem;
  }
`;

const IconWrapper = styled.div.attrs({
  'aria-hidden': true,
})`
  padding-inline-end: 0.5rem;
  display: flex;
  align-items: center;
  width: 2rem;
  font-size: 2rem;
  svg {
    color: ${({ theme }) => theme.palette.primary.main};
    height: auto;
  }
`;

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

interface ListItemProps {
  item: ListItemType;
  onSelect: (item: any) => void;
  children?: ReactNode;
}

export const ListItem = ({ item, onSelect, children }: ListItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { content, icon } = item;
  const isNested = !!item.children;
  const navigate = useNavigate();

  const onBack = () => setExpanded(false);

  const onClose = () => {
    navigate(ROUTES.HOME);
  };

  const handleOnClick = () => {
    if (children) {
      setExpanded(true);
    } else {
      onSelect(item);
    }
  };

  return (
    <>
      <BaseListItem onClick={handleOnClick}>
        <IconWrapper>{icon}</IconWrapper>
        <Content>{content}</Content>
        {isNested && <Arrow />}
      </BaseListItem>
      {children && (
        <Dialog
          open={expanded}
          TransitionComponent={Transition}
          keepMounted={false}
          onClose={onClose}
          fullScreen
        >
          <StickyMobileHeader onBack={onBack}>Select a survey</StickyMobileHeader>
          {children}
        </Dialog>
      )}
    </>
  );
};

export const ListItemSkeleton = styled(Skeleton).attrs({
  component: 'div',
  variant: 'rect',
})`
  border-radius: 0.625rem;
  min-block-size: 3.5rem;

  & + & {
    margin-block-start: 0.75rem;
  }
`;
