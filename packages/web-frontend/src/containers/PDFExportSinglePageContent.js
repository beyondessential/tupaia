/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Alert } from '../components/Alert';
import { getIsMatrix, getExportViewWrapper, VIEW_CONTENT_SHAPE } from '../components/View';
import { DARK_BLUE, WHITE } from '../styles';
import { LoadingIndicator } from './Form/common';
import { DialogTitleWrapper } from '../components/DialogTitleWrapper';
import { transformDataForViewType } from '../components/View/utils';
import { fetchDashboardItemData } from '../actions';

const StyledAlert = styled(Alert)`
  display: inline-flex;
  min-width: 240px;
  margin-top: 3rem;
`;

const Description = styled(DialogContentText)`
  margin-top: 0;
  margin-bottom: 20px;
  line-height: 1.15;
  padding: 0 30px;
  text-align: center;
`;

const Wrapper = styled.div`
  background: WHITE;
  margin: 0px 100px;
`;

const PDFExportSinglePageContent = ({
  viewContent,
  organisationUnitName,
  isExporting,
  fetchContent,
  errorMessage,
}) => {
  const renderTitle = () => {
    let titleText;
    if (getIsMatrix(viewContent)) {
      return null;
    }

    const { name, reference } = viewContent;

    if (viewContent.entityHeader === '') titleText = `${viewContent.name}`;
    else if (viewContent.entityHeader)
      titleText = `${viewContent.name}, ${viewContent.entityHeader}`;
    else titleText = `${name}${organisationUnitName ? `, ${organisationUnitName} ` : ''}`;

    return (
      <DialogTitleWrapper
        titleText={titleText}
        color={isExporting ? DARK_BLUE : WHITE}
        reference={reference}
        isExporting={isExporting}
      />
    );
  };

  const renderBody = () => {
    const noData = viewContent.data && viewContent.data.length === 0;

    if (errorMessage) {
      return <StyledAlert severity="error">{errorMessage}</StyledAlert>;
    }

    if (noData) {
      return <StyledAlert severity="info">No data found for this time period</StyledAlert>;
    }

    return renderBodyContent();
  };

  const renderBodyContent = () => {
    const ViewWrapper = getExportViewWrapper(viewContent);
    const newViewContent = transformDataForViewType(viewContent);
    const viewProps = {
      viewContent: newViewContent,
      isPDFExporting: true,
    };
    if (getIsMatrix(viewContent)) {
      viewProps.organisationUnitName = organisationUnitName;
    }

    return <ViewWrapper {...viewProps} isExporting={isExporting} />;
  };

  const renderDescription = () => {
    const { description } = viewContent;

    if (isExporting || !description) {
      return null;
    }

    return <Description>{description}</Description>;
  };

  if (!viewContent) return <LoadingIndicator />;

  const isMatrix = getIsMatrix(viewContent);

  const contentStyle = {
    overflowY: isExporting ? 'visible' : 'auto',
    padding: isMatrix ? 0 : '0 25px 20px',
  };

  const getBodyStyle = () => {
    if (isExporting) return {};
    if (isMatrix) return styles.matrixContent;
    if (viewContent.chartType) return styles.chartContent;
    return {}; // No custom styling for other types of dialog content
  };

  useEffect(() => {
    if (!viewContent || isEmpty(viewContent.data)) {
      fetchContent();
    }
  }, []);

  return (
    <Wrapper>
      {renderTitle()}
      {renderDescription()}
      <DialogContent style={contentStyle}>
        <div style={getBodyStyle()}>{renderBody()}</div>
      </DialogContent>
    </Wrapper>
  );
};

const styles = {
  chartContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 390,
  },
  matrixContent: {
    height: '80vh',
  },
};

PDFExportSinglePageContent.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  organisationUnitName: PropTypes.string,
  fetchContent: PropTypes.func,
  errorMessage: PropTypes.string,
  isExporting: PropTypes.bool,
};

PDFExportSinglePageContent.defaultProps = {
  fetchContent: () => {},
  errorMessage: null,
  isExporting: false,
  organisationUnitName: '',
  viewContent: null,
};

const mapStateToProps = (state, ownProps) => {
  return ownProps;
};

const mapDispatchToProps = (dispatch, { viewContent, infoViewKey }) => {
  const { organisationUnitCode, dashboardCode, code } = viewContent;
  return {
    fetchContent: () =>
      dispatch(fetchDashboardItemData(organisationUnitCode, dashboardCode, code, infoViewKey)),
    dispatch, // Necessary for merge props.
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PDFExportSinglePageContent);
