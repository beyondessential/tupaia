/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DefaultCloseIcon from 'material-ui/svg-icons/navigation/close';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import IconButton from 'material-ui/IconButton';
import moment from 'moment';
import { DateRangePicker } from '../../components/DateRangePicker';

import { DIALOG_Z_INDEX, DARK_BLUE, OFF_WHITE } from '../../styles';
import { getViewWrapper, getIsMatrix, VIEW_CONTENT_SHAPE } from '../../components/View';

export class EnlargedDialogContent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      extraChartConfig: {}, // Bridge for connecting chart to exporter.
    };

    this.onItemClick = this.onItemClick.bind(this);
    this.renderPeriodSelector = this.renderPeriodSelector.bind(this);
    this.onChangeConfig = this.onChangeConfig.bind(this);
    this.onSetDateRange = this.onSetDateRange.bind(this);
  }

  onItemClick(chartItem) {
    const { onDrillDown } = this.props;
    onDrillDown(chartItem);
  }

  onSetDateRange(startDate, endDate) {
    const { onSetDateRange } = this.props;
    onSetDateRange(startDate, endDate);
    this.onChangeConfig({ startDate, endDate });
  }

  onChangeConfig(newConfigFields) {
    this.setState(previousState => ({
      extraChartConfig: { ...previousState.extraChartConfig, ...newConfigFields },
    }));
  }

  isExportable() {
    const { viewContent, isDrilledDown } = this.props;
    return (getIsMatrix(viewContent) || viewContent.type === 'chart') && !isDrilledDown;
  }

  renderTitle() {
    const { viewContent, organisationUnitName } = this.props;
    let titleText;
    if (getIsMatrix(viewContent)) {
      return null;
    }

    const { name, periodGranularity } = viewContent;

    if (viewContent.entityHeader === '') titleText = `${viewContent.name}`;
    else if (viewContent.entityHeader)
      titleText = `${viewContent.name}, ${viewContent.entityHeader}`;
    else titleText = `${name}${organisationUnitName ? `, ${organisationUnitName} ` : ''}`;

    return (
      <DialogTitle style={styles.title}>
        <p style={styles.titleText}>{titleText}</p>
        {periodGranularity && this.renderPeriodSelector()}
      </DialogTitle>
    );
  }

  renderBody() {
    const { viewContent, drillDownOverlay } = this.props;
    const getStyle = () => {
      if (getIsMatrix(viewContent)) return styles.matrixContent;
      if (viewContent.chartType) return styles.chartContent;
      return {}; // No custom styling for other types of dialog content
    };
    return (
      <div style={getStyle()}>
        {viewContent.data && viewContent.data.length === 0 ? (
          <div style={{ color: OFF_WHITE }}>No data found for this time period</div>
        ) : (
          this.renderBodyContent()
        )}
        {drillDownOverlay}
      </div>
    );
  }

  renderBodyContent() {
    const { viewContent, onCloseOverlay, organisationUnitName } = this.props;
    const ViewWrapper = getViewWrapper(viewContent);
    const viewProps = {
      viewContent,
      isEnlarged: true,
      onClose: onCloseOverlay,
      onItemClick: this.onItemClick,
    };
    if (getIsMatrix(viewContent)) {
      viewProps.organisationUnitName = organisationUnitName;
      viewProps.onSetDateRange = this.onSetDateRange;
      viewProps.onChangeConfig = this.onChangeConfig;
    }

    return <ViewWrapper {...viewProps} />;
  }

  renderDescription() {
    const { viewContent } = this.props;
    const { description } = viewContent;

    if (!description) {
      return null;
    }

    return <DialogContentText style={styles.description}>{description}</DialogContentText>;
  }

  renderToolbar() {
    const { onCloseOverlay, onExport, CloseIcon, toolbarStyle } = this.props;
    const { extraChartConfig } = this.state;

    return (
      <div style={{ ...styles.toolbar, ...toolbarStyle }}>
        {this.isExportable() ? (
          <IconButton
            style={styles.toolbarButton}
            iconStyle={styles.toolbarButtonIcon}
            onClick={() => onExport(extraChartConfig)}
          >
            <DownloadIcon />
          </IconButton>
        ) : null}
        <IconButton
          data-testid="enlarged-dialog-close-btn"
          style={styles.toolbarButton}
          iconStyle={styles.toolbarButtonIcon}
          onClick={onCloseOverlay}
        >
          {CloseIcon ? <CloseIcon /> : <DefaultCloseIcon />}
        </IconButton>
      </div>
    );
  }

  renderPeriodSelector() {
    const { onSetDateRange, isLoading, viewContent } = this.props;
    const { periodGranularity, startDate, endDate } = viewContent;
    if (!periodGranularity) {
      return null;
    }

    return (
      <div style={styles.periodSelector}>
        <DateRangePicker
          granularity={periodGranularity}
          onSetDates={onSetDateRange}
          startDate={startDate}
          endDate={endDate}
          isLoading={isLoading}
        />
      </div>
    );
  }

  renderPeriodRange() {
    const { viewContent } = this.props;
    const { period, showPeriodRange } = viewContent;

    if (showPeriodRange !== 'all' || !period || !period.latestAvailable) {
      return null;
    }

    return (
      <DialogContentText style={styles.periodRange}>
        {'Latest available data: '}
        {moment(period.latestAvailable).format('DD/MM/YY')}
      </DialogContentText>
    );
  }

  render() {
    const isMatrix = getIsMatrix(this.props.viewContent);
    const contentStyle = {
      ...styles.body,
      padding: isMatrix ? 0 : 20,
    };

    return (
      <div data-testid="enlarged-dialog">
        {this.renderTitle()}
        <DialogContent style={contentStyle}>
          {this.renderToolbar()}
          {this.renderDescription()}
          {this.renderBody()}
          {this.renderPeriodRange()}
        </DialogContent>
      </div>
    );
  }
}

const styles = {
  title: {
    backgroundColor: DARK_BLUE,
  },
  titleText: {
    textAlign: 'center',
  },
  body: {
    backgroundColor: DARK_BLUE,
  },
  description: {
    marginTop: 0,
    marginBottom: 20,
    lineHeight: 1.15,
  },
  chartContent: {
    height: 350,
  },
  matrixContent: {
    height: '80vh',
  },
  toolbar: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: DIALOG_Z_INDEX,
  },
  periodSelector: {
    fontSize: 14,
    display: 'flex',
    justifyContent: 'center',
    marginTop: 5,
  },
  periodSelectorMenu: {
    marginTop: 0,
    height: 'auto',
  },
  periodSelectorError: {
    color: 'red',
    marginLeft: 20,
  },
  periodSelectorLoader: {
    marginTop: 18,
    marginLeft: 5,
  },
  toolbarButton: {
    verticalAlign: 'top',
    width: 28,
    height: 28,
    borderWidth: 0,
    padding: 5,
  },
  toolbarButtonIcon: {
    width: 18,
    height: 18,
  },
  dateDialog: {
    // Ensure date dialog is above enlarged dialog.
    zIndex: DIALOG_Z_INDEX + 1,
  },
  periodRange: {
    fontSize: 10,
    marginLeft: 20,
  },
};

EnlargedDialogContent.propTypes = {
  onCloseOverlay: PropTypes.func.isRequired,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  onExport: PropTypes.func,
  organisationUnitName: PropTypes.string,
  onDrillDown: PropTypes.func,
  onSetDateRange: PropTypes.func,
  isDrilledDown: PropTypes.bool,
  isLoading: PropTypes.bool,
  isVisible: PropTypes.bool,
  drillDownOverlay: PropTypes.element,
  CloseIcon: PropTypes.func,
  toolbarStyle: PropTypes.shape({}),
};

EnlargedDialogContent.defaultProps = {
  onDrillDown: () => {},
  onSetDateRange: () => {},
  isDrilledDown: false,
  isLoading: false,
  isVisible: false,
  drillDownOverlay: null,
  organisationUnitName: '',
  onExport: null,
  CloseIcon: DefaultCloseIcon,
  toolbarStyle: {},
  viewContent: null,
};
