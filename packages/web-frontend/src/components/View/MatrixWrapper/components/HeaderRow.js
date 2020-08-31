/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from 'material-ui/svg-icons/action/search';
import ClearSearchIcon from 'material-ui/svg-icons/navigation/close';
import DownIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import UpIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-up';

export default class HeaderRow extends PureComponent {
  renderBelowTitleComponent() {
    const {
      styles,
      searchTerm,
      searchPlaceholder,
      onSearchTermChange,
      isSearchActive,
      renderPeriodSelector,
    } = this.props;

    const periodSelector = renderPeriodSelector();

    return periodSelector ? (
      <div style={styles.searchBox}>{periodSelector}</div>
    ) : (
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={event => onSearchTermChange(event.target.value)}
          value={searchTerm}
          style={styles.searchBoxInput}
          className="matrix-input"
        />
        {isSearchActive ? (
          <ClearSearchIcon style={styles.searchBoxIcon} onClick={() => onSearchTermChange()} />
        ) : (
          <SearchIcon style={styles.searchBoxIcon} />
        )}
      </div>
    );
  }

  render() {
    const {
      title,
      columns,
      startColumn,
      numberOfColumnsPerPage,
      onMoveColumnPress,
      onMoveColumnRelease,
      isPreviousEnabled,
      isNextEnabled,
      styles,
    } = this.props;

    const displayedColumnCount = startColumn + numberOfColumnsPerPage;

    return (
      <div style={styles.gridHeader}>
        <div style={{ ...styles.headerCell, ...styles.descriptionHeaderCell }}>
          <div style={styles.tableTitle}>
            <span style={styles.tableTitleText}>{title}</span>
          </div>
          {this.renderBelowTitleComponent()}
        </div>
        <div
          style={{ ...styles.headerCell, ...styles.headerCellButton }}
          onMouseDown={() => onMoveColumnPress(-1)}
          onMouseUp={onMoveColumnRelease}
        >
          <div style={styles.clinicLabel}>
            <div
              style={
                isPreviousEnabled ? styles.headerColumnChanger : styles.headerColumnChangerDisabled
              }
            >
              <UpIcon style={styles.headerColumnChangerIcon} />
              Previous
            </div>
          </div>
        </div>
        {columns.slice(startColumn, displayedColumnCount).map(column => (
          <div key={column.key} style={styles.headerCell}>
            <div style={styles.clinicLabel}>
              <div style={column.isGroupHeader ? styles.facilityTypeLabel : {}}>{column.title}</div>
            </div>
          </div>
        ))}
        <div
          style={{ ...styles.headerCell, ...styles.headerCellButton }}
          onMouseDown={() => onMoveColumnPress(1)}
          onMouseUp={onMoveColumnRelease}
        >
          <div style={styles.clinicLabel}>
            <div
              style={
                isNextEnabled ? styles.headerColumnChanger : styles.headerColumnChangerDisabled
              }
            >
              Next
              <DownIcon style={styles.headerColumnChangerIcon} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HeaderRow.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.any,
  startColumn: PropTypes.number,
  numberOfColumnsPerPage: PropTypes.number,
  onMoveColumnPress: PropTypes.func,
  onMoveColumnRelease: PropTypes.func,
  searchTerm: PropTypes.string,
  onSearchTermChange: PropTypes.func,
  isSearchActive: PropTypes.bool,
  isPreviousEnabled: PropTypes.bool,
  isNextEnabled: PropTypes.bool,
  styles: PropTypes.object,
  renderPeriodSelector: PropTypes.func,
};
