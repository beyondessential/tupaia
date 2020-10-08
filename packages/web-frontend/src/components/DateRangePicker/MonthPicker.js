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

const { pickerFormat: FORMAT } = GRANULARITY_CONFIG[GRANULARITIES.MONTH];

export class MonthPicker extends PureComponent {
  render() {
    const { momentDateValue, minMomentDate, maxMomentDate, onChange } = this.props;

    const minAvailableMonthIndex = momentDateValue.isSame(minMomentDate, 'year')
      ? minMomentDate.month()
      : 0;
    const maxAvailableMonthIndex = momentDateValue.isSame(maxMomentDate, 'year')
      ? maxMomentDate.month()
      : 11;

    const menuItems = moment.months().map((monthName, monthIndex) => (
      <MenuItem
        key={monthName}
        value={monthIndex}
        disabled={monthIndex < minAvailableMonthIndex || monthIndex > maxAvailableMonthIndex}
      >
        {monthName}
      </MenuItem>
    ));

    return (
      <DatePicker
        label="Month"
        selectedValue={momentDateValue.month()}
        menuItems={menuItems}
        onChange={e => onChange(moment(momentDateValue).month(e.target.value))}
        getFormattedValue={monthIndex => moment().month(monthIndex).format(FORMAT)}
      />
    );
  }
}

MonthPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
