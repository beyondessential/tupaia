/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LayerGroup, IconMarker, DEFAULT_DISASTER_COLOR } from '@tupaia/ui-components/lib/map';
import { selectDisaster } from '../../disaster/actions';
import { selectCurrentProjectCode } from '../../selectors';

const Layer = ({ isInDisasterMode, disasters, onSelectDisaster }) => {
  if (!isInDisasterMode) return null;

  return (
    <LayerGroup>
      {disasters.map(data => (
        <IconMarker
          key={data.id}
          coordinates={data.coordinates}
          icon={data.type}
          color={DEFAULT_DISASTER_COLOR}
          scale={2}
          markerRef={() => null}
          handleClick={() => {
            onSelectDisaster(data);
          }}
        />
      ))}
    </LayerGroup>
  );
};

Layer.propTypes = {
  isInDisasterMode: PropTypes.bool,
  disasters: PropTypes.array,
  onSelectDisaster: PropTypes.func,
};

Layer.defaultProps = {
  isInDisasterMode: false,
  disasters: [],
  onSelectDisaster: () => {},
};

const mapStateToProps = state => ({
  disasters: Object.values(state.disaster.disasters || {}),
  isInDisasterMode: selectCurrentProjectCode(state) === 'disaster',
});

const mapDispatchToProps = dispatch => ({
  onSelectDisaster: d => dispatch(selectDisaster(d)),
});

export const DisasterLayer = connect(mapStateToProps, mapDispatchToProps)(Layer);
