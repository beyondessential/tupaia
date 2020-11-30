/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DefaultCloseIcon from 'material-ui/svg-icons/navigation/close';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import IconButton from 'material-ui/IconButton';
import moment from 'moment';
import { Alert } from '../../components/Alert';
import { DateRangePicker } from '../../components/DateRangePicker';

import { DIALOG_Z_INDEX, DARK_BLUE, WHITE } from '../../styles';
import { getViewWrapper, getIsMatrix, VIEW_CONTENT_SHAPE } from '../../components/View';
import { LoadingIndicator } from '../Form/common';
import { getLimits } from '../../utils/periodGranularities';

const StyledAlert = styled(Alert)`
  display: inline-flex;
  min-width: 240px;
`;

const ExportDateText = styled.div`
  padding-bottom: 5px;
  text-align: center;
  font-size: 12px;
  color: #333333;
  background: white;
`;

const Description = styled(DialogContentText)`
  margin-top: 0;
  margin-bottom: 20px;
  line-height: 1.15;
  padding: 0 30px;
  text-align: center;
`;

const formatDate = date => moment(date).format('DD/MM/YY');

const ExportDate = ({ startDate, endDate }) => {
  const date = String(moment());
  return (
    <ExportDateText>
      {startDate &&
        endDate &&
        `Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}. `}
      Exported {date}
    </ExportDateText>
  );
};

ExportDate.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

ExportDate.defaultProps = {
  startDate: null,
  endDate: null,
};

export class EnlargedDialogContent extends PureComponent {
  constructor(props) {
    super(props);

    this.onItemClick = this.onItemClick.bind(this);
    this.renderPeriodSelector = this.renderPeriodSelector.bind(this);
    this.onSetDateRange = this.onSetDateRange.bind(this);
  }

  onItemClick(chartItem) {
    const { onDrillDown } = this.props;
    onDrillDown(chartItem);
  }

  onSetDateRange(startDate, endDate) {
    const { onSetDateRange } = this.props;
    onSetDateRange(startDate, endDate);
  }

  isExportable() {
    const { viewContent, isDrilledDown } = this.props;
    return (getIsMatrix(viewContent) || viewContent.type === 'chart') && !isDrilledDown;
  }

  renderTitle() {
    const { viewContent, organisationUnitName, isExporting } = this.props;
    let titleText;
    if (getIsMatrix(viewContent)) {
      return null;
    }

    const { name, periodGranularity } = viewContent;

    if (viewContent.entityHeader === '') titleText = `${viewContent.name}`;
    else if (viewContent.entityHeader)
      titleText = `${viewContent.name}, ${viewContent.entityHeader}`;
    else titleText = `${name}${organisationUnitName ? `, ${organisationUnitName} ` : ''}`;

    const style = {
      textAlign: 'center',
      color: isExporting ? DARK_BLUE : WHITE,
    };

    return (
      <DialogTitle style={style}>
        <span style={styles.titleText}>{titleText}</span>
        {periodGranularity && this.renderPeriodSelector()}
      </DialogTitle>
    );
  }

  renderBody() {
    const { viewContent, errorMessage } = this.props;
    const noData = viewContent.data && viewContent.data.length === 0;

    if (errorMessage) {
      return <StyledAlert severity="error">{errorMessage}</StyledAlert>;
    }

    if (noData) {
      return <StyledAlert severity="info">No data found for this time period</StyledAlert>;
    }

    return this.renderBodyContent();
  }

  renderBodyContent() {
    const { viewContent, onCloseOverlay, organisationUnitName, isExporting } = this.props;
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
    }

    return <ViewWrapper {...viewProps} isExporting={isExporting} />;
  }

  renderDescription() {
    const { viewContent, isExporting } = this.props;
    const { description } = viewContent;

    if (isExporting || !description) {
      return null;
    }

    return <Description>{description}</Description>;
  }

  renderToolbar() {
    const { onCloseOverlay, onOpenExportDialog, CloseIcon, toolbarStyle, isExporting } = this.props;

    if (isExporting) {
      return null;
    }

    return (
      <div style={{ ...styles.toolbar, ...toolbarStyle }}>
        {this.isExportable() ? (
          <IconButton
            style={styles.toolbarButton}
            iconStyle={styles.toolbarButtonIcon}
            onClick={onOpenExportDialog}
          >
            <DownloadIcon />
          </IconButton>
        ) : null}
        <IconButton
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
    const { onSetDateRange, isLoading, viewContent, isExporting } = this.props;
    const { periodGranularity, startDate, endDate } = viewContent;

    const datePickerLimits = getLimits(viewContent.periodGranularity, viewContent.datePickerLimits);

    return (
      <div style={styles.periodSelector(isExporting)}>
        <DateRangePicker
          align="center"
          granularity={periodGranularity}
          onSetDates={onSetDateRange}
          startDate={startDate}
          endDate={endDate}
          min={datePickerLimits.startDate}
          max={datePickerLimits.endDate}
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
    if (!this.props.viewContent) return <LoadingIndicator />;

    const isMatrix = getIsMatrix(this.props.viewContent);
    const { isExporting, exportRef, viewContent, drillDownOverlay } = this.props;

    const contentStyle = {
      overflowY: isExporting ? 'visible' : 'auto',
      padding: isMatrix ? 0 : 20,
    };

    const getBodyStyle = () => {
      if (isMatrix) return styles.matrixContent;
      if (viewContent.chartType) return styles.chartContent;
      return {}; // No custom styling for other types of dialog content
    };

    return (
      <div
        data-testid="enlarged-dialog"
        ref={exportRef}
        style={{ backgroundColor: isExporting ? WHITE : DARK_BLUE }}
      >
        {this.renderToolbar()}
        {this.renderTitle()}
        {this.renderDescription()}
        <DialogContent style={contentStyle}>
          <div style={getBodyStyle()}>
            {this.renderBody()}
            {drillDownOverlay}
          </div>
          {this.renderPeriodRange()}
        </DialogContent>
        {isExporting && (
          <ExportDate startDate={viewContent.startDate} endDate={viewContent.endDate} />
        )}
      </div>
    );
  }
}

const styles = {
  titleText: {
    display: 'inline-block',
    textAlign: 'center',
    color: 'inherit',
    marginTop: '18px',
    marginBottom: '10px',
  },
  chartContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
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
  periodSelector: isExporting => {
    return {
      fontSize: 14,
      display: 'flex',
      justifyContent: 'center',
      marginTop: 5,
      marginBottom: 5,
      overflow: 'hidden',
      transition: isExporting ? '' : '0.5s height ease',
      height: isExporting ? '0' : '46px',
    };
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
  onOpenExportDialog: PropTypes.func,
  organisationUnitName: PropTypes.string,
  onDrillDown: PropTypes.func,
  onSetDateRange: PropTypes.func,
  isDrilledDown: PropTypes.bool,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  isVisible: PropTypes.bool,
  isExporting: PropTypes.bool,
  drillDownOverlay: PropTypes.element,
  CloseIcon: PropTypes.func,
  exportRef: PropTypes.object,
  toolbarStyle: PropTypes.shape({}),
};

EnlargedDialogContent.defaultProps = {
  onDrillDown: () => {},
  onSetDateRange: () => {},
  isDrilledDown: false,
  isLoading: false,
  errorMessage: null,
  isVisible: false,
  isExporting: false,
  drillDownOverlay: null,
  organisationUnitName: '',
  onOpenExportDialog: null,
  CloseIcon: DefaultCloseIcon,
  toolbarStyle: {},
  viewContent: null,
  exportRef: null,
};
