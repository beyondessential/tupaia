/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { Prompt } from 'react-router-dom';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { FlexColumn } from '@tupaia/ui-components';
import { Toolbar } from '../components';

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  align-items: stretch;
`;

const RightCol = styled(FlexColumn)`
  padding-left: 30px;
  flex: 1;
`;

// Todo: add https://github.com/jacobbuck/react-beforeunload#readme
export const Main = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <>
      <Toolbar />
      <Container maxWidth="xl">
        {/*<Panel setEnabled={setEnabled} />*/}
        <RightCol>
          {/*<PreviewOptions />*/}
          {/*<PreviewSection enabled={enabled} setEnabled={setEnabled} />*/}
        </RightCol>
      </Container>
      <Prompt message="Are you sure you want to exit the Viz Builder? Your options will not be saved so make sure you have exported your configuration." />
    </>
  );
};
