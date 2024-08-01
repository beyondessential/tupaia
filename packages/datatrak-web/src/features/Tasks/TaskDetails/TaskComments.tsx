/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { TaskCommentType } from '@tupaia/types';
import { TextField } from '@tupaia/ui-components';
import { displayDateTime } from '../../../utils';
import { SingleTaskResponse } from '../../../types';
import { TaskForm } from '../TaskForm';
import { Button } from '../../../components';

const TaskCommentsDisplayContainer = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 1rem;
  border-radius: 4px;
  overflow-y: auto;
  flex: 1;
`;

const CommentContainer = styled.div`
  padding-block: 0.4rem;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const CommentsInput = styled(TextField).attrs({
  multiline: true,
  variant: 'outlined',
  fullWidth: true,
  rows: 4,
})`
  margin-block-end: 0;
  height: 11rem;
  .MuiOutlinedInput-inputMultiline {
    padding-inline: 1rem;
  }
  .MuiInputBase-root {
    height: 100%;
  }
`;

const Message = styled(Typography).attrs({
  variant: 'body2',
})`
  margin-block-start: 0.2rem;
`;

const Form = styled(TaskForm)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  align-items: flex-end;
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
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm();

  const onSubmit = data => {};
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TaskCommentsDisplayContainer>
        {comments.map((comment, index) => (
          <SingleComment key={index} comment={comment} />
        ))}
      </TaskCommentsDisplayContainer>
      <CommentsInput label="Add comment" name="comment" inputRef={register} />
      <Button type="submit" disabled={!isDirty}>
        Add comment
      </Button>
    </Form>
  );
};
