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
  TableHead,
  TableRow,
  TableFooter,
  Typography,
} from '@material-ui/core';
import { UserRewards } from '../../types';

const TableContainer = styled(MuiTableContainer)`
  padding: 0.2rem 1.6rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  table {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  thead,
  tfoot {
    display: flex;
  }
`;

const Row = styled(TableRow)`
  display: flex;
  width: 100%;
`;

const HeaderRow = styled(Row)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 0.4rem 0;
  margin-bottom: 0.5rem;
  @media screen and (min-height: 900px) {
    padding: 0.6rem 0;
  }
`;

const Body = styled(TableBody)<{
  $rowCount?: number;
}>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ $rowCount = 0 }) => ($rowCount < 10 ? 'flex-start' : 'space-between')};
  width: 100%;
  flex: 1;
`;

const FooterRow = styled(Row)`
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 0.3rem 0;
  margin-top: 0.3rem;
`;

const Cell = styled(TableCell)<{
  $isActiveUser?: boolean;
}>`
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  border: none;
  font-weight: ${({ $isActiveUser, theme }) =>
    $isActiveUser ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.primary};
  width: 55%;
  text-align: left;
  &:first-child {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    width: 20%;
  }
  &:last-child {
    text-align: right;
    width: 25%;
  }
`;

const HeaderCell = styled(Cell)`
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1.4;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const FooterCell = styled(Cell)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const NoDataMessage = styled(TableCell)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

interface LeaderboardTableProps {
  userRewards?: UserRewards;
  user?: DatatrakWebUserRequest.ResBody & {
    isLoggedIn: boolean;
  };
  leaderboard?: DatatrakWebLeaderboardRequest.ResBody;
}

export const LeaderboardTable = ({ userRewards, user, leaderboard }: LeaderboardTableProps) => {
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
        <Body $rowCount={leaderboard?.length}>
          {leaderboard?.length === 0 && (
            <NoDataMessage>
              No leaderboard entries to display for {user?.project?.name || 'project'}
            </NoDataMessage>
          )}
          {leaderboard?.map(({ userId, firstName, lastName, coconuts }, i) => {
            const isActiveUser = user && user.id === userId;
            return (
              <Row key={userId}>
                <Cell>{i + 1}</Cell>
                <Cell $isActiveUser={isActiveUser}>
                  {firstName} {lastName}
                </Cell>
                <Cell $isActiveUser={isActiveUser}>{coconuts}</Cell>
              </Row>
            );
          })}
        </Body>
        <TableFooter>
          <FooterRow>
            <FooterCell>-</FooterCell>
            <FooterCell>{user?.userName}</FooterCell>
            <FooterCell>{userRewards?.coconuts}</FooterCell>
          </FooterRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
