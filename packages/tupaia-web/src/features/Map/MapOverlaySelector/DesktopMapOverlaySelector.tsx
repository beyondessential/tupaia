import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';
import { GRANULARITY_CONFIG, periodToMoment } from '@tupaia/utils';
import { Tooltip, IconButton, SmallAlert } from '@tupaia/ui-components';
import { LegendProps } from '@tupaia/ui-map-components';
import { ArrowDropDown, Layers, Assignment, GetApp, Close } from '@material-ui/icons';
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@material-ui/core';
import { useMapOverlayMapData, useMapContext } from '../utils';
import { Entity } from '../../../types';
import { useExportMapOverlay } from '../../../api/mutations';
import { useEntity, useMapOverlays, useProject, useUser } from '../../../api/queries';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import {
  convertDateRangeToUrlPeriodString,
  getFriendlyEntityType,
  useDateRanges,
  useGAEffect,
} from '../../../utils';
import { MapTableModal } from './MapTableModal';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';

const MapButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
  padding: 0.1rem;
  & + & {
    margin-inline-start: 0.5rem;
  }
  .MuiSvgIcon-root {
    font-size: 1.3rem;
  }
`;

const MaxHeightContainer = styled.div`
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled(MaxHeightContainer)`
  border-radius: 0.3125rem;
  flex: 1;
  max-width: 21.25rem;
  margin: 0.625rem;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: 0.8rem;
  padding-inline: 1rem;
  background-color: ${({ theme }) => theme.palette.secondary.main};
  pointer-events: auto;
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Container = styled(MaxHeightContainer)`
  border-end-end-radius: inherit;
  border-end-start-radius: inherit;
  // Set pointer events on the container rather than higher up so that it only applies to the open menu
  pointer-events: auto;
`;

const TitleWrapper = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.palette.overlaySelector.overlayNameBackground};
  // Add padding between the title and the date picker when both are present
  div + div {
    padding-block-start: 0.5rem;
  }
`;

const OverlayLibraryAccordion = styled(Accordion)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.palette.overlaySelector.menuBackground};

  &:before {
    display: none;
  }
  &.MuiAccordion-root.Mui-expanded {
    block-size: 100%;
    margin-block: 0;
    max-block-size: 100%;
    overflow: hidden; // make the accordion conform to the max-height of the parent container, regardless of how much content is present

    /* scrollable content when accordion is expanded */
    > .MuiCollapse-entered {
      overflow-y: auto;
      overflow-block: auto;
    }
  }
`;

const OverlayLibraryIcon = styled(Layers)`
  margin-inline-end: 0.5rem;
  inline-size: 1.2rem;
  .Mui-expanded & {
    fill: ${({ theme }) => theme.palette.secondary.main};
  }
`;

const OverlayLibraryTitle = styled(Typography)`
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const OverlayLibraryHeader = styled(AccordionSummary)`
  margin: 0 !important;
  min-height: unset !important;
  color: rgba(255, 255, 255, 0.6);
  .MuiAccordionSummary-content {
    margin: 0 !important;
    align-items: center;
  }

  &:hover,
  &.Mui-expanded,
  &:focus-visible {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const OverlayLibraryContentWrapper = styled(AccordionDetails)`
  padding-block: 0 1rem;
  padding-inline: 1rem;
`;

const OverlayLibraryContentContainer = styled.div`
  border-block-start: max(0.0625rem, 1px) solid oklch(1 0 0 / 12%);
  inline-size: 100%;
  padding-block-start: 1rem;
`;

const LatestDataContainer = styled.div`
  background-color: oklch(0 0 0 / 30%);
  border-radius: 0.3125rem;
  padding-block: 0.3rem 0.2rem;
  padding-inline: 0.5rem;
  margin-block-start: 0.5rem;
`;

const LatestDataText = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.3;
`;

const LoadingSpinner = styled(CircularProgress).attrs({
  size: 16,
})`
  color: ${({ theme }) => theme.palette.text.primary};
`;

const ErrorAlert = styled(SmallAlert)`
  padding-inline-end: 0.5rem;
  .MuiAlert-message {
    display: flex;
    position: relative;
    span {
      width: 85%;
    }
  }
`;

const ErrorCloseButton = styled(IconButton)`
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  padding: 0.2rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

interface DesktopMapOverlaySelectorProps {
  entityName?: Entity['name'];
  overlayLibraryOpen: boolean;
  toggleOverlayLibrary: () => void;
  hiddenValues: LegendProps['hiddenValues'];
  activeTileSet: {
    key: string;
    label: string;
    thumbnail: string;
    url: string;
  };
}

export const DesktopMapOverlaySelector = ({
  overlayLibraryOpen,
  toggleOverlayLibrary,
  hiddenValues,
  activeTileSet,
}: DesktopMapOverlaySelectorProps) => {
  const { projectCode, entityCode } = useParams();
  const { hasMapOverlays, selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);
  const { period } = useMapOverlayMapData();
  const { map } = useMapContext();
  const { isLoggedIn } = useUser();
  const exportFileName = `${project?.name}-${entity?.name}-${selectedOverlay?.code}-map-overlay-export`;
  const {
    mutate: exportMapOverlay,
    isLoading: isExporting,
    error,
    reset,
  } = useExportMapOverlay(exportFileName);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );

  const [mapModalOpen, setMapModalOpen] = useState(false);
  // This only fires when the selected overlay changes. Because this is always rendered, as is the mobile overlay selector, we only need this in one place
  useGAEffect('MapOverlays', 'Change', selectedOverlay?.name);
  const toggleMapTableModal = () => {
    setMapModalOpen(!mapModalOpen);
  };

  // Pass the explicit date range to the export function, because the server may not have the correct time zone when the default date range is used
  const getMapOverlayPeriodForExport = (): string | undefined => {
    const periodGranularity = GRANULARITY_CONFIG[
      selectedOverlay?.periodGranularity as keyof typeof GRANULARITY_CONFIG
    ]?.momentUnit as moment.unitOfTime.StartOf;
    // if the overlay has no period granularity, return undefined
    if (!periodGranularity) return undefined;
    const periodStartDate = moment(startDate).startOf(periodGranularity);
    const periodEndDate = moment(endDate).endOf(periodGranularity);
    const urlPeriodString = convertDateRangeToUrlPeriodString({
      startDate: periodStartDate,
      endDate: periodEndDate,
    });
    return urlPeriodString;
  };

  const onExportMapOverlay = () => {
    if (!map) throw new Error('Map is not ready');
    const urlPeriodString = getMapOverlayPeriodForExport();
    exportMapOverlay({
      projectCode,
      entityCode,
      mapOverlayCode: selectedOverlay?.code,
      center: map.getCenter(),
      zoom: map.getZoom(),
      hiddenValues,
      tileset: activeTileSet.url,
      mapOverlayPeriod: urlPeriodString,
    });
  };

  const friendlyEntityType = getFriendlyEntityType(entity?.type);

  return (
    <>
      {mapModalOpen && <MapTableModal onClose={toggleMapTableModal} />}
      <Wrapper>
        <Header>
          <Heading>Map overlays{friendlyEntityType && ` (${friendlyEntityType})`}</Heading>
          {selectedOverlay && (
            <div>
              {isLoggedIn && (
                <MapButton onClick={onExportMapOverlay} disabled={isExporting || !map}>
                  {isExporting ? (
                    <LoadingSpinner />
                  ) : (
                    <Tooltip
                      arrow
                      placement="top"
                      title={isExporting ? '' : 'Export map overlay as PDF'}
                    >
                      <GetApp />
                    </Tooltip>
                  )}
                </MapButton>
              )}
              <Tooltip arrow interactive placement="top" title="Generate report">
                <MapButton onClick={toggleMapTableModal}>
                  <Assignment />
                </MapButton>
              </Tooltip>
            </div>
          )}
        </Header>
        <Container>
          <TitleWrapper>
            {error && (
              <ErrorAlert severity="error">
                <span>{error.message}</span>
                <ErrorCloseButton onClick={reset} title="Clear error">
                  <Close />
                </ErrorCloseButton>
              </ErrorAlert>
            )}
            <MapOverlaySelectorTitle />
            <MapOverlayDatePicker />
          </TitleWrapper>
          {hasMapOverlays && (
            <OverlayLibraryAccordion
              expanded={overlayLibraryOpen}
              onChange={toggleOverlayLibrary}
              square
            >
              <OverlayLibraryHeader
                expandIcon={<ArrowDropDown />}
                aria-controls="overlay-library-content"
                id="overlay-library-header"
              >
                <OverlayLibraryIcon />
                <OverlayLibraryTitle>Overlay library</OverlayLibraryTitle>
              </OverlayLibraryHeader>
              <OverlayLibraryContentWrapper>
                <OverlayLibraryContentContainer>
                  {/* Use the entity code as a key so that the local state of the MapOverlayList resets between entities */}
                  <MapOverlayList key={entityCode} />
                </OverlayLibraryContentContainer>
              </OverlayLibraryContentWrapper>
            </OverlayLibraryAccordion>
          )}
          {period?.latestAvailable && (
            <LatestDataContainer>
              <LatestDataText>
                Latest overlay data: {periodToMoment(period?.latestAvailable).format('DD/MM/YYYY')}
              </LatestDataText>
            </LatestDataContainer>
          )}
        </Container>
      </Wrapper>
    </>
  );
};
