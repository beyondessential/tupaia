/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MatrixWrapper
 *
 * Renders a Matrix from data provided by viewContent object
 * @prop {object} viewContent An object with the following structure
 * When expanded:
   {
     "type":"matrix",
     "name": "Service Status By Facility",
     "presentationOptions": {
        "0": {
            "color": "#333333",
            "label": "",
            "description": "Description of colour"
        },
        ...
      }
    },
    "categories": [
        "title": "A category",
        "key": "aaaa",
    ]
    "columns": [
      {
          "title": "Services",
          "key": "dataElement"
      },
      {
          "title": "Fua'amotu",
          "key": "TO_FmotuHC"
      },
      ...
    ],
    "rows": [
      {
          "dataElement": "All routine birth immunisations and vitamins",
          "code": "PEHS342",
          "categoryId": "aaaa",
          "TO_FmotuHC": 1,
      },
      ...
    ]
  }
 * @return {React Component} a Matrix or Matrix Placeholder
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import CircularProgress from 'material-ui/CircularProgress';

import { isMobile } from '../../../utils/mobile';
import { VIEW_STYLES } from '../../../styles';
import { PRESENTATION_OPTIONS_SHAPE } from '../propTypes';
import matrixPlaceholder from '../../../images/matrix-placeholder.png';
import { DateRangePicker } from '../../DateRangePicker';
import { getStyles, DESCRIPTION_CELL_WIDTH, MINIMUM_CELL_WIDTH } from './styles';
import { Matrix } from './components';
import { formatDataValue } from '../../../utils';
import { getLimits } from '../../../utils/periodGranularities';

const buildMatrixDataFromViewContent = viewContent => {
  if (!viewContent.columns) {
    return null;
  }
  const {
    columns: columnData,
    rows,
    categories = [],
    presentationOptions = {},
    categoryPresentationOptions = {},
    isExporting,
    hideColumnTitles,
    valueType = 'text',
  } = viewContent;

  let maximumCellCharacters = 0;
  const formattedRows = rows.map(row => {
    const { dataElement, code, categoryId, category, valueType: rowValueType, ...cells } = row;

    const formattedCells = {};
    Object.entries(cells).forEach(([columnName, cellValue]) => {
      const columnDefinition = columnData.find(c => c.key === columnName);

      if (rowValueType) {
        formattedCells[columnName] = formatDataValue(
          cellValue.value,
          rowValueType,
          cellValue.metadata,
        );
      } else if (columnDefinition && columnDefinition.valueType) {
        formattedCells[columnName] = formatDataValue(
          cellValue.value,
          columnDefinition.valueType,
          cellValue.metadata,
        );
      } else {
        formattedCells[columnName] = formatDataValue(cellValue, valueType);
      }
    });

    Object.values(formattedCells).forEach(value => {
      if (!value) return;
      maximumCellCharacters = Math.max(maximumCellCharacters, value.toString().length);
    });

    return {
      description: dataElement,
      categoryId,
      category,
      ...formattedCells,
    };
  });

  const rowsInCategories = categories.map(({ title, key }) => ({
    category: title,
    categoryId: key,
    rows: formattedRows.filter(row => row.categoryId === key),
  }));

  let columns = [];
  columnData.forEach(columnDefinition => {
    if (columnDefinition.columns) {
      // This is a group of columns
      const { category, columns: columnsInGroup } = columnDefinition;
      columns.push({
        key: `GroupHeader_${category}`,
        title: category,
        isGroupHeader: true,
      });
      columns = [...columns, ...columnsInGroup];
    } else {
      columns.push(columnDefinition);
    }
  }, []);
  const calculatedStyles = getStyles(isExporting, maximumCellCharacters);

  return {
    columns,
    rows: rowsInCategories.length > 0 ? rowsInCategories : formattedRows,
    maximumCellCharacters,
    maximumColumnWidth: calculatedStyles.CELL_WIDTH,
    calculatedStyles,
    presentationOptions,
    categoryPresentationOptions,
    hideColumnTitles,
  };
};

export class MatrixWrapper extends Component {
  constructor(props) {
    super(props);
    const data = buildMatrixDataFromViewContent({
      ...props.viewContent,
      isExporting: props.isExporting,
    });
    this.state = {
      expandedMatrixData: data || {},
      isLoading: !data,
      offsetWidth: 0,
    };
    this.renderPeriodSelector = this.renderPeriodSelector.bind(this);
    this.onSetDateRange = this.onSetDateRange.bind(this);
    this.updateWrapper = this.updateWrapper.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      nextState.isLoading !== this.state.isLoading ||
      nextState.expandedMatrixData !== this.state.expandedMatrixData ||
      nextState.offsetWidth !== this.state.offsetWidth
    );
  }

  componentDidUpdate(prevProps) {
    const { viewContent, isExporting } = this.props;

    if (prevProps.viewContent !== viewContent) {
      const expandedMatrixData = buildMatrixDataFromViewContent({ ...viewContent, isExporting });
      this.setState({
        expandedMatrixData,
        isLoading: !expandedMatrixData,
      });
    }
  }

  onSetDateRange(...args) {
    this.setState({
      isLoading: true,
    });
    this.props.onSetDateRange(...args);
  }

  updateWrapper = wrapper => {
    if (!wrapper) {
      return;
    }

    const { offsetWidth } = wrapper;
    this.setState({ offsetWidth });
  };

  renderPeriodSelector() {
    const { viewContent } = this.props;
    const { periodGranularity } = viewContent;
    const { isLoading } = this.state;

    if (!periodGranularity) {
      return null; // Not using a period selector
    }

    const datePickerLimits = getLimits(viewContent.periodGranularity, viewContent.datePickerLimits);

    return (
      <div style={styles.periodSelector}>
        <DateRangePicker
          granularity={viewContent.periodGranularity}
          onSetDates={this.onSetDateRange}
          startDate={viewContent.startDate}
          endDate={viewContent.endDate}
          min={datePickerLimits.startDate}
          max={datePickerLimits.endDate}
          isLoading={isLoading}
        />
      </div>
    );
  }

  renderMatrix() {
    const {
      viewContent,
      organisationUnitName,
      isExporting,
      onChangeConfig,
      onItemClick,
    } = this.props;
    let titleText;
    const { expandedMatrixData, offsetWidth } = this.state;
    const {
      rows,
      columns,
      calculatedStyles,
      presentationOptions,
      categoryPresentationOptions,
      maximumColumnWidth,
      hideColumnTitles,
    } = expandedMatrixData;
    const PeriodSelectorComponent = this.renderPeriodSelector();

    if (!columns) {
      return (
        <div style={styles.loadingWrapper}>
          <CircularProgress />
        </div>
      );
    }

    let numberOfColumnsPerPage = 0;
    if (offsetWidth) {
      const safeWidth = offsetWidth - 50; // Compensate for angled labels.
      const usableWidth = safeWidth - DESCRIPTION_CELL_WIDTH - MINIMUM_CELL_WIDTH * 2;
      const maxColumns = Math.floor(usableWidth / maximumColumnWidth);
      numberOfColumnsPerPage = maxColumns;
    }

    if (viewContent.entityHeader === '') titleText = `${viewContent.name}`;
    else if (viewContent.entityHeader)
      titleText = `${viewContent.name}, ${viewContent.entityHeader}`;
    else
      titleText = `${viewContent.name}${organisationUnitName ? `, ${organisationUnitName}` : ''}`;

    return (
      <Matrix
        rows={rows}
        columns={columns}
        numberOfColumnsPerPage={numberOfColumnsPerPage}
        calculatedStyles={calculatedStyles}
        presentationOptions={presentationOptions}
        categoryPresentationOptions={categoryPresentationOptions}
        isExporting={isExporting}
        hideColumnTitles={hideColumnTitles}
        title={titleText}
        onSearch={searchTerm => onChangeConfig({ search: searchTerm })}
        renderPeriodSelector={() => PeriodSelectorComponent}
        onRowClick={onItemClick}
      />
    );
  }

  render() {
    const { isEnlarged, isExporting } = this.props;

    if (isEnlarged || isExporting) {
      return (
        <div style={styles.matrixRef} ref={this.updateWrapper}>
          {this.renderMatrix()}
        </div>
      );
    }
    return (
      <div style={VIEW_STYLES.chartViewContainer}>
        <div style={VIEW_STYLES.chartContainer}>
          {isMobile() ? (
            <>
              <img
                src={matrixPlaceholder}
                alt="Matrix chart placeholder"
                style={styles.placeholderImage}
              />
              <div style={VIEW_STYLES.mobileChartMessage}>
                <div style={VIEW_STYLES.mobileChartMessageContent}>
                  Please note that the Tupaia matrix chart cannot be properly viewed on small
                  screens.
                </div>
              </div>
            </>
          ) : (
            <div>
              <img
                src={matrixPlaceholder}
                alt="Matrix chart placeholder"
                style={styles.placeholderImage}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  periodSelector: {
    paddingRight: 5,
    marginLeft: -10,
  },
  matrixRef: {
    height: 'inherit',
  },
  placeholderImage: isMobile()
    ? {
        width: 'auto',
        height: '100%',
        margin: '0 auto',
      }
    : {
        width: '100%',
        height: 'auto',
      },
};

MatrixWrapper.propTypes = {
  viewContent: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.object),
    rows: PropTypes.arrayOf(PropTypes.object),
    categories: PropTypes.arrayOf(PropTypes.object),
    presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE),
  }).isRequired,
  organisationUnitName: PropTypes.string,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onChangeConfig: PropTypes.func,
  onSetDateRange: PropTypes.func,
  onItemClick: PropTypes.func,
};

MatrixWrapper.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  organisationUnitName: '',
  onChangeConfig: () => {},
  onSetDateRange: () => {},
  onItemClick: () => null,
};
