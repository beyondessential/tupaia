/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Tooltip } from '@tupaia/ui-components';
import { CommentIcon } from '../../components';

const CommentsCountWrapper = styled.div`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  align-items: center;
  right: 0;
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

const CommentCountText = styled(Typography)`
  font-size: 0.75rem;
  margin-inline-start: 0.25rem;
`;

export const CommentsCount = ({ commentsCount }: { commentsCount: number }) => {
  if (!commentsCount) return null;
  return (
    <Tooltip title="Number of user generated comments on this task">
      <CommentsCountWrapper>
        <CommentIcon />
        <CommentCountText>{commentsCount}</CommentCountText>
      </CommentsCountWrapper>
    </Tooltip>
  );
};
