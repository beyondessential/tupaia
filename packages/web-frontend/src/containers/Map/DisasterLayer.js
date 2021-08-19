/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { LayerGroup } from 'react-leaflet';
import { IconMarker, DEFAULT_DISASTER_COLOR } from '@tupaia/ui-components/lib/map';
import { selectDisaster } from '../../disaster/actions';
import { selectCurrentProjectCode } from '../../selectors';

const DisasterMarker = ({ onSelect, ...data }) => (
  <IconMarker
    coordinates={data.coordinates}
    icon={data.type}
    color={DEFAULT_DISASTER_COLOR}
    scale={2}
    markerRef={() => null}
    handleClick={onSelect}
  />
);

function DisasterLayer(props) {
  const { isInDisasterMode, disasters, onSelectDisaster } = props;

  if (!isInDisasterMode) return null;

  const markers = disasters.map(d => (
    <DisasterMarker key={d.id} onSelect={() => onSelectDisaster(d)} {...d} />
  ));

  return <LayerGroup>{markers}</LayerGroup>;
}

const mapStateToProps = state => ({
  disasters: Object.values(state.disaster.disasters || {}),
  isInDisasterMode: selectCurrentProjectCode(state) === 'disaster',
});

const mapDispatchToProps = dispatch => ({
  onSelectDisaster: d => dispatch(selectDisaster(d)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DisasterLayer);
