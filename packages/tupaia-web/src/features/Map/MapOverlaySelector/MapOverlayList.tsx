/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useParams } from 'react-router';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { KeyboardArrowRight } from '@material-ui/icons';
import styled from 'styled-components';
import { MapOverlayGroup } from '../../../types';
import { useMapOverlays } from '../../../api/queries';
import { updateSelectedMapOverlay } from '../../../utils';

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
    padding: 0rem;
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
const MapOverlayAccordion = ({ mapOverlayGroup }: { mapOverlayGroup: MapOverlayGroup }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <AccordionWrapper expanded={expanded} onChange={toggleExpanded} square>
      <AccordionHeader expandIcon={<KeyboardArrowRight />}>{mapOverlayGroup.name}</AccordionHeader>
      <AccordionContent>
        {/** Map through the children, and if there are more nested children, render another accordion, otherwise render radio input for the overlay */}
        {mapOverlayGroup.children.map(mapOverlay =>
          mapOverlay.children ? (
            <MapOverlayAccordion mapOverlayGroup={mapOverlay} key={mapOverlay.name} />
          ) : (
            <FormControlLabel value={mapOverlay.code} control={<Radio />} label={mapOverlay.name} />
          ),
        )}
      </AccordionContent>
    </AccordionWrapper>
  );
};

/**
 * This is the parent list of all the map overlays available to pick from
 */
export const MapOverlayList = () => {
  const { projectCode, entityCode } = useParams();
  const { mapOverlayGroups, selectedOverlayCode } = useMapOverlays(projectCode, entityCode);

  return (
    <RadioGroup
      aria-label="Map overlays"
      name="map-overlays"
      value={selectedOverlayCode}
      onChange={updateSelectedMapOverlay}
    >
      {mapOverlayGroups
        .filter(item => item.name)
        .map(group => (
          <MapOverlayAccordion mapOverlayGroup={group} key={group.name} />
        ))}
    </RadioGroup>
  );
};
