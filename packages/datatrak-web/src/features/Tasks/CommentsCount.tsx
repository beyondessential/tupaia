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
  const unit = commentsCount === 1 ? 'comment' : 'comments';
  const title = (
    <>
      {commentsCount}&nbsp;{unit}
    </>
  );
  return (
    <Tooltip title={title}>
      <CommentsCountWrapper>
        <CommentIcon />
        <CommentCountText>{commentsCount}</CommentCountText>
      </CommentsCountWrapper>
    </Tooltip>
  );
};
