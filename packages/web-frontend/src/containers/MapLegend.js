/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Legend } from '@tupaia/ui-components/lib/map';
import { connect } from 'react-redux';

export const LegendComponent = ({ setValueHidden, hiddenValues, serieses }) => {
  return (
    <Legend
      setValueHidden={setValueHidden}
      hiddenValues={hiddenValues}
      serieses={serieses || null}
    />
  );
};

const mapStateToProps = () => state => ({
  hiddenValues: state.map.measureInfo.hiddenMeasures,
  serieses: state.map.measureInfo.measureOptions,
});

const mapDispatchToProps = () => dispatch => ({
  setValueHidden: (key, value, hide) => {
    return dispatch({
      key,
      value,
      type: hide ? 'HIDE_MAP_MEASURE' : 'UNHIDE_MAP_MEASURE',
    });
  },
});

export const MapLegend = connect(mapStateToProps, mapDispatchToProps)(LegendComponent);
