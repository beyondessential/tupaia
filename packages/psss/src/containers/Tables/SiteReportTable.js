/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useCallback } from 'react';
import styled from 'styled-components';
import { queryCache, useMutation } from 'react-query';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import {
  EditableTableContext,
  EditableTable,
  LoadingContainer,
  GreyOutlinedButton,
  Button,
} from '@tupaia/ui-components';
import { DottedTableBody, GreyTableHeader } from '../../components';
import { FakeAPI } from '../../api';

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;

const HeaderTitle = styled(Typography)`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2rem;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
`;

const StyledEditableTable = styled(EditableTable)`
  padding-left: 1.2rem;
  padding-right: 1.2rem;
`;

const TABLE_STATUSES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  SAVING: 'saving',
  LOADING: 'loading',
};

export const SiteReportTable = React.memo(({ tableStatus, setTableStatus, weekNumber }) => {
  const { fields } = useContext(EditableTableContext);
  const { countryCode } = useParams();

  const handleEdit = useCallback(() => {
    setTableStatus(TABLE_STATUSES.EDITABLE);
  }, [setTableStatus]);

  const handleCancel = useCallback(() => {
    setTableStatus(TABLE_STATUSES.STATIC);
  }, [setTableStatus]);

  const [saveReport] = useMutation(
    async () => {
      setTableStatus(TABLE_STATUSES.SAVING);
      await FakeAPI.post(fields);
      setTableStatus(TABLE_STATUSES.STATIC);
    },
    {
      onSuccess: () => queryCache.invalidateQueries('country-weeks', { countryCode, weekNumber }),
    },
  );

  return (
    <LoadingContainer isLoading={tableStatus === TABLE_STATUSES.SAVING}>
      <HeadingRow>
        <HeaderTitle>Sentinel Cases Reported</HeaderTitle>
        <GreyOutlinedButton onClick={handleEdit} disabled={tableStatus === TABLE_STATUSES.EDITABLE}>
          Edit
        </GreyOutlinedButton>
      </HeadingRow>
      <StyledEditableTable Header={GreyTableHeader} Body={DottedTableBody} />
      {tableStatus === TABLE_STATUSES.EDITABLE && (
        <ActionsRow>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={saveReport}>Save</Button>
        </ActionsRow>
      )}
    </LoadingContainer>
  );
});

SiteReportTable.propTypes = {
  tableStatus: PropTypes.PropTypes.oneOf([
    TABLE_STATUSES.STATIC,
    TABLE_STATUSES.EDITABLE,
    TABLE_STATUSES.LOADING,
    TABLE_STATUSES.SAVING,
  ]).isRequired,
  setTableStatus: PropTypes.func.isRequired,
  weekNumber: PropTypes.number.isRequired,
};
