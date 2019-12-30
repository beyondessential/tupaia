/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'material-ui/MenuItem';
import moment from 'moment';
import { DatePicker } from './DatePicker';

export class YearPicker extends PureComponent {
  render() {
    const { momentDateValue, minMomentDate, maxMomentDate, isIsoYear, onChange } = this.props;
    const momentToYear = (momentInstance, ...args) =>
      isIsoYear ? momentInstance.isoWeekYear(...args) : momentInstance.year(...args);

    const minYear = momentToYear(minMomentDate);
    const maxYear = momentToYear(maxMomentDate);

    const yearOptions = [];
    for (let y = minYear; y <= maxYear; y++) {
      yearOptions.push(
        <MenuItem value={y} key={y}>
          {y}
        </MenuItem>,
      );
    }

    return (
      <DatePicker
        label="Year"
        selectedValue={momentToYear(momentDateValue)}
        onChange={e => onChange(momentToYear(momentDateValue.clone(), e.target.value))}
        menuItems={yearOptions}
      />
    );
  }
}

YearPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  isIsoYear: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

YearPicker.defaultProps = {
  isIsoYear: false,
};
