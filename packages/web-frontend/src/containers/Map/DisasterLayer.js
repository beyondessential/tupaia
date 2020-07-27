/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { connect } from 'react-redux';
import { LayerGroup } from 'react-leaflet';

import { selectDisaster } from '../../disaster/actions';
import { IconMarker } from '../../components/Marker';
import { DEFAULT_DISASTER_COLOR } from '../../components/Marker/markerColors';
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
