/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridColumnsToolbarButton,
  GridFilterToolbarButton,
  GridToolbarExport,
  GridDensitySelector,
  useGridSlotComponentProps,
  GridFilterForm,
} from '@material-ui/data-grid';
import { TextField } from '@tupaia/ui-components';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useUsers } from '../api/queries';
import * as COLORS from '../constants';
import { Breadcrumbs, Toolbar } from '../components';

const Section = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 3rem;
  padding-bottom: 3rem;
  min-height: 70vh;

  .MuiDataGrid-root {
    //margin-top: 160px;
    background: white;
  }
`;

const TitleContainer = styled(MuiContainer)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

const Wrapper = styled.div`
  padding-top: 15px;
`;

const FilterHeader = () => {
  return (
    <Wrapper>
      <TextField placeholder="Search" />
    </Wrapper>
  );
};

const columns = [
  { field: 'firstName', headerName: 'First Name', width: 180, renderHeader: FilterHeader },
  { field: 'lastName', headerName: 'Last Name', width: 180 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'mobileNumber', headerName: 'Mobile Number', width: 190 },
  { field: 'employer', headerName: 'Employer', width: 180 },
  { field: 'position', headerName: 'Position', width: 180 },
  { field: 'verifiedEmail', headerName: 'Verified', type: 'boolean', width: 170 },
  // {
  //   field: 'actions',
  //   renderHeader: () => <span />,
  //   renderCell: ({ row }) => {
  //     const handleClick = () => {
  //       console.log('data...', row);
  //     };
  //     return (
  //       <strong>
  //         <IconButton onClick={handleClick}>
  //           <MoreVertIcon />
  //         </IconButton>
  //       </strong>
  //     );
  //   },
  // },
];

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridColumnsToolbarButton />
      <GridFilterToolbarButton />
      <GridDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const Panel = styled.div`
  position: absolute;
  background: white;
  padding: 20px 20px 40px;
  top: -175px;
  border-radius: 3px;
  border: 1px solid ${props => props.theme.palette.grey['400']};
`;

const CustomTitle = styled(Typography)`
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 1.6rem;
  margin-bottom: 20px;
`;

function CustomPanel(props) {
  const data = useGridSlotComponentProps();
  const { children } = props;
  return (
    <Panel>
      <CustomTitle>Search</CustomTitle>
      <div>{children}</div>
    </Panel>
  );
}

function CustomFilterPanel(props) {
  const { state: gridState, apiRef, ...rest } = useGridSlotComponentProps();
  console.log('gridState', gridState);
  console.log('rest', rest);

  const applyFilter = React.useCallback(
    item => {
      apiRef.current.upsertFilter(item);
    },
    [apiRef],
  );

  const deleteFilter = React.useCallback(
    item => {
      apiRef.current.deleteFilter(item);
    },
    [apiRef],
  );

  const applyFilterLinkOperator = React.useCallback(
    operator => {
      apiRef.current.applyFilterLinkOperator(operator);
    },
    [apiRef],
  );

  const hasMultipleFilters = React.useMemo(() => gridState.filter.items.length > 1, [
    gridState.filter.items.length,
  ]);

  const defaultForm = { columnField: 'firstName', operatorValue: 'contains' };

  const item = gridState.filter.items.length > 0 ? gridState.filter.items[0] : defaultForm;

  return (
    <GridFilterForm
      item={item}
      applyFilterChanges={applyFilter}
      deleteFilter={deleteFilter}
      hasMultipleFilters={hasMultipleFilters}
      showMultiFilterOperators={false}
      // showMultiFilterOperators={index > 0}
      multiFilterOperator={gridState.filter.linkOperator}
      disableMultiFilterOperator
      // disableMultiFilterOperator={index !== 1}
      applyMultiFilterOperatorChanges={applyFilterLinkOperator}
    />
  );
}

export const UsersView = () => {
  const { isLoading, data } = useUsers();

  return (
    <>
      <Toolbar>
        <Breadcrumbs breadcrumbs={[{ name: 'Admin', url: '/admin' }]} />
      </Toolbar>
      <TitleContainer maxWidth="lg">
        <Title variant="h1">Users and Permissions</Title>
      </TitleContainer>
      <Section>
        <MuiContainer maxWidth="lg">
          {isLoading ? (
            'loading...'
          ) : (
            <DataGrid
              rows={data}
              columns={columns}
              // components={{
              //   Panel: CustomPanel,
              //   FilterPanel: CustomFilterPanel,
              // }}
              autoHeight
              pageSize={20}
              rowsPerPageOptions={[20, 50, 100]}
              pagination
            />
          )}
        </MuiContainer>
      </Section>
    </>
  );
};
