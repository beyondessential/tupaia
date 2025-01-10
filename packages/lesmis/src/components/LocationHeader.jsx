import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiToggleButton from '@material-ui/lab/ToggleButton';
import MuiToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import MuiContainer from '@material-ui/core/Container';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { GetApp, Phone, Email, Map, Dashboard } from '@material-ui/icons';
import ButtonComponent from '@material-ui/core/Button';
import { Tooltip } from '@tupaia/ui-components';
import { FlexStart, FlexEnd } from './Layout';
import { useEntityData, useMapOverlayReportData } from '../api';
import {
  I18n,
  useUrlParams,
  makeEntityLink,
  useUrlSearchParam,
  useDashboardDropdownOptions,
} from '../utils';
import { MapTableModal } from './MapTableModal';
import { DEFAULT_DATA_YEAR } from '../constants';

const Wrapper = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Container = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 800px) {
    flex-direction: column;
    align-items: flex-start;
  }
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

const Contacts = styled(FlexStart)`
  @media screen and (max-width: 800px) {
    flex-direction: column;
    align-items: flex-start;
  }
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

const getExportTitle = (entityData, currentMapOverlay) => {
  const name = entityData?.name ? entityData?.name : '';
  const overlayName = currentMapOverlay ? `, ${currentMapOverlay}` : '';
  return `${name}${overlayName}`;
};

export const LocationHeader = ({ setIsOpen }) => {
  const { entityCode, view } = useUrlParams();
  const { search } = useLocation();
  const [selectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);
  const { data: overlayReportData, selectedOverlayName } = useMapOverlayReportData({
    entityCode,
    year: selectedYear,
  });

  const { data: entityData } = useEntityData(entityCode);
  const exportTitle = getExportTitle(entityData, selectedOverlayName);
  const { selectedOption } = useDashboardDropdownOptions();
  const isExportable = selectedOption.exportToPDF;

  return (
    <Wrapper>
      <Container maxWidth="xl">
        <div>
          <Heading variant="h2">{entityData?.name}</Heading>
          <Contacts>
            <ContactItem>
              <Phone />
              <Typography>TBC</Typography>
            </ContactItem>
            <ContactItem>
              <Email />
              <Typography>TBC@laopdr.com</Typography>
            </ContactItem>
          </Contacts>
        </div>
        <FlexEnd>
          <FlexStart>
            {/* Todo: add exports @see */}
            {/* https://app.zenhub.com/workspaces/active-sprints-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/2511 */}
            {view === 'map' ? (
              <MapTableModal
                title={exportTitle}
                overlayReportData={overlayReportData}
                Button={props => (
                  <IconButton {...props} startIcon={<AssignmentIcon />}>
                    <I18n t="dashboards.export" />
                  </IconButton>
                )}
              />
            ) : (
              <Tooltip title={isExportable ? '' : <I18n t="dashboards.notExportable" />}>
                <span>
                  <IconButton
                    disabled={!isExportable}
                    onClick={() => setIsOpen(true)}
                    startIcon={<GetApp />}
                  >
                    <I18n t="dashboards.export" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {/* Todo: add favourites @see https://app.zenhub.com/workspaces/active-sprints-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/2493 */}
            {/* <IconButton startIcon={<StarBorder />}>Add</IconButton> */}
          </FlexStart>
          <ToggleButtonGroup value={view} aria-label="page layout" exclusive>
            <ToggleButton
              value="dashboard"
              component={Link}
              to={`${makeEntityLink(entityCode, 'dashboard')}${search}`}
              aria-label="dashboard"
            >
              <Dashboard /> <I18n t="dashboards.dashboard" />
            </ToggleButton>
            <ToggleButton
              value="map"
              component={Link}
              to={`${makeEntityLink(entityCode, 'map')}${search}`}
              aria-label="map"
            >
              <Map /> <I18n t="dashboards.map" />
            </ToggleButton>
          </ToggleButtonGroup>
        </FlexEnd>
      </Container>
    </Wrapper>
  );
};

LocationHeader.propTypes = {
  setIsOpen: PropTypes.func.isRequired,
};
