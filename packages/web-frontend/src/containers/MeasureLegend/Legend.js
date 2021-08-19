/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Legend as MapLegend } from '@tupaia/ui-components/lib/map';
import React from 'react';
import { connect } from 'react-redux';

export const LegendComponent = ({ setValueHidden, hiddenValues, serieses }) => {
  return (
    <MapLegend
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

export const Legend = connect(mapStateToProps, mapDispatchToProps)(LegendComponent);
