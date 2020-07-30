/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '../../src';

export default {
  title: 'Inputs/DatePicker',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const datePicker = () => {
  const [value, setValue] = useState(new Date());
  const { register, control } = useForm();

  return (
    <Container>
      <DatePicker label="Basic example" onChange={setValue} value={value} />
      <Controller
        as={<DatePicker label="Form example" name="dateField" />}
        control={control}
        defaultValue={new Date()}
        name="dateField"
        inputRef={register({
          required: 'Required',
        })}
      />
    </Container>
  );
};
