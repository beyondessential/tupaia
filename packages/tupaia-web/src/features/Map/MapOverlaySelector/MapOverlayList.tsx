/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, useState } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { TupaiaWebMapOverlaysRequest } from '@tupaia/types';
import { KeyboardArrowRight } from '@material-ui/icons';
import { ErrorBoundary } from '@tupaia/ui-components';
import { useMapOverlays } from '../../../api/queries';
import { DEFAULT_PERIOD_PARAM_STRING, URL_SEARCH_PARAMS } from '../../../constants';

const AccordionWrapper = styled(Accordion)`
  background-color: transparent;
  box-shadow: none;
  &:before {
    display: none;
  }
  &.MuiAccordion-root.Mui-expanded {
    margin: 0;
  }
`;
const AccordionHeader = styled(AccordionSummary)`
  &.MuiAccordionSummary-root {
    min-height: unset;
    padding: 0;
    flex-direction: row-reverse;
  }
  .MuiAccordionSummary-expandIcon {
    padding: 0;
    &.Mui-expanded {
      transform: rotate(90deg);
    }
  }
  .MuiAccordionSummary-content {
    margin: 0;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    font-size: 1rem;
  }
`;

const AccordionContent = styled(AccordionDetails)`
  display: flex;
  flex-direction: column;

  &.MuiAccordionDetails-root {
    padding: 0 0 1rem 2rem;
  }
  .MuiSvgIcon-root {
    width: 1.2rem;
    height: 1.2rem;
    color: white;
  }
  .MuiButtonBase-root {
    padding: 0;
    margin-right: 0.5rem;
  }
  .MuiFormControlLabel-root {
    padding: 0.4rem 0;
  }
`;

/**
 * This is a recursive component that renders a list of map overlays in an accordion
 */
const MapOverlayAccordion = ({
  mapOverlayGroup,
}: {
  mapOverlayGroup: TupaiaWebMapOverlaysRequest.TranslatedMapOverlayGroup;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <ErrorBoundary>
      <AccordionWrapper expanded={expanded} onChange={toggleExpanded} square>
        <AccordionHeader expandIcon={<KeyboardArrowRight />}>
          {mapOverlayGroup.name}
        </AccordionHeader>
        <AccordionContent>
          {/** Map through the children, and if there are more nested children, render another accordion, otherwise render radio input for the overlay */}
          {mapOverlayGroup.children.map(mapOverlay =>
            'children' in mapOverlay ? (
              <MapOverlayAccordion mapOverlayGroup={mapOverlay} key={mapOverlay.name} />
            ) : (
              <FormControlLabel
                value={mapOverlay.code}
                control={<Radio />}
                label={mapOverlay.name}
                key={mapOverlay.code}
              />
            ),
          )}
        </AccordionContent>
      </AccordionWrapper>
    </ErrorBoundary>
  );
};

const RadioGroupContainer = styled(RadioGroup)`
  // Use display block to prevent the menu buttons moving around when opening the accordion
  display: block;
`;

/**
 * This is the parent list of all the map overlays available to pick from
 */
export const MapOverlayList = () => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  const { projectCode, entityCode } = useParams();
  const { mapOverlayGroups = [], selectedOverlayCode, isLoadingMapOverlays } = useMapOverlays(
    projectCode,
    entityCode,
  );

  const onChangeMapOverlay = (e: ChangeEvent<HTMLInputElement>) => {
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, e.target.value);
    // when overlay changes, reset period to default
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    setUrlParams(urlSearchParams);
  };
  if (isLoadingMapOverlays) return null;

  return (
    <ErrorBoundary>
      <RadioGroupContainer
        aria-label="Map overlays"
        name="map-overlays"
        value={selectedOverlayCode}
        onChange={onChangeMapOverlay}
      >
        {mapOverlayGroups
          .filter(item => item.name)
          .map(group => (
            <MapOverlayAccordion mapOverlayGroup={group} key={group.name} />
          ))}
      </RadioGroupContainer>
    </ErrorBoundary>
  );
};
