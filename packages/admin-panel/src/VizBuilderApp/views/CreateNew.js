/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { Button, FlexEnd } from '@tupaia/ui-components';
import { DashboardMetadataForm } from '../components';
import { VIZ_TYPE_PARAM } from '../constants';
import { MapOverlayMetadataForm } from '../components/MapOverlay';

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5%;
  padding-bottom: 10%;
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  width: 560px;
  max-width: 100%;
`;

const Header = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 20px;
  line-height: 23px;
`;

const Body = styled.div`
  padding: 30px 30px 40px 30px;
`;

const Footer = styled(FlexEnd)`
  padding: 15px 30px;
  border-top: 1px solid ${({ theme }) => theme.palette.grey['400']};
`;

const getMetadataFormComponent = vizType => {
  if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM) return DashboardMetadataForm;
  if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY) return MapOverlayMetadataForm;
  throw new Error(`Unknown viz type ${vizType}`);
};

export const CreateNew = () => {
  const { vizType } = useParams();

  const history = useHistory();

  const handleCreate = () => {
    history.push(`/viz-builder/${vizType}/`);
  };

  const MetadataFormComponent = getMetadataFormComponent(vizType);

  return (
    <Container>
      <Card>
        <MetadataFormComponent
          onSubmit={handleCreate}
          Header={() => (
            <Header>
              <Heading>Create new Visualisation</Heading>
            </Header>
          )}
          Body={Body}
          Footer={() => (
            <Footer>
              <Button type="submit">Create</Button>
            </Footer>
          )}
        />
      </Card>
    </Container>
  );
};
