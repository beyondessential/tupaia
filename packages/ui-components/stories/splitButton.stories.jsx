import React from 'react';
import { SplitButton } from '../src/components';

export default {
  title: 'SplitButton',
  component: SplitButton,
};

const options = [
  { id: 'xlsx', label: 'Export to XLSX' },
  { id: 'png', label: 'Export to PNG' },
];

export const simple = () => {
  const [selectedId, setSelectedId] = React.useState(options[0].id);
  const selectedOption = options.find(o => o.id === selectedId);

  const handleClick = () => {
    console.info(`You clicked ${selectedOption.label}`);
  };

  return (
    <SplitButton
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      onClick={handleClick}
      options={options}
    />
  );
};
