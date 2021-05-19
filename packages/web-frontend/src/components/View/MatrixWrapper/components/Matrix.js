/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { partition } from 'lodash';

import { PRESENTATION_OPTIONS_SHAPE } from '../../propTypes';
import HeaderRow from './HeaderRow';
import DescriptionOverlay from './DescriptionOverlay';
import Row from './Row';
import RowGroup from './RowGroup';
import FooterRow from './FooterRow';
import { CATEGORY_INDENT } from '../styles';

import './matrix.css';
import { getIsUsingDots } from '../../utils';

const getCategoryKey = (categoryId, index) => `${categoryId}_${index}`;

export class Matrix extends PureComponent {
  constructor(props) {
    super(props);

    this.onCellMouseEnter = this.onCellMouseEnter.bind(this);
    this.onCellMouseLeave = this.onCellMouseLeave.bind(this);
    this.onMoveColumnPress = this.onMoveColumnPress.bind(this);
    this.onMoveColumnRelease = this.onMoveColumnRelease.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onSearchTermChange = this.onSearchTermChange.bind(this);
    this.onToggleRowExpanded = this.onToggleRowExpanded.bind(this);
    this.setRowRef = this.setRowRef.bind(this);

    const state = {
      startColumn: 0,
      startRow: 0, // Used in print mode.
      expandedCategories: {},
      highlightedRow: null,
      highlightedColumn: null,
      searchTerm: '',
      areAllExpanded: false, // For exporting.
      isPrintMode: props.isExporting,
      selectedPresentationOption: null,
      selectedCellValue: null,
    };

    // Expand first category by default.
    if (props.rows && props.rows.length > 0 && props.rows[0].categoryId) {
      const categoryKey = getCategoryKey(props.rows[0].categoryId, 0);
      state.expandedCategories[categoryKey] = true;
    }

    this.state = state;

    this.rowElements = []; // For exporting.
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onMoveColumnRelease); // If user releases mouse after moving away from next column button.
  }

  componentDidUpdate(prevProps) {
    this.columnKeys = null;
    if (prevProps.numberOfColumnsPerPage !== this.props.numberOfColumnsPerPage) {
      this.setState({
        startColumn: 0,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMoveColumnRelease);
  }

  onToggleRowExpanded(key) {
    const { expandedCategories } = this.state;
    const isExpanded = !expandedCategories[key];

    this.setState({
      expandedCategories: { ...expandedCategories, [key]: isExpanded },
    });
  }

  onSearchTermChange(searchTerm = '') {
    const { onSearch } = this.props;

    this.setState({
      searchTerm,
    });

    onSearch(searchTerm);
  }

  onCellMouseEnter(columnNumber, rowKey) {
    this.setState({
      highlightedColumn: columnNumber,
      highlightedRow: rowKey,
    });
  }

  onCellMouseLeave() {
    this.setState({
      highlightedColumn: null,
      highlightedRow: null,
    });
  }

  onCellClick(selectedPresentationOption, selectedCellValue) {
    this.setState({
      selectedPresentationOption,
      selectedCellValue,
    });
  }

  onDescriptionOverlayClose() {
    this.setState({ selectedPresentationOption: null, selectedCellValue: null });
  }

  onMoveColumnPress(distance) {
    this.moveColumn(distance);

    // Keep moving column as long as the button is pressed.
    this.moveColumnPressed = setInterval(() => this.moveColumn(distance), 100);
  }

  onMoveColumnRelease() {
    clearInterval(this.moveColumnPressed);
  }

  getColumnKeys() {
    if (!this.columnKeys) {
      const { columns } = this.props;
      this.columnKeys = columns.map(column => column.key);
    }

    return this.columnKeys;
  }

  setRowRef(rowElement) {
    if (!this.rowElements.includes(rowElement)) {
      this.rowElements.push(rowElement);
    }
  }

  shouldRenderFooter() {
    if (!getIsUsingDots(this.props.presentationOptions)) {
      return false;
    }
    const conditions = this.props.presentationOptions.conditions || [];
    return conditions.filter(condition => !!condition.legendLabel).length > 0;
  }

  moveColumn(distance) {
    const { numberOfColumnsPerPage } = this.props;
    const { startColumn } = this.state;
    const columnKeys = this.getColumnKeys();
    // limit should never be negative, and numberOfColumnsPerPage can be greater than columnKeys
    const limit = Math.max(0, columnKeys.length - numberOfColumnsPerPage);

    let moveTo = startColumn + distance;

    // Snap to bounds.
    moveTo = Math.max(moveTo, 0);
    moveTo = Math.min(limit, moveTo);

    this.setState({
      startColumn: moveTo,
    });
  }

  isRowExpanded(key) {
    const { areAllExpanded, expandedCategories } = this.state;
    return areAllExpanded || (key && expandedCategories[key]);
  }

  isSearchActive() {
    const { searchTerm } = this.state;
    return !!(searchTerm && searchTerm.length > 2);
  }

  isPreviousColumnEnabled() {
    const { startColumn } = this.state;
    return startColumn > 0;
  }

  isNextColumnEnabled() {
    const { numberOfColumnsPerPage } = this.props;
    const { startColumn } = this.state;
    const columnKeys = this.getColumnKeys();

    return startColumn < columnKeys.length - numberOfColumnsPerPage;
  }

  doesMatchSearch(text) {
    if (!this.isSearchActive()) {
      return true;
    }

    const { searchTerm } = this.state;
    return text.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
  }

  recursivelyRenderRowData(rows, depth = 1, parent = undefined) {
    const styles = this.props.calculatedStyles;
    const isSearchActive = this.isSearchActive();
    const { startColumn, highlightedRow, highlightedColumn } = this.state;
    const { numberOfColumnsPerPage } = this.props;
    const { columns, presentationOptions, onRowClick, categoryPresentationOptions } = this.props;
    const [rootRows, childRows] = partition(rows, { categoryId: parent });

    return rootRows
      .map(({ description, category, categoryId, rowInfo, ...cellData }, index) => {
        const rowKey = parent ? `${parent}_${description}_${index}` : `${description}_${index}`;
        const isRowHighlighted = rowKey === highlightedRow;

        if (category) {
          const key = getCategoryKey(categoryId, index);
          const isRowExpandedByUser = this.isRowExpanded(key);
          const children =
            isSearchActive || isRowExpandedByUser
              ? this.recursivelyRenderRowData(childRows, depth + 1, category)
              : [];

          const isEmpty = children.length === 0;

          if (isSearchActive && isEmpty) {
            return null;
          }
          const isExpanded = isSearchActive || isRowExpandedByUser;
          return (
            <RowGroup
              key={key}
              rowId={key}
              columns={columns}
              columnData={cellData}
              isExpanded={isExpanded}
              depth={depth}
              indentSize={CATEGORY_INDENT}
              categoryLabel={description || category}
              startColumn={startColumn}
              numberOfColumnsPerPage={numberOfColumnsPerPage}
              onToggleRowExpanded={this.onToggleRowExpanded}
              ref={this.setRowRef}
              styles={styles}
              isRowHighlighted={isRowHighlighted}
              highlightedColumn={highlightedColumn}
              onCellMouseEnter={this.onCellMouseEnter}
              onCellMouseLeave={this.onCellMouseLeave}
              onCellClick={this.onCellClick}
              presentationOptions={categoryPresentationOptions}
              isUsingDots={getIsUsingDots(categoryPresentationOptions)}
              childRows={childRows}
              category={category}
            >
              {children}
            </RowGroup>
          );
        }

        if (isSearchActive && !this.doesMatchSearch(description)) {
          return null;
        }

        const rowData = columns.map(({ key, isGroupHeader }) => ({
          value: isNaN(cellData[key]) ? cellData[key] : Math.round(cellData[key] * 1000) / 1000, // round the numeric values UP TO 3 decimal places
          isGroupBoundary: isGroupHeader,
        }));

        const onTitleClick = () => onRowClick(cellData);

        return (
          <Row
            key={rowKey}
            rowKey={rowKey}
            ref={this.setRowRef}
            columns={rowData}
            isRowHighlighted={isRowHighlighted}
            highlightedColumn={highlightedColumn}
            startColumn={startColumn}
            numberOfColumnsPerPage={numberOfColumnsPerPage}
            depth={depth}
            categoryIndent={CATEGORY_INDENT}
            description={description}
            onCellMouseEnter={this.onCellMouseEnter}
            onCellMouseLeave={this.onCellMouseLeave}
            onCellClick={this.onCellClick}
            onTitleClick={onTitleClick}
            onMoveColumnPress={this.onMoveColumnPress}
            onMoveColumnRelease={this.onMoveColumnRelease}
            presentationOptions={presentationOptions}
            isNextColumnEnabled={this.isNextColumnEnabled()}
            isPreviousColumnEnabled={this.isPreviousColumnEnabled()}
            isUsingDots={getIsUsingDots(presentationOptions)}
            styles={styles}
            rowInfo={rowInfo}
          />
        );
      })
      .filter(x => x);
  }

  renderHeaderRow() {
    const styles = this.props.calculatedStyles;
    const { columns, title, hideColumnTitles, renderPeriodSelector } = this.props;
    const { startColumn, searchTerm } = this.state;
    const { numberOfColumnsPerPage } = this.props;
    const searchPlaceholder =
      (this.props.rows[0] && `e.g. ${this.props.rows[0].description}`) || 'Search rows';

    return (
      <HeaderRow
        title={title}
        searchPlaceholder={searchPlaceholder}
        columns={columns}
        startColumn={startColumn}
        numberOfColumnsPerPage={numberOfColumnsPerPage}
        onMoveColumnPress={this.onMoveColumnPress}
        onMoveColumnRelease={this.onMoveColumnRelease}
        hideColumnTitles={hideColumnTitles}
        styles={styles}
        onSearchTermChange={this.onSearchTermChange}
        searchTerm={searchTerm}
        isSearchActive={this.isSearchActive()}
        isPreviousEnabled={this.isPreviousColumnEnabled()}
        isNextEnabled={this.isNextColumnEnabled()}
        renderPeriodSelector={renderPeriodSelector}
      />
    );
  }

  renderDescriptionOverlay() {
    const { selectedPresentationOption, selectedCellValue } = this.state;
    if (!selectedPresentationOption) {
      return null;
    }

    const allPresentationOptions = {
      ...this.props.presentationOptions,
      ...this.props.categoryPresentationOptions,
    };
    const { mainTitle, label, description, color } = selectedPresentationOption;

    return (
      <DescriptionOverlay
        mainTitle={mainTitle}
        header={label}
        body={`${description || ''} ${
          allPresentationOptions.showRawValue ? selectedCellValue : ''
        }`}
        color={color}
        styles={this.props.calculatedStyles}
        onClose={() => this.onDescriptionOverlayClose()}
      />
    );
  }

  renderEmptyMessage() {
    const styles = this.props.calculatedStyles;

    if (this.isSearchActive()) {
      const { searchTerm } = this.state;

      return <div style={styles.noResults}>{`No results found for the term: ${searchTerm}`}</div>;
    }

    return null;
  }

  render() {
    const styles = this.props.calculatedStyles;
    const renderedRows = this.recursivelyRenderRowData(this.props.rows);
    const rowDisplay =
      renderedRows && renderedRows.length > 0 ? renderedRows : this.renderEmptyMessage();

    const shouldRenderFooter = this.shouldRenderFooter();

    const { conditions } = this.props.presentationOptions;

    return (
      <div
        style={styles.wrapper}
        ref={element => {
          this.wrapper = element;
        }}
      >
        <div style={styles.gridWrapper}>
          {this.renderDescriptionOverlay()}
          {this.renderHeaderRow()}
          <div
            style={styles.verticalScroller}
            ref={element => {
              this.verticalScroller = element;
            }}
          >
            <div style={styles.contentWrapper}>
              <div style={styles.contentInner}>{rowDisplay}</div>
            </div>
          </div>
          {shouldRenderFooter && <FooterRow conditions={conditions} styles={styles} />}
        </div>
      </div>
    );
  }
}

// define row shape separately to allow for a recursive data structure
const rowShape = PropTypes.shape({
  category: PropTypes.string,
  categoryId: PropTypes.string,
  description: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
});
rowShape.rows = PropTypes.arrayOf(rowShape);

Matrix.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      title: PropTypes.string,
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  rows: PropTypes.arrayOf(rowShape),
  title: PropTypes.string,
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE).isRequired,
  categoryPresentationOptions: PropTypes.object.isRequired, // category header rows can have values just like real rows, this is how you style them
  hideColumnTitles: PropTypes.bool,
  isExporting: PropTypes.bool,
  onSearch: PropTypes.func,
  numberOfColumnsPerPage: PropTypes.number.isRequired,
  calculatedStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number]))
    .isRequired,
  renderPeriodSelector: PropTypes.func,
  onRowClick: PropTypes.func,
};

Matrix.defaultProps = {
  columns: [],
  rows: [],
  title: '',
  hideColumnTitles: false,
  isExporting: false,
  onSearch: () => {},
  renderPeriodSelector: () => null,
  onRowClick: () => null,
};
