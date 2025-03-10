import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { Tooltip } from '@tupaia/ui-components';
import { Alarm, CheckCircleOutline, Restore } from '@material-ui/icons';
import { REPORT_STATUSES } from '../../../constants';
import * as COLORS from '../../../constants/colors';
import { openWeeklyReportsPanel } from '../../../store';

const StatusStyles = css`
  display: inline-flex;
  color: ${props => props.color};
  align-items: center;
  text-transform: uppercase;
  font-weight: 500;
  font-size: 0.6875rem;
  line-height: 1;
  padding-left: 1rem;
  text-align: left;
  width: 100%;

  .MuiSvgIcon-root {
    width: 1.375rem;
    height: 1.375rem;
    margin-right: 0.3125rem;
  }
`;

const Status = styled.div`
  ${StatusStyles};
`;

const ResubmitButton = styled(Button)`
  ${StatusStyles};
  color: #3884b8;

  .MuiSvgIcon-root {
    margin-left: 0.45rem;
  }
`;

const UnderlinedWrapper = styled.span`
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

export const StatusCellComponent = ({ status, period, handleOpen }) => {
  if (status === REPORT_STATUSES.OVERDUE) {
    return (
      <Status color={COLORS.ORANGE}>
        <Alarm />
        {status}
      </Status>
    );
  }

  if (status === REPORT_STATUSES.RESUBMIT) {
    return (
      <Tooltip title="The data has changed, you need to resubmit">
        <ResubmitButton onClick={() => handleOpen(period)}>
          <Restore />
          <UnderlinedWrapper>Resubmit</UnderlinedWrapper>
        </ResubmitButton>
      </Tooltip>
    );
  }

  return (
    <Status color={COLORS.TEXT_LIGHTGREY}>
      <CheckCircleOutline />
      {status}
    </Status>
  );
};

StatusCellComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  period: PropTypes.string.isRequired,
  status: PropTypes.string,
};

StatusCellComponent.defaultProps = {
  status: REPORT_STATUSES.SUBMITTED,
};

const mapDispatchToProps = dispatch => ({
  handleOpen: period => dispatch(openWeeklyReportsPanel(period)),
});

export const StatusCell = connect(null, mapDispatchToProps)(StatusCellComponent);
