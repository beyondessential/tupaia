import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import {
  ExpandableTableRow,
  TableRowExpansionContainer,
  WarningButton,
} from '@tupaia/ui-components';
import { BorderlessTableRowStyles } from '../../../components/Table';
import * as COLORS from '../../../constants/colors';
import { getVerifiedStatus, updateVerifiedStatus } from '../../../store';

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

  > .MuiTableCell-root.MuiTableCell-body {
    padding-top: 0.5rem;
  }
`;

const StyledExpandableRow = styled(ExpandableTableRow)`
  ${BorderlessTableRowStyles}
`;

export const VerifiableTableRowComponent = React.memo(props => {
  const { rowData, setVerifiedStatus, isVerified } = props;
  const hasWarning = rowData.isAlert;

  const WarningButtonComponent = () => {
    if (isVerified) {
      return (
        <VerifiedWrapper>
          <VerifiedAlert>
            <CheckCircleIcon /> Verified
          </VerifiedAlert>
        </VerifiedWrapper>
      );
    }

    return (
      <WarningWrapper>
        <WarningButton
          fullWidth
          onClick={() => {
            setVerifiedStatus(rowData.id);
          }}
        >
          Click to verify
        </WarningButton>
      </WarningWrapper>
    );
  };

  return (
    <StyledExpandableRow
      {...props}
      ExpandButtonComponent={null}
      expandedValue={hasWarning}
      SubComponent={WarningButtonComponent}
      ExpansionContainer={StyledExpansionContainer}
    />
  );
});

VerifiableTableRowComponent.propTypes = {
  rowData: PropTypes.object.isRequired,
  isVerified: PropTypes.bool,
  setVerifiedStatus: PropTypes.func.isRequired,
};

VerifiableTableRowComponent.defaultProps = {
  isVerified: false,
};

const mapStateToProps = (state, { rowData }) => ({
  isVerified: getVerifiedStatus(state, rowData.id),
});

const mapDispatchToProps = dispatch => ({
  setVerifiedStatus: id => dispatch(updateVerifiedStatus(id)),
});

export const VerifiableTableRow = connect(
  mapStateToProps,
  mapDispatchToProps,
)(VerifiableTableRowComponent);
