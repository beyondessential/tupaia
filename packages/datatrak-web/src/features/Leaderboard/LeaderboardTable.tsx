/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { UserRewards } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableHead,
  TableRow,
  TableFooter,
} from '@material-ui/core';
import { useLeaderboard, useUser } from '../../api/queries';

interface LeaderboardTableProps {
  userRewards?: UserRewards;
}

const TableContainer = styled(MuiTableContainer)`
  padding: 0.2rem 1.6rem;

  td {
    &:first-child {
      text-align: center;
    }
    &:last-child {
      text-align: right;
    }
  }
`;

const HeaderCell = styled(TableCell)`
  border-bottom-color: ${({ theme }) => theme.palette.divider};
  ${({ theme }) => theme.breakpoints.down('md')} {
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
  }
`;

const Cell = styled(TableCell)<{
  $isActiveUser?: boolean;
}>`
  padding-top: 1rem;
  padding-bottom: 0.3rem;
  border: none;
  font-weight: ${({ $isActiveUser, theme }) =>
    $isActiveUser ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular};
  &:first-child {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
  tr:last-child & {
    padding-bottom: 1rem;
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    padding-top: 1.2rem;
    padding-bottom: 0.6rem;
    tr:last-child & {
      padding-bottom: 1.2rem;
    }
  }
`;

const FooterCell = styled(TableCell)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.primary};
  border-bottom: none;
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const LeaderboardTable = ({ userRewards }: LeaderboardTableProps) => {
  const { data: user } = useUser();
  const { data: leaderboard, isLoading } = useLeaderboard();
  if (isLoading) return null;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>Score</HeaderCell>
          </TableRow>
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
                <Cell $isActiveUser={isActiveUser}>{coconuts}</Cell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <FooterCell>-</FooterCell>
            <FooterCell>{user?.userName}</FooterCell>
            <FooterCell>{userRewards?.coconuts}</FooterCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
