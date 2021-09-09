/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CircularProgress from 'material-ui/CircularProgress';
import moment from 'moment';
import { CHART_TYPES } from '@tupaia/ui-components/lib/chart';
import { VIEW_STYLES } from '../../styles';
import { OverlayView } from '../../utils';
import { NoDataMessage } from './NoDataMessage';
import { VIEW_CONTENT_SHAPE } from './propTypes';
import { DashboardItemExpanderButton } from '../DashboardItemExpanderButton';
import { DashboardItemInfoButton } from '../DashboardItemInfoButton';
import { getViewWrapper, transformDataForViewType, getIsMatrix } from './utils';
import { Alert, AlertAction, AlertLink } from '../Alert';
import { ViewTitle } from './Typography';

const viewHasData = viewContent => {
  const { chartType, data } = viewContent;

  // For any matrix, return true to display the placeholder
  if (getIsMatrix(viewContent)) {
    return true;
  }

  // If all segments of a pie chart are "0", display the no data message
  if (chartType === CHART_TYPES.PIE && data && data.every(segment => segment.value === 0)) {
    return false;
  }

  return data && data.length > 0;
};

const getContainerStyle = (baseStyle, viewContent) => {
  // The multi photo view is a special case, with its own style
  const isMultiPhoto = viewContent.viewType === 'multiPhotograph';
  if (isMultiPhoto) {
    return {
      ...VIEW_STYLES.mainContainer,
      ...VIEW_STYLES.mainContainerLarge,
    };
  }

  if (viewContent.type === 'chart') {
    // When not expanded, dashboard panels are given a height based
    // on their contents therefore charts (and only charts) must have
    // a minimum height.
    const chartStyle = {
      ...baseStyle,
      minHeight: 250,
    };

    // Charts with big data have an extra wide container
    const hasBigData = viewContent.data && viewContent.data.length > 20;
    if (hasBigData) {
      return {
        ...chartStyle,
        ...VIEW_STYLES.stretchContainer,
      };
    }
    // All other charts
    return chartStyle;
  }

  // All other views
  return baseStyle;
};

const formatDate = value => {
  return `Latest available data: ${moment(value).format('DD/MM/YY')}`;
};

const formatPeriodRange = period => {
  // TODO: add range if applicable
  return formatDate(period.latestAvailable);
};

const StyledAlert = styled(Alert)`
  &.MuiAlert-root {
    margin: 20px auto 10px;
    padding: 5px 16px 5px 13px;
  }
`;

export class View extends Component {
  state = {
    isHovered: false,
  };

  getIsExpandable() {
    const { viewContent } = this.props;
    return (
      viewContent.periodGranularity ||
      viewContent.type === 'chart' ||
      getIsMatrix(viewContent) ||
      viewContent.viewType === 'dataDownload'
    );
  }

  getHasTitle() {
    const { viewContent } = this.props;
    const { name, type } = viewContent;
    return name && (getIsMatrix(viewContent) || type === 'chart');
  }

  getHasPeriod() {
    const { viewContent } = this.props;
    const { period, showPeriodRange } = viewContent;
    return showPeriodRange && period && period.latestAvailable;
  }

  mouseOut() {
    this.setState({ isHovered: false });
  }

  mouseOver() {
    this.setState({ isHovered: true });
  }

  render() {
    const { viewContent, isSidePanelExpanded, onEnlarge, retry } = this.props;
    const viewContainerStyle = isSidePanelExpanded
      ? { ...VIEW_STYLES.mainContainer, ...VIEW_STYLES.mainContainerExpanded }
      : VIEW_STYLES.mainContainer;
    if (!viewContent) {
      return (
        <div
          data-testid="view"
          style={{
            ...viewContainerStyle,
            ...VIEW_STYLES.loadingContainer,
          }}
        >
          <CircularProgress />
        </div>
      );
    }

    if (viewContent.error) {
      return (
        <div data-testid="view" style={viewContainerStyle}>
          <StyledAlert severity="error">
            {`Error: ${viewContent.error} `}
            <AlertAction onClick={retry}>Retry loading data</AlertAction> or contact{' '}
            <AlertLink href="mailto:support@tupaia.org">support@tupaia.org</AlertLink>
          </StyledAlert>
        </div>
      );
    }

    const isExpandable = this.getIsExpandable();
    const expandHelpText =
      viewContent.viewType === 'dataDownload' ? 'Expand to download data' : 'Expand chart';
    const expandButton = isExpandable ? (
      <DashboardItemExpanderButton onEnlarge={onEnlarge} helpText={expandHelpText} />
    ) : null;

    if (!viewHasData(viewContent)) {
      const { startDate, endDate } = viewContent;
      const periodDependent = startDate && endDate;
      return (
        <div data-testid="view" style={viewContainerStyle}>
          <div>
            <ViewTitle>{viewContent.name}</ViewTitle>
            <NoDataMessage viewContent={viewContent} />
            {periodDependent && expandButton}
          </div>
        </div>
      );
    }

    const ViewWrapper = getViewWrapper(viewContent);

    const showInfoIcon =
      viewContent.description !== undefined && !isExpandable ? (
        <div style={VIEW_STYLES.infoDiv}>
          <DashboardItemInfoButton
            onMouseOver={() => this.mouseOver()}
            onFocus={() => this.mouseOver()}
            onMouseOut={() => this.mouseOut()}
            onBlur={() => this.mouseOut()}
            onTouchEnd={() => this.mouseOver()}
            infoText={viewContent.description}
          />
        </div>
      ) : null;

    const showDescription =
      !isExpandable && this.state.isHovered ? (
        <div style={VIEW_STYLES.description}>
          <div style={{ margin: 10 }}>{viewContent.description}</div>
        </div>
      ) : null;

    const title = this.getHasTitle() && <ViewTitle>{viewContent.name}</ViewTitle>;

    const showPeriodRange = this.getHasPeriod() && (
      <div style={VIEW_STYLES.periodRange}>{formatPeriodRange(viewContent.period)}</div>
    );

    const newViewContent = transformDataForViewType(viewContent);

    return (
      <div data-testid="view" style={getContainerStyle(viewContainerStyle, viewContent)}>
        <OverlayView>
          {title}
          <ViewWrapper viewContent={newViewContent} />
          {showPeriodRange}
          {showDescription}
          {showInfoIcon}
          {expandButton}
        </OverlayView>
      </div>
    );
  }
}

View.propTypes = {
  isSidePanelExpanded: PropTypes.bool,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  onEnlarge: PropTypes.func,
  retry: PropTypes.func,
};

View.defaultProps = {
  isSidePanelExpanded: false,
  viewContent: null,
  onEnlarge: () => {},
  retry: null,
};
