/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { generatePath, Link } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiToggleButton from '@material-ui/lab/ToggleButton';
import MuiToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import MuiContainer from '@material-ui/core/Container';
import { StarBorder, GetApp, Phone, Email, Map, Dashboard } from '@material-ui/icons';
import ButtonComponent from '@material-ui/core/Button';
import { FlexStart, FlexEnd } from './Layout';
import { useOrgUnitData } from '../api/queries';
import { useUrlParams } from '../utils';

const Wrapper = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Container = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Heading = styled(Typography)`
  text-transform: capitalize;
  margin-bottom: 0.4rem;
`;

const IconButton = styled(ButtonComponent)`
  font-size: 0.75rem;
  line-height: 0.875rem;
  font-weight: 500;
  margin-right: 0.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const ContactItem = styled(FlexStart)`
  margin-right: 1.8rem;

  .MuiSvgIcon-root {
    font-size: 1.2rem;
    color: ${props => props.theme.palette.text.tertiary};
    margin-right: 0.5rem;
  }
`;

const ToggleButtonGroup = styled(MuiToggleButtonGroup)`
  margin-left: 0.5rem;
`;

const ToggleButton = styled(MuiToggleButton)`
  border-radius: 1.5rem;
  padding: 0.625rem 1.25rem;
  min-width: 8.75rem;

  &:hover {
    background: none;
  }

  .MuiSvgIcon-root {
    margin-right: 0.5rem;
  }

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.main};
    border: 1px solid ${props => props.theme.palette.primary.light};
    background: none;

    &:hover {
      background: none;
    }
  }
`;

export const LocationHeader = () => {
  const { organisationUnitCode, view } = useUrlParams();
  const { data: orgUnitData } = useOrgUnitData({
    organisationUnitCode,
  });

  const makeLink = newView =>
    generatePath('/:organisationUnitCode/:view', {
      organisationUnitCode,
      view: newView,
    });

  return (
    <Wrapper>
      <Container maxWidth={false}>
        <div>
          <Heading variant="h2">{orgUnitData?.name}</Heading>
          <FlexStart>
            <ContactItem>
              <Phone />
              <Typography>0457 0547 074</Typography>
            </ContactItem>
            <ContactItem>
              <Email />
              <Typography>mayparkngumsecondaryschool@laopdr.com</Typography>
            </ContactItem>
          </FlexStart>
        </div>
        <FlexEnd>
          <FlexStart>
            <IconButton startIcon={<GetApp />}>Export</IconButton>
            <IconButton startIcon={<StarBorder />}>Add</IconButton>
          </FlexStart>
          <ToggleButtonGroup value={view} aria-label="page layout" exclusive>
            <ToggleButton
              value="dashboard"
              component={Link}
              to={makeLink('dashboard')}
              aria-label="dashboard"
            >
              <Dashboard /> Dashboard
            </ToggleButton>
            <ToggleButton value="map" component={Link} to={makeLink('map')} aria-label="map">
              <Map /> Map
            </ToggleButton>
          </ToggleButtonGroup>
        </FlexEnd>
      </Container>
    </Wrapper>
  );
};
