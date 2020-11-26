/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { queryCache, useMutation } from 'react-query';
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
  ComingSoon,
} from '../../components';
import {
  closeWeeklyReportsPanel,
  checkWeeklyReportsPanelIsOpen,
  getUnVerifiedSyndromes,
  getActiveWeekId,
} from '../../store';
import * as COLORS from '../../constants/colors';
import { CountryReportTable, SiteReportTable } from '../Tables';
import { countryFlagImage, getCountryName } from '../../utils';
import { useTableQuery } from '../../hooks';
import { FakeAPI } from '../../api';

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

const SiteReportsSection = styled.section`
  // Todo: remove temp styling for coming soon blurred area
  margin-top: 50px;
  margin-bottom: 20px;
  // ---

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

const TABLE_STATUSES = {
  STATIC: 'static',
  SAVING: 'saving',
};

const PANEL_STATUSES = {
  INITIAL: 'initial',
  SAVING: 'saving',
  SUBMIT_ATTEMPTED: 'submitAttempted',
  SUCCESS: 'success',
};

const toCommaList = values =>
  values
    .join(', ')
    .toUpperCase()
    .replace(/,(?!.*,)/gim, ' and');

const getSyndromeAlerts = (countryData, weekNumber) => {
  if (countryData.length === 0 || !weekNumber) {
    return [];
  }

  return countryData[weekNumber].syndromes.filter(s => s.isAlert);
};

export const WeeklyReportsPanelComponent = React.memo(
  ({ countryData, isOpen, handleClose, weekNumber, unVerifiedSyndromes }) => {
    const [panelStatus, setPanelStatus] = useState(PANEL_STATUSES.INITIAL);
    const [countryTableStatus, setCountryTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [sitesTableStatus, setSitesTableStatus] = useState(TABLE_STATUSES.STATIC);
    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { countryCode } = useParams();
    const { data: sitesData } = useTableQuery('sites', {
      countryCode,
      weekNumber,
    });

    const [confirmReport] = useMutation(() => FakeAPI.post(), {
      onSuccess: () => {
        if (getSyndromeAlerts(countryData, weekNumber)) {
          setIsModalOpen(true);
        }
        setPanelStatus(PANEL_STATUSES.SUCCESS);
        queryCache.invalidateQueries('country-weeks', { countryCode, weekNumber });
      },
    });

    const isVerified = unVerifiedSyndromes.length === 0;

    const handleSubmit = () => {
      if (isVerified) {
        setPanelStatus(PANEL_STATUSES.SAVING);
        confirmReport();
      } else {
        setPanelStatus(PANEL_STATUSES.SUBMIT_ATTEMPTED);
      }
    };

    const showSitesSection = weekNumber !== null && sitesData?.data?.length > 0;
    const showCountriesSection = weekNumber !== null && countryData?.length > 0;

    const isSaving =
      countryTableStatus === TABLE_STATUSES.SAVING || sitesTableStatus === TABLE_STATUSES.SAVING;
    const verificationRequired = panelStatus === PANEL_STATUSES.SUBMIT_ATTEMPTED && !isVerified;
    const unVerifiedSyndromesList = toCommaList(unVerifiedSyndromes);

    return (
      <StyledDrawer open={isOpen} onClose={handleClose}>
        <DrawerTray heading="Upcoming report" onClose={handleClose} />
        <DrawerHeader
          trayHeading="Upcoming report"
          heading={getCountryName(countryCode)}
          date="Week 9 Feb 25 - Mar 1, 2020"
          avatarUrl={countryFlagImage('as')}
        />
        <Collapse in={!isVerified}>
          <Alert severity="error" variant="standard">
            {unVerifiedSyndromesList} Above Threshold. Please review and verify data.
          </Alert>
        </Collapse>
        <CountryReportsSection disabled={isSaving} data-testid="country-reports">
          {showCountriesSection && (
            <EditableTableProvider
              columns={columns}
              data={countryData[weekNumber].syndromes}
              tableStatus={countryTableStatus}
            >
              <CountryReportTable
                tableStatus={countryTableStatus}
                setTableStatus={setCountryTableStatus}
                sitesReported={countryData[weekNumber].sitesReported}
                totalSites={countryData[weekNumber].totalSites}
                weekNumber={weekNumber}
              />
            </EditableTableProvider>
          )}
        </CountryReportsSection>
        {showSitesSection && (
          <SiteReportsSection disabled={isSaving} data-testid="site-reports">
            <ComingSoon text="The Sentinel Case data section will allow you to explore sentinel site data." />
            <ButtonSelect
              id="active-site"
              options={sitesData.data}
              onChange={setActiveSiteIndex}
              index={activeSiteIndex}
            />
            <SiteAddress
              address={sitesData.data[activeSiteIndex].address}
              contact={sitesData.data[activeSiteIndex].contact}
            />
            <Card variant="outlined" mb={3}>
              <EditableTableProvider
                columns={columns}
                data={sitesData.data[activeSiteIndex].syndromes}
                tableStatus={sitesTableStatus}
              >
                <SiteReportTable
                  tableStatus={sitesTableStatus}
                  setTableStatus={setSitesTableStatus}
                  weekNumber={weekNumber}
                />
              </EditableTableProvider>
            </Card>
          </SiteReportsSection>
        )}
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
              <Button
                fullWidth
                onClick={handleSubmit}
                disabled={verificationRequired}
                isLoading={panelStatus === PANEL_STATUSES.SAVING}
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
          alerts={getSyndromeAlerts(countryData, weekNumber)}
          handleClose={() => setIsModalOpen(false)}
        />
      </StyledDrawer>
    );
  },
);

WeeklyReportsPanelComponent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  weekNumber: PropTypes.number,
  unVerifiedSyndromes: PropTypes.array.isRequired,
  countryData: PropTypes.array.isRequired,
};

WeeklyReportsPanelComponent.defaultProps = {
  weekNumber: null,
};

const mapStateToProps = (state, { countryData }) => ({
  weekNumber: getActiveWeekId(state),
  isOpen: checkWeeklyReportsPanelIsOpen(state),
  unVerifiedSyndromes: getUnVerifiedSyndromes(state, countryData),
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(closeWeeklyReportsPanel()),
});

export const WeeklyReportsPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyReportsPanelComponent);
