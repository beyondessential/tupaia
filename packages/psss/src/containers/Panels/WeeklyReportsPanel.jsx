import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import Collapse from '@material-ui/core/Collapse';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import { ButtonSelect, Card, Alert, Button, LightPrimaryButton } from '@tupaia/ui-components';
import {
  SiteAddress,
  Drawer,
  DrawerFooter,
  DrawerTray,
  DrawerHeader,
  EditableTableProvider,
  AlertCreatedModal,
} from '../../components';
import {
  closeWeeklyReportsPanel,
  checkWeeklyReportsPanelIsOpen,
  getActiveWeek,
  getCountryName,
} from '../../store';
import * as COLORS from '../../constants/colors';
import { REPORT_STATUSES, TABLE_STATUSES } from '../../constants';
import { WeeklyReportTable } from '../Tables/WeeklyReportTable';
import { countryFlagImage, getWeekNumberByPeriod, getDisplayDatesByPeriod } from '../../utils';
import {
  useConfirmWeeklyReport,
  useSingleWeeklyReport,
  useSitesSingleWeeklyReport,
} from '../../api';

const SiteReportsSection = styled.section`
  position: relative;
  padding: 1.8rem 1.25rem;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};
  opacity: ${props => (props.disabled ? '0.5' : 1)};

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

const CountryReportsSection = styled(SiteReportsSection)`
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

const toCommaList = values =>
  values
    .join(', ')
    .toUpperCase()
    .replace(/,(?!.*,)/gim, ' and');

const PANEL_STATUSES = {
  INITIAL: 'initial',
  SAVING: 'saving',
  SUBMIT_ATTEMPTED: 'submitAttempted',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const WeeklyReportsPanelComponent = React.memo(
  ({ isOpen, handleClose, activeWeek, verifiedStatuses, pageQueryKey }) => {
    const [panelStatus, setPanelStatus] = useState(PANEL_STATUSES.INITIAL);
    const [countryTableStatus, setCountryTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [sitesTableStatus, setSitesTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const { countryCode } = useParams();
    const countryName = useSelector(state => getCountryName(state, countryCode));

    const {
      isFetching,
      isLoading,
      data: countryData,
      syndromes: countrySyndromesData,
      reportStatus,
      unVerifiedAlerts,
      error: countryWeekError,
    } = useSingleWeeklyReport(countryCode, activeWeek, verifiedStatuses, pageQueryKey);

    const { isFetching: isSiteDataFetching, data: siteData } = useSitesSingleWeeklyReport(
      countryCode,
      activeWeek,
      verifiedStatuses,
      pageQueryKey,
    );

    const { mutate: confirmReport, isLoading: isConfirming, reset, error } = useConfirmWeeklyReport(
      countryCode,
      activeWeek,
    );

    // Reset local state when the panel opens and closes
    useEffect(() => {
      reset();
      setPanelStatus(PANEL_STATUSES.INITIAL);
      setCountryTableStatus(TABLE_STATUSES.STATIC);
    }, [isOpen]);

    const handleSubmit = async isVerified => {
      if (isVerified) {
        const response = await confirmReport();
        if (response?.alertData?.createdAlerts?.length > 0) {
          setAlerts(response?.alertData?.createdAlerts);
          setIsModalOpen(true);
        }
      } else {
        setPanelStatus(PANEL_STATUSES.SUBMIT_ATTEMPTED);
      }
    };

    const handleChangeSite = useCallback(
      siteIndex => {
        setActiveSiteIndex(siteIndex);
        setSitesTableStatus(TABLE_STATUSES.STATIC);
      },
      [setActiveSiteIndex, setSitesTableStatus],
    );

    const isVerified = isFetching || unVerifiedAlerts.length === 0;
    const showSites = activeWeek !== null && siteData.length > 0;
    const selectedSite = siteData[activeSiteIndex];
    const isSaving =
      countryTableStatus === TABLE_STATUSES.SAVING || sitesTableStatus === TABLE_STATUSES.SAVING;
    const verificationRequired = panelStatus === PANEL_STATUSES.SUBMIT_ATTEMPTED && !isVerified;
    const date = `Week ${getWeekNumberByPeriod(activeWeek)} ${getDisplayDatesByPeriod(activeWeek)}`;
    const unVerifiedList = toCommaList(unVerifiedAlerts);
    const confirmIsDisabled =
      isSaving || isLoading || isFetching || countryTableStatus === TABLE_STATUSES.EDITABLE;

    return (
      <StyledDrawer open={isOpen} onClose={handleClose} data-testid="weekly-reports-panel">
        <DrawerTray heading="Upcoming report" onClose={handleClose} />
        <DrawerHeader
          trayHeading="Upcoming report"
          heading={countryName}
          date={date}
          avatarUrl={countryFlagImage(countryCode)}
        />
        <Collapse in={!isVerified}>
          <Alert severity="error" variant="standard">
            {unVerifiedList} Above Threshold. Please review and verify data.
          </Alert>
        </Collapse>
        <CountryReportsSection disabled={isSaving} data-testid="country-reports">
          <EditableTableProvider
            tableStatus={countryTableStatus}
            setTableStatus={setCountryTableStatus}
          >
            <WeeklyReportTable
              data={countrySyndromesData}
              fetchError={countryWeekError && countryWeekError.message}
              isFetching={isLoading || isFetching}
              sitesReported={countryData['Sites Reported']}
              totalSites={countryData.Sites}
              weekNumber={activeWeek}
            />
          </EditableTableProvider>
        </CountryReportsSection>
        {showSites && (
          <SiteReportsSection
            disabled={countryTableStatus === TABLE_STATUSES.EDITABLE || isSaving}
            data-testid="site-reports"
          >
            <ButtonSelect
              id="active-site"
              options={siteData}
              onChange={handleChangeSite}
              index={activeSiteIndex}
            />
            <SiteAddress address={selectedSite.address} contact={selectedSite.contact} />
            <Card variant="outlined" mb={3}>
              <EditableTableProvider
                tableStatus={sitesTableStatus}
                setTableStatus={setSitesTableStatus}
              >
                <WeeklyReportTable
                  data={selectedSite.syndromes}
                  isFetching={isSiteDataFetching}
                  isSiteReport
                  siteCode={selectedSite.code}
                  weekNumber={activeWeek}
                />
              </EditableTableProvider>
            </Card>
          </SiteReportsSection>
        )}
        <DrawerFooter disabled={confirmIsDisabled}>
          <Fade in={verificationRequired || error}>
            <PositionedAlert severity="error">
              {verificationRequired
                ? `${unVerifiedList} Above Threshold. Please review and verify data.`
                : error?.message}
            </PositionedAlert>
          </Fade>
          {reportStatus === REPORT_STATUSES.SUBMITTED ? (
            <LightPrimaryButton startIcon={<CheckCircleIcon />} disabled fullWidth>
              Confirmed
            </LightPrimaryButton>
          ) : (
            <>
              <Button
                fullWidth
                onClick={() => handleSubmit(isVerified)}
                disabled={verificationRequired}
                isLoading={isConfirming}
                loadingText="Saving"
              >
                Confirm now
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
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  activeWeek: PropTypes.string.isRequired,
  verifiedStatuses: PropTypes.array.isRequired,
  pageQueryKey: PropTypes.PropTypes.shape({
    startWeek: PropTypes.string.isRequired,
    endWeek: PropTypes.string.isRequired,
  }),
};

WeeklyReportsPanelComponent.defaultProps = {
  pageQueryKey: null,
};

const mapStateToProps = state => ({
  isOpen: checkWeeklyReportsPanelIsOpen(state),
  activeWeek: getActiveWeek(state),
  verifiedStatuses: state.weeklyReports.verifiedStatuses,
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(closeWeeklyReportsPanel()),
});

export const WeeklyReportsPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportsPanelComponent);
