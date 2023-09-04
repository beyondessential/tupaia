/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { QrCodeVisual } from '../src/components';

export default {
  title: 'QrCodeVisual',
  component: QrCodeVisual,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const noData = () => (
  <Container>
    <QrCodeVisual
      data={[]}
      downloadImages={() => {}}
      config={{
        type: 'qrCode',
      }}
      isLoading={false}
      onClose={() => {}}
      className="qr-code-visual"
      error={null}
    />
  </Container>
);

export const error = () => (
  <Container>
    <QrCodeVisual
      data={[
        {
          name: 'item 1',
          value: 'item1',
        },
      ]}
      downloadImages={() => {}}
      config={{
        type: 'qrCode',
      }}
      isLoading={false}
      onClose={() => {}}
      className="qr-code-visual"
      error={'some error'}
    />
  </Container>
);

export const singleQrCode = () => (
  <Container>
    <QrCodeVisual
      data={[
        {
          name: 'item 1',
          value: 'item1',
        },
      ]}
      downloadImages={() => {}}
      config={{
        type: 'qrCode',
      }}
      isLoading={false}
      onClose={() => {}}
      className="qr-code-visual"
      error={null}
    />
  </Container>
);

export const multiQrCode = () => (
  <Container>
    <QrCodeVisual
      data={[
        {
          name: 'item 1',
          value: 'item1',
        },
        {
          name: 'item 2',
          value: 'item2',
        },
        {
          name: 'item 3',
          value: 'item3',
        },
      ]}
      downloadImages={() => {}}
      config={{
        type: 'qrCode',
      }}
      isLoading={false}
      onClose={() => {}}
      className="qr-code-visual"
      error={null}
    />
  </Container>
);
