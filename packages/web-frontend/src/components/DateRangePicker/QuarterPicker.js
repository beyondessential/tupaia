/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import moment from 'moment';

import { DatePicker } from './DatePicker';
import { GRANULARITY_CONFIG, GRANULARITIES } from '../../utils/periodGranularities';

const { pickerFormat: FORMAT } = GRANULARITY_CONFIG[GRANULARITIES.QUARTER];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export class QuarterPicker extends PureComponent {
  render() {
    const { momentDateValue, minMomentDate, maxMomentDate, onChange } = this.props;

    const minAvailableQuarterIndex = momentDateValue.isSame(minMomentDate, 'year')
      ? minMomentDate.quarter()
      : 1;
    const maxAvailableQuarterIndex = momentDateValue.isSame(maxMomentDate, 'year')
      ? maxMomentDate.quarter()
      : 4;

    const menuItems = quarters.map((quarterName, quarterIndex) => (
      <MenuItem
        key={quarterName}
        value={quarterIndex + 1} // Quarters are 1 indexed
        disabled={
          quarterIndex + 1 < minAvailableQuarterIndex || quarterIndex + 1 > maxAvailableQuarterIndex
        }
      >
        {quarterName}
      </MenuItem>
    ));

    return (
      <DatePicker
        label="Quarter"
        selectedValue={momentDateValue.quarter()}
        menuItems={menuItems}
        onChange={e => onChange(moment(momentDateValue).quarter(e.target.value))}
        getFormattedValue={quarterIndex =>
          moment()
            .quarter(quarterIndex)
            .format(FORMAT)
        }
      />
    );
  }
}

QuarterPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
