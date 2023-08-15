/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { List as MuiList, ListItem as MuiListItem } from '@material-ui/core';
import { QrCodeImage } from '../QrCodeImage';
import { Data } from '../../../types';

const SmallQrCodeImage = styled(QrCodeImage)`
  width: 12.5rem;
  padding: 0.5rem 0;
`;

const ListItem = styled(MuiListItem)`
  padding: 0;
`;

const List = styled(MuiList)`
  padding: 0;
`;

interface MultiQrCodesProps {
  data?: Data[];
}

export const MultiQrCodes = ({ data: options = [] }: MultiQrCodesProps) => {
  return (
    <List>
      {options.slice(0, 4).map(({ name, value }) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - ListItem doesn't accept button as false, likely something fixed in later versions
        <ListItem key={value}>
          <SmallQrCodeImage qrCodeContents={value} humanReadableId={name} />
        </ListItem>
      ))}
    </List>
  );
};
