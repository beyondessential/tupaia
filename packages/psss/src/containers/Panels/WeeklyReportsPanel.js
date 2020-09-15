/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import Collapse from '@material-ui/core/Collapse';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import {
  EditableTableProvider,
  ButtonSelect,
  Card,
  Alert,
  Button,
  LightPrimaryButton,
} from '@tupaia/ui-components';
import {
  SiteAddress,
  Drawer,
  DrawerFooter,
  DrawerTray,
  DrawerHeader,
  PercentageChangeCell,
  AlertCreatedModal,
} from '../../components';
import {
  getSitesForWeek,
  getActiveWeekCountryData,
  closeWeeklyReportsPanel,
  checkWeeklyReportsPanelIsOpen,
  getUnVerifiedSyndromes,
  confirmWeeklyReportsData,
  getSyndromeAlerts,
} from '../../store';
import * as COLORS from '../../constants/colors';
import { CountryReportTable, SiteReportTable } from '../Tables';
import { countryFlagImage } from '../../utils';

const columns = [
  {
    title: 'Syndromes',
    key: 'title',
    sortable: false,
  },
  {
    title: '',
    key: 'percentageChange',
    CellComponent: PercentageChangeCell,
    sortable: false,
    width: '80px',
  },
  {
    title: 'Total Cases',
    key: 'totalCases',
    editable: true,
    sortable: false,
    width: '80px',
  },
];

const MainSection = styled.section`
  position: relative;
  padding: 1.8rem 1.25rem;

  &:after {
    display: ${props => (props.disabled ? 'block' : 'none')};
    position: absolute;
    content: '';
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    opacity: 0.5;
  }
`;

const GreySection = styled(MainSection)`
  background: ${COLORS.LIGHTGREY};
  box-shadow: 0 1px 0 ${COLORS.GREY_DE};
  padding: 1.6rem 1.25rem;
`;

const HelperText = styled(Typography)`
  margin-top: 1rem;
  font-size: 0.8125rem;
  line-height: 0.9375rem;
  color: ${COLORS.TEXT_MIDGREY};
`;

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper > div {
    padding-bottom: 10rem;
  }
`;

const PositionedAlert = styled(Alert)`
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
`;

const TABLE_STATUSES = {
  STATIC: 'static',
  SAVING: 'saving',
};

const PANEL_STATUSES = {
  INITIAL: 'initial',
  SUBMIT_ATTEMPTED: 'submitAttempted',
  SUCCESS: 'success',
};

const toCommaList = values =>
  values
    .join(', ')
    .toUpperCase()
    .replace(/,(?!.*,)/gim, ' and');

export const WeeklyReportsPanelComponent = React.memo(
  ({ countryData, sitesData, isOpen, handleClose, unVerifiedSyndromes, alerts, handleConfirm }) => {
    const [panelStatus, setPanelStatus] = useState(PANEL_STATUSES.INITIAL);
    const [countryTableStatus, setCountryTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [sitesTableStatus, setSitesTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isVerified = unVerifiedSyndromes.length === 0;
    const hasAlerts = alerts.length > 0;

    const handleSubmit = useCallback(() => {
      if (isVerified) {
        handleConfirm();

        if (hasAlerts) {
          setIsModalOpen(true);
        }

        setPanelStatus(PANEL_STATUSES.SUCCESS);
      } else {
        setPanelStatus(PANEL_STATUSES.SUBMIT_ATTEMPTED);
      }
    }, [isVerified, handleConfirm, hasAlerts, setIsModalOpen, setPanelStatus]);

    if (!countryData.syndromes || countryData.syndromes.length === 0 || sitesData.length === 0) {
      return null;
    }

    const activeSite = sitesData[activeSiteIndex];
    const { syndromes: syndromesData } = activeSite;

    const isSaving =
      countryTableStatus === TABLE_STATUSES.SAVING || sitesTableStatus === TABLE_STATUSES.SAVING;
    const verificationRequired = panelStatus === PANEL_STATUSES.SUBMIT_ATTEMPTED && !isVerified;
    const unVerifiedSyndromesList = toCommaList(unVerifiedSyndromes);

    return (
      <StyledDrawer open={isOpen} onClose={handleClose}>
        <DrawerTray heading="Upcoming report" onClose={handleClose} />
        <DrawerHeader
          trayHeading="Upcoming report"
          heading="American Samoa"
          date="Week 9 Feb 25 - Mar 1, 2020"
          avatarUrl={countryFlagImage('as')}
        />
        <Collapse in={!isVerified}>
          <Alert severity="error" variant="standard">
            {unVerifiedSyndromesList} Above Threshold. Please review and verify data.
          </Alert>
        </Collapse>
        <GreySection disabled={isSaving} data-testid="country-reports">
          <EditableTableProvider
            columns={columns}
            data={countryData.syndromes}
            tableStatus={countryTableStatus}
          >
            <CountryReportTable
              tableStatus={countryTableStatus}
              setTableStatus={setCountryTableStatus}
              sitesReported={countryData.sitesReported}
              totalSites={countryData.totalSites}
            />
          </EditableTableProvider>
        </GreySection>
        <MainSection disabled={isSaving} data-testid="site-reports">
          <ButtonSelect
            id="active-site"
            options={sitesData}
            onChange={setActiveSiteIndex}
            index={activeSiteIndex}
          />
          <SiteAddress address={activeSite.address} contact={activeSite.contact} />
          <Card variant="outlined" mb={3}>
            <EditableTableProvider
              columns={columns}
              data={syndromesData}
              tableStatus={sitesTableStatus}
            >
              <SiteReportTable
                tableStatus={sitesTableStatus}
                setTableStatus={setSitesTableStatus}
              />
            </EditableTableProvider>
          </Card>
        </MainSection>
        <DrawerFooter disabled={isSaving}>
          <Fade in={verificationRequired}>
            <PositionedAlert severity="error">
              {unVerifiedSyndromesList} Above Threshold. Please review and verify data.
            </PositionedAlert>
          </Fade>
          {panelStatus === PANEL_STATUSES.SUCCESS ? (
            <LightPrimaryButton startIcon={<CheckCircleIcon />} disabled fullWidth>
              Confirmed
            </LightPrimaryButton>
          ) : (
            <>
              <Button fullWidth onClick={handleSubmit} disabled={verificationRequired}>
                Submit now
              </Button>
              <HelperText>Verify data to submit Weekly Report to Regional</HelperText>
            </>
          )}
        </DrawerFooter>
        <AlertCreatedModal
          isOpen={isModalOpen}
          alerts={alerts}
          handleClose={() => setIsModalOpen(false)}
        />
      </StyledDrawer>
    );
  },
);

WeeklyReportsPanelComponent.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
  countryData: PropTypes.object.isRequired,
  sitesData: PropTypes.array.isRequired,
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  alerts: PropTypes.array.isRequired,
  unVerifiedSyndromes: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  isOpen: checkWeeklyReportsPanelIsOpen(state),
  countryData: getActiveWeekCountryData(state),
  sitesData: getSitesForWeek(state),
  unVerifiedSyndromes: getUnVerifiedSyndromes(state),
  alerts: getSyndromeAlerts(state),
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(closeWeeklyReportsPanel()),
  handleConfirm: () => dispatch(confirmWeeklyReportsData()),
});

export const WeeklyReportsPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportsPanelComponent);
