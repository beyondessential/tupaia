/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import {
  ExpandableTableBody,
  TableRowExpansionContainer,
  WarningButton,
  Table,
} from '@tupaia/ui-components';
import { BorderlessTableRow } from './TableTypes';
import { EditableTableContext } from './EditableTable';
import * as COLORS from '../../theme/colors';

const VerifiedAlert = styled.div`
  background-color: ${props => props.theme.palette.warning.light};
  color: ${props => props.theme.palette.warning.main};
  display: flex;
  align-items: center;
  height: 45px;
  justify-content: center;
  border-radius: 3px;
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

const Wrapper = styled.div`
  padding: 0 1em 2.25rem;

  button {
    position: relative;
    z-index: 1;
  }

  &:after {
    position: absolute;
    border: 1px solid ${props => (props.status === 'verified' ? COLORS.LIGHT_RED : COLORS.RED)};
    content: '';
    display: block;
    top: 0;
    bottom: 1rem;
    left: 0;
    right: 0;
    border-radius: 3px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  }
`;

const StyledExpansionContainer = styled(TableRowExpansionContainer)`
  td {
    position: relative;
    border: none;
    background: none;
    box-shadow: none;
  }
`;

const VerifiableTableRow = props => {
  const { data, rowIndex } = props;
  const indicator = data[rowIndex].percentageChange;
  const initialStatus = indicator > '10' ? 'expanded' : 'closed';
  const [status, setStatus] = useState(initialStatus);

  const WarningButtonComponent = () => {
    if (status === 'verified') {
      return (
        <Wrapper>
          <VerifiedAlert>
            <CheckCircleIcon /> Verified
          </VerifiedAlert>
        </Wrapper>
      );
    }

    const handelClick = () => {
      setStatus('verified');
    };

    return (
      <Wrapper>
        <WarningButton fullWidth onClick={handelClick}>
          Please Verify Now
        </WarningButton>
      </Wrapper>
    );
  };

  return (
    <BorderlessTableRow
      {...props}
      expanded={status === 'expanded' || status === 'verified'}
      SubComponent={WarningButtonComponent}
      ExpansionContainer={StyledExpansionContainer}
    />
  );
};

VerifiableTableRow.propTypes = {
  data: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
};

// maybe take a variant prop tp switch between rowTypes or pass in a custom row type?
export const VerifiableTable = () => {
  const { editableColumns, data, tableState } = useContext(EditableTableContext);
  const Row = tableState === 'editable' ? BorderlessTableRow : VerifiableTableRow;
  const Body = bodyProps => <ExpandableTableBody TableRow={Row} {...bodyProps} />;

  return (
    <Table
      Header={false}
      Body={Body}
      columns={editableColumns}
      data={data}
      tableState={tableState}
    />
  );
};
