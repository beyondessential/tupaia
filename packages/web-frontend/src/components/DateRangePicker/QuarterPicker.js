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

    const minAvailableQuarterNumber = momentDateValue.isSame(minMomentDate, 'year')
      ? minMomentDate.quarter()
      : 1;
    const maxAvailableQuarterNumber = momentDateValue.isSame(maxMomentDate, 'year')
      ? maxMomentDate.quarter()
      : 4;

    const menuItems = quarters.map((quarterName, quarterIndex) => {
      const quarterNumber = quarterIndex + 1; // Quarters are 1 indexed
      return (
        <MenuItem
          key={quarterName}
          value={quarterNumber}
          disabled={
            quarterNumber < minAvailableQuarterNumber || quarterNumber > maxAvailableQuarterNumber
          }
        >
          {quarterName}
        </MenuItem>
      );
    });

    return (
      <DatePicker
        label="Quarter"
        selectedValue={momentDateValue.quarter()}
        menuItems={menuItems}
        onChange={e => onChange(moment(momentDateValue).quarter(e.target.value))}
        getFormattedValue={quarterNumber =>
          moment()
            .quarter(quarterNumber)
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
