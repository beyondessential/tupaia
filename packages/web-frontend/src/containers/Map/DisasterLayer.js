/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { LayerGroup } from 'react-leaflet';

import { selectDisaster } from '../../disaster/actions';
import { CircleProportionMarker, IconMarker, PopupMarker } from '../../components/Marker';
import { DEFAULT_DISASTER_COLOR } from '../../components/Marker/markerColors';

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

class DisasterLayer extends Component {
  render() {
    const { isInDisasterMode, disasters, onSelectDisaster } = this.props;

    if (!isInDisasterMode) return null;

    const markers = disasters.map(d => (
      <DisasterMarker key={d.id} onSelect={() => onSelectDisaster(d)} {...d} />
    ));

    return <LayerGroup>{markers}</LayerGroup>;
  }
}

const mapStateToProps = ({ disaster, project }) => ({
  disasters: Object.values(disaster.disasters || {}),
  isInDisasterMode: project.active.code === 'disaster',
});

const mapDispatchToProps = dispatch => ({
  onSelectDisaster: d => dispatch(selectDisaster(d)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DisasterLayer);
