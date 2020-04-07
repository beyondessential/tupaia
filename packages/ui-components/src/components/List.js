/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiList from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import MuiListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider'
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';

function MuiListItemLink(props) {
  return <MuiListItem button component="a" {...props} />;
}

export const List = () => {
  return (
    <div>
      <MuiList>
        <MuiListItem>
          <p>This is the list item</p>
        </MuiListItem>
        <Divider variant="middle" component="li" />
        <MuiListItem>
          <MuiListItemText primary="Trash" />
        </MuiListItem>
        <Divider variant="middle" component="li" />
        <MuiListItemLink href="#simple-list">
          <MuiListItemText primary="Spam" />
        </MuiListItemLink>
      </MuiList>
    </div>
  );
};