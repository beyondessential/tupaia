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

export class DayPicker extends PureComponent {
  render() {
    const { momentDateValue, minMomentDate, maxMomentDate, onChange } = this.props;

    const daysInMonth = momentDateValue.daysInMonth();

    const minAvailableDay = momentDateValue.isSame(minMomentDate, 'month')
      ? minMomentDate.date()
      : 1;
    const maxAvailableDay = momentDateValue.isSame(maxMomentDate, 'month')
      ? maxMomentDate.date()
      : daysInMonth;

    const dayOptions = [];
    for (let d = 1; d <= daysInMonth; d++) {
      dayOptions.push(
        <MenuItem value={d} key={d} disabled={d < minAvailableDay || d > maxAvailableDay}>
          {d}
        </MenuItem>,
      );
    }

    return (
      <DatePicker
        label="Day"
        selectedValue={momentDateValue.date()}
        onChange={e => onChange(momentDateValue.clone().date(e.target.value))}
        menuItems={dayOptions}
      />
    );
  }
}

DayPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
