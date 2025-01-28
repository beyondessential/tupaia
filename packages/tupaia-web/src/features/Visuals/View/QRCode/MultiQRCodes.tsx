import React from 'react';
import { ViewReport } from '@tupaia/types';
import styled from 'styled-components';
import { List as MuiList, ListItem as MuiListItem } from '@material-ui/core';
import { QrCodeImage } from '@tupaia/ui-components';

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

interface MultiQRCodesProps {
  data: ViewReport['data'];
}

export const MultiQRCodes = ({ data }: MultiQRCodesProps) => {
  if (!data) return null;
  const displayData = data.slice(0, 4);
  return (
    <List>
      {displayData.map(({ name, value }) => (
        // @ts-ignore - ListItem doesn't accept button as false, likely something fixed in later versions
        <ListItem key={value}>
          <SmallQrCodeImage qrCodeContents={value as string} humanReadableId={name} />
        </ListItem>
      ))}
    </List>
  );
};
