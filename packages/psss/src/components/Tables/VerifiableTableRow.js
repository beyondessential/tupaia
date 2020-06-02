/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import {
  EditableTableContext,
  TableRowExpansionContainer,
  WarningButton,
} from '@tupaia/ui-components';
import { BorderlessTableRow } from './TableRow';
import * as COLORS from '../../theme/colors';

const VERIFY_STATUSES = {
  VERIFIED: 'verified',
  EXPANDED: 'expanded',
  CLOSED: 'closed',
};

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
  padding: 0 1rem 1rem;

  button {
    position: relative;
    z-index: 1;
  }

  &:after {
    position: absolute;
    border: 1px solid
      ${props => (props.status === VERIFY_STATUSES.VERIFIED ? COLORS.LIGHT_RED : COLORS.RED)};
    content: '';
    display: block;
    top: 0.5rem;
    bottom: 0;
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

  > .MuiTableCell-root {
    padding-top: 0.5rem;
  }
`;

export const VerifiableTableRow = props => {
  const { data, rowIndex } = props;
  const key = data[rowIndex].id;
  const { metadata, setMetadata } = useContext(EditableTableContext);
  const status = metadata ? metadata[key] : VERIFY_STATUSES.CLOSED;

  const setStatus = value => {
    setMetadata({
      ...metadata,
      [key]: value,
    });
  };

  const WarningButtonComponent = () => {
    if (status === VERIFY_STATUSES.VERIFIED) {
      return (
        <Wrapper status={status}>
          <VerifiedAlert>
            <CheckCircleIcon /> Verified
          </VerifiedAlert>
        </Wrapper>
      );
    }

    const handelClick = () => {
      setStatus(VERIFY_STATUSES.VERIFIED);
    };

    return (
      <Wrapper status={status}>
        <WarningButton fullWidth onClick={handelClick}>
          Please Verify Now
        </WarningButton>
      </Wrapper>
    );
  };

  return (
    <BorderlessTableRow
      {...props}
      expanded={status === VERIFY_STATUSES.EXPANDED || status === VERIFY_STATUSES.VERIFIED}
      SubComponent={WarningButtonComponent}
      ExpansionContainer={StyledExpansionContainer}
    />
  );
};

VerifiableTableRow.propTypes = {
  data: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
};
