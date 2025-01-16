/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState, ReactNode } from 'react';
import { TransitionProps } from '@material-ui/core/transitions';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  ListItem as MuiListItem,
  ListItemProps as MuiListItemProps,
  Slide,
} from '@material-ui/core';
import { ArrowLeftIcon } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { ListItemType } from '../useGroupedSurveyList';
import { ROUTES } from '../../constants';

const Content = styled.div`
  flex: 1;
`;

const Arrow = styled(ArrowLeftIcon)`
  font-size: 1rem;
  color: ${({ theme }) => theme.palette.primary.main};
  transform: rotate(180deg);
`;

export const BaseListItem = styled(MuiListItem)<MuiListItemProps>`
  border-radius: 10px;
  background: white;
  padding: 1rem;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
  text-align: left;
`;

const IconWrapper = styled.div`
  padding-right: 0.5rem;
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
  const [expanded, setExpanded] = useState(false);
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
      <BaseListItem button onClick={handleOnClick}>
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
          <StickyMobileHeader onBack={onBack} onClose={onClose}>
            Select a survey
          </StickyMobileHeader>
          {children}
        </Dialog>
      )}
    </>
  );
};
