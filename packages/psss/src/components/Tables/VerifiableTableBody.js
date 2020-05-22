/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import {
  ControlledExpandableTableRow,
  ExpandableTableBody,
  TableRowExpansionContainer,
  WarningButton,
} from '@tupaia/ui-components';
import { BorderlessTableRow } from './TableTypes';
import * as COLORS from '../../theme/colors';

const VerifiedAlert = styled.div`
  background-color: ${props => props.theme.palette.warning.light};
  color: ${props => props.theme.palette.warning.main};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  line-height: 1;
  letter-spacing: 0;
  font-weight: 500;
  padding: 1em 1.5em;
  box-shadow: none;
  width: 100%;

  .MuiSvgIcon-root {
    margin-right: 5px;
  }
`;

const TableRow = props => {
  const { data, rowIndex } = props;
  const indicator = data[rowIndex].percentageChange;
  const initialStatus = indicator > '10' ? 'expanded' : 'closed';
  const [status, setStatus] = useState(initialStatus);

  const WarningButtonComponent = () => {
    if (status === 'verified') {
      return (
        <VerifiedAlert>
          <CheckCircleIcon /> Verified
        </VerifiedAlert>
      );
    }

    const handelClick = () => {
      setStatus('verified');
    };

    return (
      <WarningButton fullWidth onClick={handelClick}>
        Please Verify Now
      </WarningButton>
    );
  };

  const StyledExpansionContainer = styled(TableRowExpansionContainer)`
    td {
      border: none;
    }

    > .MuiTableCell-root {
      background: white;
      padding: 0 1rem 1rem;
      border-radius: 3px;
      border: 1px solid ${status === 'verified' ? COLORS.LIGHT_RED : COLORS.RED};
    }
  `;

  return (
    <BorderlessTableRow
      {...props}
      expanded={status === 'expanded' || status === 'verified'}
      SubComponent={WarningButtonComponent}
      ExpansionContainer={StyledExpansionContainer}
    />
  );
};

TableRow.propTypes = {
  data: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
};

export const VerifiableTableBody = ({ tableState, ...props }) => {
  const Row = tableState === 'editable' ? BorderlessTableRow : TableRow;
  return <ExpandableTableBody TableRow={Row} {...props} />;
};

VerifiableTableBody.propTypes = {
  tableState: PropTypes.string,
};

VerifiableTableBody.defaultProps = {
  tableState: 'static',
};
