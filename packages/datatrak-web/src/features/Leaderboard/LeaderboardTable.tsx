/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { DatatrakWebLeaderboardRequest, DatatrakWebUserRequest } from '@tupaia/types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { UserRewards } from '../../types';

const TableContainer = styled(MuiTableContainer)`
  font-variant-numeric: tabular-nums;
  height: 100%;
  padding: 1rem 1.6rem;

  table {
    height: 100%;
  }

  table thead,
  table tfoot {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }

  table tr {
    height: 8.33333333%;
    min-height: fit-content;
    vertical-align: baseline;
  }

  table th,
  table td {
    padding: 0.5rem 1rem;
  }
`;

const HeaderRow = styled(TableRow)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const FooterRow = styled(TableRow)`
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

const Cell = styled(TableCell)<{
  $isActiveUser?: boolean;
}>`
  border: none;
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 0.875rem;
  font-weight: ${({ $isActiveUser, theme }) =>
    $isActiveUser ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular};
  text-align: start;

  &:first-child {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    text-align: end;
  }

  &:last-child {
    text-align: end;
  }
`;

const HeaderCell = styled(Cell)`
  line-height: 1.4;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const FooterCell = styled(Cell)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

interface LeaderboardTableProps {
  userRewards?: UserRewards;
  user?: DatatrakWebUserRequest.ResBody & {
    isLoggedIn: boolean;
  };
  leaderboard?: DatatrakWebLeaderboardRequest.ResBody;
}

export const LeaderboardTable = ({
  userRewards,
  user,
  leaderboard = [],
}: LeaderboardTableProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <HeaderRow>
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>Score</HeaderCell>
          </HeaderRow>
        </TableHead>
        <TableBody>
          {leaderboard?.map(({ userId, firstName, lastName, coconuts }, i) => {
            const isActiveUser = user && user.id === userId;
            return (
              <TableRow key={userId}>
                <Cell>{i + 1}</Cell>
                <Cell $isActiveUser={isActiveUser}>
                  {firstName} {lastName}
                </Cell>
                <Cell $isActiveUser={isActiveUser}>{coconuts.toLocaleString()}</Cell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <FooterRow>
            <FooterCell>&mdash;</FooterCell>
            <FooterCell>{user?.userName}</FooterCell>
            <FooterCell>{userRewards?.coconuts}</FooterCell>
          </FooterRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
