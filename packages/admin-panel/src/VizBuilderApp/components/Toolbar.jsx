import React from 'react';
import MuiContainer from '@material-ui/core/Container';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { FlexEnd, FlexSpaceBetween, FlexStart } from '@tupaia/ui-components';
import { ExportButton } from './ExportButton';
import { SaveButton } from './SaveButton';
import { DocumentIcon } from './DocumentIcon';
import { EditModal } from './Modal';
import { useVizConfigContext } from '../context';
import { DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM } from '../constants';

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

const ButtonContainer = styled(FlexSpaceBetween)`
  .MuiButton-root {
    margin-left: 8px;
    margin-right: 8px;
  }
`;

export const Toolbar = () => {
  const [{ project, visualisation }] = useVizConfigContext();
  const { dashboardItemOrMapOverlay } = useParams();

  const permissionGroup = visualisation.permissionGroup ?? visualisation.mapOverlayPermissionGroup;
  const name =
    dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM
      ? visualisation.presentation?.name
      : visualisation.name;

  return (
    <Wrapper>
      <Container maxWidth="xl">
        <FlexStart>
          <DocumentIcon />
          <MuiBox ml={2}>
            <SubTitle variant="h4">
              Project: {project?.['project.code']} • {permissionGroup}
            </SubTitle>
            <Title variant="h2">{name}</Title>
          </MuiBox>
        </FlexStart>
        <FlexEnd>
          <ButtonContainer>
            <ExportButton />
            <EditModal />
            <SaveButton />
          </ButtonContainer>
        </FlexEnd>
      </Container>
    </Wrapper>
  );
};
