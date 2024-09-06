/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { InputGroup, TextField } from '../../src/components';

export default {
  title: 'Inputs/InputGroup',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const inputGroup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [companyName, setCompanyName] = useState('');

  return (
    <Container>
      <InputGroup
        title="Your details"
        description="Please enter your details"
        fields={[
          <TextField
            label="First name"
            id="first-name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />,
          <TextField
            label="Last name"
            id="last-name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />,
        ]}
      />
      <InputGroup
        title="About you"
        fields={[
          <TextField label="Bio" id="bio" value={bio} onChange={e => setBio(e.target.value)} />,
        ]}
      />
      <InputGroup
        title="Your work"
        description="About your work"
        fields={[
          <TextField
            label="Company name"
            id="company-name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />,
          <TextField
            label="Website"
            id="website"
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />,
        ]}
      />
    </Container>
  );
};
