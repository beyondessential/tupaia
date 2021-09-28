/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ZoomControl as LeafletZoomControl } from '@tupaia/ui-components/lib/map';

/**
 * Customised Leaflet Zoom Control that positions the control next to the moving side panel
 * Note: it's not possible to have a zoom control outside of the map as setting zoom on the map
 * manually creates a lag between layers when zooming
 */
export const ZoomControl = ({ sidePanelWidth }) => {
  const controlRef = useRef();

  useEffect(() => {
    const el = controlRef.current.getContainer();
    const width = sidePanelWidth + 3;
    el.style.right = `${width}px`;
  });

  return <LeafletZoomControl position="bottomright" ref={controlRef} />;
};

ZoomControl.propTypes = {
  sidePanelWidth: PropTypes.number.isRequired,
};
