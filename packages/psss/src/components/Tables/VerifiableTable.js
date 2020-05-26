/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import styled from 'styled-components';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline';
import {
  ExpandableTableBody,
  TableRowExpansionContainer,
  WarningButton,
  Table,
  Button,
  FakeHeader,
  GreyOutlinedButton,
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
  padding: 0 1rem 1rem;

  button {
    position: relative;
    z-index: 1;
  }

  &:after {
    position: absolute;
    border: 1px solid ${props => (props.status === 'verified' ? COLORS.LIGHT_RED : COLORS.RED)};
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

const VerifiableTableRow = props => {
  const { data, rowIndex } = props;
  const key = data[rowIndex].id;
  const { metadata, setMetadata } = useContext(EditableTableContext);
  const status = metadata ? metadata[key] : 'closed';

  const setStatus = value => {
    setMetadata({
      ...metadata,
      [key]: value,
    });
  };

  const WarningButtonComponent = () => {
    if (status === 'verified') {
      return (
        <Wrapper status={status}>
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

const VerifiableBody = props => {
  const { tableState } = useContext(EditableTableContext);
  const Row = tableState === 'editable' ? BorderlessTableRow : VerifiableTableRow;
  return <ExpandableTableBody TableRow={Row} {...props} />;
};

const GreyHeader = styled(FakeHeader)`
  border: none;
`;

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-left: 30px;
  margin-right: 30px;
`;

const HeaderTitle = styled(Typography)`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
`;

const LayoutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const EditableTableSubmitButton = ({ setTableState }) => {
  const { fields, metadata } = useContext(EditableTableContext);

  const handleSubmit = () => {
    // POST DATA
    console.log('updated values...', fields, metadata);
    setTableState('static');
  };
  return <Button onClick={handleSubmit}>Save</Button>;
};

// maybe take a variant prop tp switch between rowTypes or pass in a custom row type?
export const VerifiableTable = () => {
  const { editableColumns, data } = useContext(EditableTableContext);
  const [tableState, setTableState] = useState('static');

  const handleEditClick = () => {
    setTableState('editable');
  };

  const handleCancel = () => {
    setTableState('static');
  };

  return (
    <React.Fragment>
      <LayoutRow>
        <Typography variant="h5">7/10 Sites Reported</Typography>
        <GreyOutlinedButton onClick={handleEditClick} disabled={tableState === 'editable'}>
          Edit
        </GreyOutlinedButton>
      </LayoutRow>
      <GreyHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </GreyHeader>
      <Table
        Header={false}
        Body={VerifiableBody}
        columns={editableColumns}
        data={data}
        tableState={tableState}
      />
      {tableState === 'editable' && (
        <LayoutRow>
          <MuiLink>Reset and use Sentinel data</MuiLink>
          <div>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <EditableTableSubmitButton tableState={tableState} setTableState={setTableState} />
          </div>
        </LayoutRow>
      )}
    </React.Fragment>
  );
};
