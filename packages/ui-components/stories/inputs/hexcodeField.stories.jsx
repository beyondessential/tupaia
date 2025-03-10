import React, { useState } from 'react';
import styled from 'styled-components';
import { HexcodeField } from '../../src/components';

export default {
  title: 'Inputs/HexcodeField',
};

const Container = styled.div`
  max-width: 25em;
  padding: 2em;
`;

export const WithHelperText = () => {
  const [value, setValue] = useState('#000000');
  return (
    <Container>
      <HexcodeField
        value={value}
        label="Background color"
        id="background-color"
        helperText="This is the color that will be used for the background"
        onChange={setValue}
      />
    </Container>
  );
};

export const WithoutHelperText = () => {
  const [value, setValue] = useState('#000000');
  return (
    <Container>
      <HexcodeField
        value={value}
        label="Background color"
        id="background-color"
        onChange={setValue}
      />
    </Container>
  );
};

export const DisabledInput = () => {
  const [value, setValue] = useState('#000000');
  return (
    <Container>
      <HexcodeField
        value={value}
        label="Background color"
        id="background-color"
        onChange={setValue}
        disabled
      />
    </Container>
  );
};

export const WithTooltip = () => {
  const [value, setValue] = useState('#000000');
  return (
    <Container>
      <HexcodeField
        value={value}
        label="Background color"
        id="background-color"
        onChange={setValue}
        tooltip="This colour is for the background"
      />
      <HexcodeField
        value={value}
        label="Main color"
        id="main-color"
        onChange={setValue}
        tooltip="This colour is for the text"
        helperText="Please pick a contrasting colour"
      />
    </Container>
  );
};
