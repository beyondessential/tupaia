/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Table } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAlerts } from '../../../api';
import { getCountryCodes } from '../../../store';
import { getColumns } from './getColumns';

const AlertsTableComponent = React.memo(({ countryCodes, period }) => {
  const { category: alertCategory, countryCode } = useParams();
  const isSingleCountry = !!countryCode;
  const orgUnitCodes = isSingleCountry ? [countryCode] : countryCodes;
  const columns = getColumns({ alertCategory, countryCode });
  const { data, isLoading, error, isFetching } = useAlerts(period, orgUnitCodes, alertCategory);

  return (
    <Table
      data={data}
      isLoading={isLoading}
      isFetching={!isLoading && isFetching}
      errorMessage={error && error.message}
      columns={columns}
    />
  );
});

AlertsTableComponent.propTypes = {
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  period: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const AlertsTable = connect(mapStateToProps)(AlertsTableComponent);
