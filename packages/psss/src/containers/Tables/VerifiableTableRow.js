/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import { TableRowExpansionContainer, WarningButton } from '@tupaia/ui-components';
import { BorderlessTableRow } from '../../components/Table/TableRow';
import * as COLORS from '../../constants/colors';
import { getVerifiedStatus, updateVerifiedStatus } from '../../store';

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

const WarningWrapper = styled.div`
  padding: 0 1rem 1rem;

  button {
    position: relative;
    z-index: 1;
  }

  &:after {
    position: absolute;
    border: 1px solid ${COLORS.RED};
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

const VerifiedWrapper = styled(WarningWrapper)`
  &:after {
    border: 1px solid ${COLORS.LIGHT_RED};
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

export const VerifiableTableRowComponent = React.memo(props => {
  const { rowData, verifiedStatus, setVerifiedStatus } = props;

  const WarningButtonComponent = () => {
    if (verifiedStatus) {
      return (
        <VerifiedWrapper>
          <VerifiedAlert>
            <CheckCircleIcon /> Verified
          </VerifiedAlert>
        </VerifiedWrapper>
      );
    }

    const handleVerify = () => {
      setVerifiedStatus(rowData.id);
    };

    return (
      <WarningWrapper>
        <WarningButton fullWidth onClick={handleVerify}>
          Click to verify
        </WarningButton>
      </WarningWrapper>
    );
  };

  return (
    <BorderlessTableRow
      {...props}
      expandedValue={verifiedStatus !== null}
      SubComponent={WarningButtonComponent}
      ExpansionContainer={StyledExpansionContainer}
    />
  );
});

VerifiableTableRowComponent.propTypes = {
  rowData: PropTypes.object.isRequired,
  verifiedStatus: PropTypes.bool,
  setVerifiedStatus: PropTypes.func.isRequired,
};

VerifiableTableRowComponent.defaultProps = {
  verifiedStatus: null,
};

const mapStateToProps = (state, { rowData }) => ({
  verifiedStatus: getVerifiedStatus(state, rowData.id),
});

const mapDispatchToProps = dispatch => ({
  setVerifiedStatus: data => dispatch(updateVerifiedStatus(data)),
});

export const VerifiableTableRow = connect(
  mapStateToProps,
  mapDispatchToProps,
)(VerifiableTableRowComponent);
