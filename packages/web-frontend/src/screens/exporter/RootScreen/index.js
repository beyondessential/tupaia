/* eslint-disable react/jsx-one-expression-per-line */
/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * React app for rendering charts for export.
 *
 * Fetches viewContent using variables passed in get string and
 * displays the correct chart.
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import moment from 'moment-timezone';

import { ChartWrapper, getIsMatrix, MatrixWrapper } from '../../../components/View';
import { request } from '../../../utils';
import { decodeUrl, getInitialLocation } from '../../../utils/historyNavigation';
import { DARK_BLUE, WHITE } from '../../../styles';
import { selectOrgUnit } from '../../../selectors';

const initialLocation = getInitialLocation();
const {
  organisationUnitCode,
  organisationUnitName,
  dashboardId,
  reportId,
  timeZone,
  startDate,
  endDate,
  disasterStartDate,
  disasterEndDate,
  projectCode,
} = decodeUrl(initialLocation.pathname, initialLocation.search);

const getCurrentDateString = () => {
  const date = moment().tz(timeZone);
  return `Exported ${String(date)}`;
};

const getDateRangeString = () => {
  if (!startDate || !endDate) return '';
  const formatDate = date => moment(date).format('DD/MM/YY');
  return `Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}.`;
};

export default class RootScreen extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewContent: null,
      isLoading: true,
      errorMessage: '',
    };
  }

  async componentDidMount() {
    const urlParameters = {
      dashboardGroupId: dashboardId,
      viewId: reportId,
      organisationUnitCode,
      startDate,
      endDate,
      disasterStartDate,
      disasterEndDate,
      isExpanded: true,
      projectCode,
    };
    const requestResourceUrl = `view?${queryString.stringify(urlParameters)}`;
    const viewContent = await request(requestResourceUrl, this.handleError, {});
    this.setState({ viewContent, isLoading: false });
  }

  handleError(error) {
    this.setState({ errorMessage: error.message, isLoading: false });
  }

  renderTitle() {
    const { viewContent } = this.state;

    return (
      <h1 style={styles.title}>
        {viewContent.name} {organisationUnitName ? `, ${organisationUnitName}` : ''}
      </h1>
    );
  }

  render() {
    const { viewContent, isLoading, errorMessage } = this.state;

    if (isLoading) {
      return <div>Loading</div>;
    }
    if (errorMessage) {
      return <div style={styles.errorMessage}>{errorMessage}</div>;
    }

    const Component = getIsMatrix(viewContent) ? MatrixWrapper : ChartWrapper;
    return (
      <div id="chart-body" style={styles.wrapper}>
        <div style={styles.timestamp}>{`${getDateRangeString()}   ${getCurrentDateString()}`}</div>
        {this.renderTitle()}
        <div style={styles.chartWrapper}>
          <Component viewContent={viewContent} isExporting />
        </div>
      </div>
    );
  }
}

const TIMESTAMP_HEIGHT = 20;

const styles = {
  wrapper: {
    height: '100vh',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: WHITE,
    paddingTop: TIMESTAMP_HEIGHT, // To allow for timestamp div.
    boxSizing: 'border-box',
  },
  chartWrapper: {
    flex: 1,
    maxHeight: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    padding: 15,
  },
  errorMessage: {
    color: WHITE,
  },
  timestamp: {
    fontSize: TIMESTAMP_HEIGHT / 2,
    lineHeight: `${TIMESTAMP_HEIGHT}px`,
    position: 'absolute',
    top: 0,
    right: TIMESTAMP_HEIGHT / 4,
    color: DARK_BLUE,
  },
};
