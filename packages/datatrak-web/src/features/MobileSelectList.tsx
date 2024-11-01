/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Dialog, List as MuiList, Typography, Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions';
import { ListItem } from './ListItem';
import { StickyMobileHeader } from '../layout';

type ListItemType = Record<string, string>;

const Container = styled.div``;

const BaseList = styled(MuiList)`
  padding: 0;
`;

const NoResultsMessage = styled(Typography)`
  padding: 0.8rem 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

interface SelectListProps {
  items?: ListItemType[];
  onSelect: (item: ListItemType) => void;
}

/**
 * Taken from [Material UI's example](https://v4.mui.com/components/dialogs/#full-screen-dialogs) to make the dialog slide up from the bottom
 */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const List = ({ items, onSelect, onClose, expanded }) => {
  const [childExpanded, setChildExpanded] = React.useState(false);
  const onChildClose = () => setChildExpanded(false);
  const onOpen = () => setChildExpanded(true);
  return (
    <Dialog
      open={expanded}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      fullScreen
    >
      <StickyMobileHeader onBack={onClose} onClose={onClose} title="Select a survey" />
      <BaseList>
        {items?.map(item => (
          <ListItem item={item} onClick={!!item.children ? onOpen : onSelect} key={item.value}>
            {item?.children && (
              <List
                items={item.children}
                onSelect={onSelect}
                onClose={onChildClose}
                expanded={childExpanded}
              />
            )}
          </ListItem>
        ))}
      </BaseList>
    </Dialog>
  );
};

export const MobileSelectList = ({ items = [], onSelect }: SelectListProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const onClose = () => setExpanded(false);
  const onOpen = () => setExpanded(true);

  return (
    <Container>
      {items.length === 0 ? (
        <NoResultsMessage>No items to display</NoResultsMessage>
      ) : (
        <BaseList>
          {items?.map(item => (
            <ListItem item={item} onClick={!!item.children ? onOpen : onSelect} key={item.value}>
              {item?.children && (
                <List
                  items={item.children}
                  onSelect={onSelect}
                  expanded={expanded}
                  onClose={onClose}
                />
              )}
            </ListItem>
          ))}
        </BaseList>
      )}
    </Container>
  );
};
