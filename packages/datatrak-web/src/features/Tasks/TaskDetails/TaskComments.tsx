/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { TaskCommentType } from '@tupaia/types';
import { displayDateTime } from '../../../utils';
import { SingleTaskResponse } from '../../../types';

const Wrapper = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.default};
  margin-block-end: 1.2rem;
  padding: 1rem;
  border-radius: 4px;
  overflow-y: auto;
  height: 19rem;
`;

const CommentContainer = styled.div`
  padding-block: 0.4rem;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const Message = styled(Typography).attrs({
  variant: 'body2',
})`
  margin-block-start: 0.2rem;
`;

type Comments = SingleTaskResponse['comments'];

const SingleComment = ({ comment }: { comment: Comments[0] }) => {
  const { createdAt, userName, message, type } = comment;
  return (
    <CommentContainer>
      <Typography variant="body2" color="textSecondary">
        {displayDateTime(createdAt)} - {userName}
      </Typography>
      <Message color={type === TaskCommentType.user ? 'textPrimary' : 'textSecondary'}>
        {message}
      </Message>
    </CommentContainer>
  );
};

export const TaskComments = ({ comments }: { comments: Comments }) => {
  return (
    <Wrapper>
      {comments.map((comment, index) => (
        <SingleComment key={index} comment={comment} />
      ))}
    </Wrapper>
  );
};
