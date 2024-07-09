/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { Modal } from '@tupaia/ui-components';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { AssigneeInput } from '../AssigneeInput';

export const AssignTaskModal = ({ task, onClose }) => {
  const formContext = useForm();

  const { handleSubmit, control, setValue } = formContext;

  const onSubmit = data => {
    console.log(data);
  };

  useEffect(() => {
    setValue('surveyCode', task?.survey.code);
  }, [task?.survey?.code]);

  return (
    <>
      <Modal isOpen={!!task} onClose={onClose} title="Assign task">
        <FormProvider {...formContext}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="assigneeId"
              control={control}
              render={({ ref, value, onChange, ...field }) => (
                <AssigneeInput
                  {...field}
                  value={value}
                  onChange={onChange}
                  inputRef={ref}
                  countryCode={task?.entity?.countryCode}
                />
              )}
            />
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};
