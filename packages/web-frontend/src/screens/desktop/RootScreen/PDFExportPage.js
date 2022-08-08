import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Divider as BaseDivider } from '@material-ui/core';
import { getUniqueViewId } from '../../../utils';
import PDFExportSinglePageContent from '../../../containers/PDFExportSinglePageContent';
import { selectCurrentDashboardName } from '../../../selectors';
import { A4Page } from '../../../components/PDFExport/components/A4Page';

const Main = styled.div`
  background: #fbfbfb;
`;

const DashboardTitleContainer = styled.div`
  text-align: start;
  margin-bottom: 18px;
`;

const DashboardNameText = styled.div`
  font-weight: 500;
  font-size: 20px;
  line-height: 140%;
`;

const Divider = styled(BaseDivider)`
  background-color: black;
  height: 3px;
`;

const PDFExportPage = ({ currentGroupDashboard, viewResponses }) => {
  if (!currentGroupDashboard) return null;
  const {
    dashboardCode,
    dashboardName,
    entityName,
    entityCode: organisationUnitCode,
    project,
    items,
  } = currentGroupDashboard;

  const drillDownItemCodes = items
    .filter(view => !!view.drillDown?.itemCode)
    .map(view => view.drillDown?.itemCode);

  return (
    <Main>
      {items
        .filter(view => !drillDownItemCodes.includes(view.code))
        .map(view => {
          const infoViewKey = getUniqueViewId(organisationUnitCode, dashboardCode, view.code);
          return (
            <A4Page entityName={entityName}>
              <DashboardTitleContainer>
                <DashboardNameText>{dashboardName}</DashboardNameText>
                <Divider />
              </DashboardTitleContainer>
              <PDFExportSinglePageContent
                viewContent={{
                  ...view,
                  project,
                  dashboardCode,
                  organisationUnitCode,
                  ...viewResponses[infoViewKey],
                }}
                infoViewKey={infoViewKey}
                key={infoViewKey}
                isExporting
              />
            </A4Page>
          );
        })}
    </Main>
  );
};

PDFExportPage.propTypes = {
  currentGroupDashboard: PropTypes.object,
  viewResponses: PropTypes.object,
};

PDFExportPage.defaultProps = { currentGroupDashboard: null, viewResponses: {} };

const mapStateToProps = state => {
  const { dashboards } = state.global;
  const { viewResponses } = state.dashboard;
  const currentDashboardName = selectCurrentDashboardName(state);
  const currentGroupDashboard = dashboards.find(d => d.dashboardName === currentDashboardName);
  return { currentGroupDashboard, viewResponses };
};

export default connect(mapStateToProps)(PDFExportPage);
