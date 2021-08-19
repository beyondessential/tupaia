/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getMarkerForOption, LEGEND_COLOR_ICON } from '@tupaia/ui-components/lib/map';
import { CONDITIONAL_MATRIX_CONDITION_SHAPE } from '../../propTypes';

const Legend = ({ legend, styles }) => {
  return (
    <div style={styles.footer.legend}>
      {legend.map(legendItem => {
        return <LegendItem {...legendItem} key={legendItem.legendLabel} styles={styles} />;
      })}
    </div>
  );
};

const LegendItem = ({ color, legendLabel, styles }) => {
  const marker = getMarkerForOption(LEGEND_COLOR_ICON, color);

  return (
    <div style={styles.footer.legend.key}>
      {marker}
      {legendLabel}
    </div>
  );
};

export default class FooterRow extends PureComponent {
  render() {
    const { styles, conditions } = this.props;
    return (
      <div style={styles.footer}>
        <Legend legend={conditions} styles={styles} />
      </div>
    );
  }
}

FooterRow.propTypes = {
  styles: PropTypes.object.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.shape(CONDITIONAL_MATRIX_CONDITION_SHAPE)).isRequired,
};
