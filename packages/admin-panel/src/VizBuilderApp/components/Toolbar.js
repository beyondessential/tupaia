/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import GetAppIcon from '@material-ui/icons/GetApp';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { Button, FlexStart, FlexEnd } from '@tupaia/ui-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100px;
  background: white;
`;

const Container = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  padding-bottom: 15px;
`;

const StyledImg = styled.img`
  height: 70px;
  width: auto;
  margin-right: 10px;
`;

export const Toolbar = () => {
  return (
    <Wrapper>
      <Container>
        <FlexStart>
          <StyledImg src="/document-icon.svg" alt="document-icon" />
          <div>
            <Typography variant="h6">Project: COVID-19 Samoa • Immunization Module</Typography>
            <Typography variant="h6">PSSS Weekly Influence-like Illness Cases</Typography>
            <Typography variant="h6">Add summary content</Typography>
          </div>
        </FlexStart>
        <FlexEnd>
          <IconButton>
            <GetAppIcon />
          </IconButton>
          <Button>Save</Button>
        </FlexEnd>
      </Container>
    </Wrapper>
  );
};
