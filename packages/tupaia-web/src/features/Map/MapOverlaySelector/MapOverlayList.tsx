/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ReferenceTooltip } from '@tupaia/ui-components';
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
  display: flex;
  align-items: center;
  border-radius: 3px;

  .MuiAccordionSummary-content .MuiSvgIcon-root {
    margin: 0 0 0 0.2rem;
  }
  &:hover {
    background: rgba(153, 153, 153, 0.2);
  }
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

const Wrapper = styled.div`
  display: flex;
  align-items: center;
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

const FormLabel = styled(FormControlLabel)`
  border-radius: 3px;

  &:hover {
    background: rgba(153, 153, 153, 0.2);
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
    <AccordionWrapper expanded={expanded} onChange={toggleExpanded} square>
      <AccordionHeader expandIcon={<KeyboardArrowRight />}>
        {mapOverlayGroup.name}
        {mapOverlayGroup.info && mapOverlayGroup.info.reference && (
          <ReferenceTooltip
            reference={mapOverlayGroup.info.reference}
            iconStyleOption="mayOverlay"
          />
        )}
      </AccordionHeader>
      <AccordionContent>
        {/** Map through the children, and if there are more nested children, render another accordion, otherwise render radio input for the overlay */}
        {mapOverlayGroup.children.map(mapOverlay =>
          'children' in mapOverlay ? (
            <MapOverlayAccordion mapOverlayGroup={mapOverlay} key={mapOverlay.name} />
          ) : (
            <Wrapper>
              <FormLabel
                value={mapOverlay.code}
                control={<Radio />}
                label={mapOverlay.name}
                key={mapOverlay.code}
              />
              {mapOverlay.info && mapOverlay.info.reference && (
                <ReferenceTooltip
                  reference={mapOverlay.info.reference}
                  iconStyleOption="mayOverlay"
                />
              )}
            </Wrapper>
          ),
        )}
      </AccordionContent>
    </AccordionWrapper>
  );
};

const RadioGroupContainer = styled(RadioGroup)`
  // Use display block to prevent the menu buttons moving around when opening the accordion
  display: block;
`;

/**
 * A utility that saves selected map overlay date ranges in state, so that it can be retrieved if the user navigates back to them
 */
const useSavedMapOverlayDates = () => {
  const [datesByMapOverlay, setDatesByMapOverlay] = useState({});
  const [urlSearchParams] = useSearchParams();

  const saveMapOverlayDateRange = (code: string, dateRange: string) => {
    setDatesByMapOverlay({
      ...datesByMapOverlay,
      [code]: dateRange,
    });
  };

  const mapOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const mapOverlayPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);

  useEffect(() => {
    if (mapOverlayCode && mapOverlayPeriod) {
      saveMapOverlayDateRange(mapOverlayCode, mapOverlayPeriod);
    }
  }, [mapOverlayCode, mapOverlayPeriod]);

  const getMapOverlayDateRange = (code: string) => datesByMapOverlay[code];

  const getSavedMapOverlayDateRange = (code: string) => {
    if (code) {
      const savedDateRange = getMapOverlayDateRange(code);
      if (savedDateRange) {
        return savedDateRange;
      }
    }
    return DEFAULT_PERIOD_PARAM_STRING;
  };

  return { getSavedMapOverlayDateRange };
};

/**
 * This is the parent list of all the map overlays available to pick from
 */
export const MapOverlayList = ({ toggleOverlayLibrary }: { toggleOverlayLibrary?: Function }) => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  const { projectCode, entityCode } = useParams();
  const { getSavedMapOverlayDateRange } = useSavedMapOverlayDates();
  const { mapOverlayGroups = [], selectedOverlayCode, isLoadingMapOverlays } = useMapOverlays(
    projectCode,
    entityCode,
  );

  const onChangeMapOverlay = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedCode = e.target.value;
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, selectedCode);

    // when overlay changes, reset update the date period, using the saved date range if it exists
    const newDateRange = getSavedMapOverlayDateRange(selectedCode);
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, newDateRange);
    setUrlParams(urlSearchParams);

    if (toggleOverlayLibrary) {
      toggleOverlayLibrary();
    }
  };

  if (isLoadingMapOverlays) return null;

  return (
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
  );
};
