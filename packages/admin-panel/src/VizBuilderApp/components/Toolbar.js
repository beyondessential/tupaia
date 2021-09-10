/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { FlexStart, FlexEnd } from '@tupaia/ui-components';
import { ExportButton } from './ExportButton';
import { SaveButton } from './SaveButton';
import { DocumentIcon } from './DocumentIcon';
import { EditModal } from './Modal';
import { useVizBuilderConfig } from '../vizBuilderConfigStore';

const Wrapper = styled.div`
  width: 100%;
  height: 100px;
  background: white;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
`;

const Container = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  padding-bottom: 15px;
`;

const SubTitle = styled(Typography)`
  font-size: 12px;
  line-height: 140%;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.3rem;
`;

const Title = styled(Typography)`
  font-size: 18px;
  line-height: 140%;
  font-weight: 400;
  margin-bottom: 0.1rem;
`;

export const Toolbar = () => {
  const [{ project, visualisation }] = useVizBuilderConfig();

  return (
    <Wrapper>
      <Container maxWidth="xl">
        <FlexStart>
          <DocumentIcon />
          <MuiBox ml={2}>
            <SubTitle variant="h4">
              Project: {project} • {visualisation.permissionGroup}
            </SubTitle>
            <Title variant="h2">{visualisation.name}</Title>
          </MuiBox>
        </FlexStart>
        <FlexEnd>
          <ExportButton />
          <EditModal />
          <SaveButton />
        </FlexEnd>
      </Container>
    </Wrapper>
  );
};
