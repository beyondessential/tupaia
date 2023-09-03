import React from 'react';
import PropTypes from 'prop-types';
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
export const MultiQRCodeVisual = ({ data }) => {
  const displayData = data.slice(0, 4);
  return (
    <List>
      {displayData.map(({ name, value }) => (
        <ListItem key={value}>
          <SmallQrCodeImage qrCodeContents={value} humanReadableId={name} />
        </ListItem>
      ))}
    </List>
  );
};

MultiQRCodeVisual.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
