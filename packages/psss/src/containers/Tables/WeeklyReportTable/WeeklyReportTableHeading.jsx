import Typography from '@material-ui/core/Typography';
import { GreyOutlinedButton, TextField, Tooltip } from '@tupaia/ui-components';

import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { EditableTableContext, FlexSpaceBetween, FlexStart } from '../../../components';
import { TABLE_STATUSES } from '../../../constants';

const FormRow = styled(FlexStart)`
  flex: 1;
  padding-left: 1rem;
`;

const ReportedSites = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
`;

const StyledTextField = styled(TextField)`
  width: 2.4rem;
  margin: 0 0.6rem;

  .MuiInputBase-input {
    font-size: 15px;
    line-height: 18px;
    padding: 0.5rem 0;
    text-align: center;
  }
`;

const SiteHeadingRow = styled(FlexSpaceBetween)`
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;

const SiteHeadingTitle = styled(Typography)`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2rem;
`;

const ErrorTooltip = styled(Tooltip)`
  & .MuiTooltip-tooltip {
    background: ${props => props.theme.palette.error.main};

    .MuiTooltip-arrow {
      color: ${props => props.theme.palette.error.main};
    }
  }
`;

/* eslint-disable react/prop-types */
const SiteHeading = ({ EditButton }) => (
  <SiteHeadingRow>
    <SiteHeadingTitle>Sentinel Cases Reported</SiteHeadingTitle>
    <EditButton />
  </SiteHeadingRow>
);

const CountryHeadingRow = ({ children }) => <FlexSpaceBetween pb={2}>{children}</FlexSpaceBetween>;

const CountryHeading = ({ EditButton, sitesReported, totalSites }) => {
  const { tableStatus } = useContext(EditableTableContext);
  const { errors, register } = useFormContext();

  if (tableStatus !== TABLE_STATUSES.EDITABLE) {
    return (
      <CountryHeadingRow>
        <Typography variant="h5">
          {sitesReported}/{totalSites} Sites Reported
        </Typography>
        <EditButton />
      </CountryHeadingRow>
    );
  }

  const numberFieldConfig = {
    required: 'Required',
    pattern: {
      value: /^\d+$/,
      message: 'Invalid character',
    },
  };

  return (
    <CountryHeadingRow>
      <FormRow>
        <ReportedSites variant="h6">Reported Sites:</ReportedSites>
        <ErrorTooltip title={errors.sitesReported?.message || ''} placement="left" open>
          <StyledTextField
            defaultValue={sitesReported}
            error={!!errors.sitesReported}
            name="sitesReported"
            inputRef={register(numberFieldConfig)}
          />
        </ErrorTooltip>
        <ReportedSites variant="h5"> / Total Sites: </ReportedSites>
        <ErrorTooltip title={errors.totalSites?.message || ''} placement="left" open>
          <StyledTextField
            defaultValue={totalSites}
            error={!!errors.totalSites}
            name="totalSites"
            inputRef={register(numberFieldConfig)}
          />
        </ErrorTooltip>
      </FormRow>
      <EditButton />
    </CountryHeadingRow>
  );
};
/* eslint-enable react/prop-types */

export const WeeklyReportTableHeading = ({
  isSiteReport,
  siteCode,
  sitesReported,
  totalSites,
  onEdit,
}) => {
  const { tableStatus } = useContext(EditableTableContext);
  const EditButton = () => (
    <GreyOutlinedButton
      onClick={onEdit}
      type="button"
      disabled={tableStatus === TABLE_STATUSES.EDITABLE}
    >
      Edit
    </GreyOutlinedButton>
  );

  return isSiteReport ? (
    <SiteHeading EditButton={EditButton} onEdit={onEdit} />
  ) : (
    <CountryHeading
      EditButton={EditButton}
      siteCode={siteCode}
      sitesReported={sitesReported}
      totalSites={totalSites}
      onEdit={onEdit}
    />
  );
};

WeeklyReportTableHeading.propTypes = {
  isSiteReport: PropTypes.bool.isRequired,
  siteCode: PropTypes.string,
  sitesReported: PropTypes.number,
  totalSites: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
};

WeeklyReportTableHeading.defaultProps = {
  sitesReported: undefined,
  totalSites: undefined,
  siteCode: '',
};
