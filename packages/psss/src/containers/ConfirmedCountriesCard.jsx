import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { CircleMeter, Card, CardContent, CardHeader } from '@tupaia/ui-components';
import Skeleton from '@material-ui/lab/Skeleton';
import { useConfirmedCountries } from '../api/queries';
import { getCountryCodes } from '../store';

const StyledCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ReportsSubmittedCardComponent = React.memo(({ countryCodes }) => {
  const { isLoading, sitesReported, sites, currentWeekNumber } = useConfirmedCountries(
    countryCodes,
  );

  return (
    <Card variant="outlined">
      <CardHeader title="Current Confirmed Reports" label={`Week ${currentWeekNumber}`} />
      <StyledCardContent>
        <Typography variant="h3">
          {isLoading ? (
            <Skeleton animation="wave" style={{ height: 36, width: 160 }} />
          ) : (
            `${sitesReported}/${sites} Countries`
          )}
        </Typography>
        <CircleMeter value={sitesReported} total={sites} />
      </StyledCardContent>
    </Card>
  );
});

ReportsSubmittedCardComponent.propTypes = {
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const ConfirmedCountriesCard = connect(mapStateToProps)(ReportsSubmittedCardComponent);
