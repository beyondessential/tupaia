import React from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import {
  TaskCommentType,
  SystemCommentSubType,
  TaskCommentTemplateVariables,
  TaskComment,
} from '@tupaia/types';
import { RRULE_FREQUENCIES } from '@tupaia/utils';
import { TextField } from '@tupaia/ui-components';
import { displayDateTime } from '../../../utils';
import { SingleTaskResponse } from '../../../types';
import { TaskForm } from '../TaskForm';
import { Button } from '../../../components';
import { useCreateTaskComment } from '../../../api';
import { capsToSentenceCase } from '../utils';

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

const UserMessage = styled(Message).attrs({
  color: 'textPrimary',
})`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
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

const getFriendlyFieldName = field => {
  if (field === 'assignee_id') {
    return 'assignee';
  }
  if (field === 'repeat_schedule') {
    return 'recurring task';
  }

  // Default to replacing underscores with spaces
  return field.replace(/_/g, ' ');
};

const formatValue = (field, value) => {
  switch (field) {
    case 'assignee_id': {
      return value ?? 'Unassigned';
    }
    case 'repeat_schedule': {
      if (value === null || value === undefined) {
        return "Doesn't repeat";
      }

      const frequency = Object.keys(RRULE_FREQUENCIES).find(
        key => RRULE_FREQUENCIES[key] === value,
      );

      if (!frequency) {
        return "Doesn't repeat";
      }

      // format the frequency to be more human-readable
      return capsToSentenceCase(frequency);
    }
    case 'due_date': {
      return value ? format(new Date(value), 'do MMMM yy') : 'No due date';
    }
    default: {
      if (!value) return 'No value';
      // Default to capitalizing the value's first character, and replacing underscores with spaces
      const words = value.replace(/_/g, ' ');
      return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
    }
  }
};

const generateSystemComment = templateVariables => {
  const { type } = templateVariables;
  if (type === SystemCommentSubType.complete) {
    return 'Completed this task';
  }
  if (type === SystemCommentSubType.create) {
    return 'Created this task';
  }
  if (type === SystemCommentSubType.overdue) {
    return 'Overdue reminder email sent';
  }

  const { originalValue, newValue, field } = templateVariables;
  const friendlyFieldName = getFriendlyFieldName(field);
  const formattedOriginalValue = formatValue(field, originalValue);
  const formattedNewValue = formatValue(field, newValue);
  // generate a comment for the change
  return `Changed ${friendlyFieldName} from ${formattedOriginalValue} to ${formattedNewValue}`;
};

const SystemComment = ({
  templateVariables,
  message,
}: {
  templateVariables: TaskCommentTemplateVariables;
  message?: TaskComment['message'];
}) => {
  // Handle the case where the message is provided, for backwards compatibility
  const messageText = message ?? generateSystemComment(templateVariables);
  return <Message color="textSecondary">{messageText}</Message>;
};

const UserComment = ({ message }: { message: Comments[0]['message'] }) => {
  if (!message) return null;
  return (
    <>
      {message.split('\n').map(line => (
        <UserMessage key={line}>{line}</UserMessage>
      ))}
    </>
  );
};

const SingleComment = ({ comment }: { comment: Comments[0] }) => {
  const { createdAt, type, userName, message, templateVariables, userId } = comment;

  return (
    <CommentContainer>
      <CommentDetails>
        {displayDateTime(createdAt)} - {userName} {!userId ? '(user deleted)' : ''}
      </CommentDetails>

      {type === TaskCommentType.system ? (
        <SystemComment templateVariables={templateVariables} message={message} />
      ) : (
        <UserComment message={message} />
      )}
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
