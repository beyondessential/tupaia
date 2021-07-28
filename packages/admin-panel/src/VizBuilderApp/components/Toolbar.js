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
import MuiBox from '@material-ui/core/Box';
import { FlexStart, FlexEnd } from '@tupaia/ui-components';
import { SaveButton } from './SaveButton';
import { ReactComponent as DocumentIcon } from './DocumentIcon.svg';
import { EditModal } from './EditModal';
import { useStore } from '../store';

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

const Description = styled(Typography)`
  font-size: 14px;
  line-height: 140%;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const Toolbar = () => {
  const [{ name, permissionGroup, summary, project }] = useStore();

  return (
    <Wrapper>
      <Container maxWidth="xl">
        <FlexStart>
          <DocumentIcon />
          <MuiBox ml={2}>
            <SubTitle variant="h4">
              Project: {project} • {permissionGroup}
            </SubTitle>
            <Title variant="h2">{name}</Title>
            <Description>{summary || 'Add summary content'}</Description>
          </MuiBox>
        </FlexStart>
        <FlexEnd>
          <IconButton>
            <GetAppIcon />
          </IconButton>
          <EditModal />
          <SaveButton />
        </FlexEnd>
      </Container>
    </Wrapper>
  );
};
