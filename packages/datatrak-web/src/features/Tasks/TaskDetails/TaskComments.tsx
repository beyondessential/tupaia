/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import { TaskCommentType } from '@tupaia/types';
import { TextField } from '@tupaia/ui-components';
import { displayDateTime } from '../../../utils';
import { SingleTaskResponse } from '../../../types';
import { TaskForm } from '../TaskForm';
import { Button } from '../../../components';
import { useCreateTaskComment } from '../../../api';

const TaskCommentsDisplayContainer = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: 1rem;
  border-radius: 4px;
  overflow-y: auto;
  flex: 1;
  max-height: 18rem;
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
  rows: 5,
})`
  margin-block: 1.2rem;
  height: 9.5rem;
  .MuiOutlinedInput-inputMultiline.MuiInputBase-input {
    padding-inline: 1rem;
    padding-block: 1rem;
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

const CommentDetails = styled(Typography).attrs({
  variant: 'body2',
})`
  color: ${({ theme }) => theme.palette.grey[400]};
`;

type Comments = SingleTaskResponse['comments'];

const SingleComment = ({ comment }: { comment: Comments[0] }) => {
  const { createdAt, userName, message, type } = comment;
  return (
    <CommentContainer>
      <CommentDetails>
        {displayDateTime(createdAt)} - {userName}
      </CommentDetails>
      <Message color={type === TaskCommentType.user ? 'textPrimary' : 'textSecondary'}>
        {message}
      </Message>
    </CommentContainer>
  );
};

export const TaskComments = ({ comments }: { comments: Comments }) => {
  const { taskId } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      comment: '',
    },
  });

  const { mutate: createTaskComment, isLoading: isSaving } = useCreateTaskComment(taskId, reset);

  const onSubmit = data => {
    createTaskComment(data.comment);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TaskCommentsDisplayContainer>
        {comments.map((comment, index) => (
          <SingleComment key={index} comment={comment} />
        ))}
      </TaskCommentsDisplayContainer>
      <CommentsInput label="Add comment" name="comment" inputRef={register} />
      <Button type="submit" disabled={!isDirty || isSaving}>
        {isSaving ? 'Saving...' : 'Add comment'}
      </Button>
    </Form>
  );
};
