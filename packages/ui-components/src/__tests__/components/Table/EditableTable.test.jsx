import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render } from '../../../../helpers/testingRenderer';
import { EditableTable, EditableTableProvider } from '../../../components/Table';
import { Button } from '../../../components/Button';
import { useTableData } from '../../../../helpers/useTableData';

const columns = [
  {
    title: 'Name',
    key: 'name',
    align: 'left',
    editable: true,
  },
  {
    title: 'Surname',
    key: 'surname',
    align: 'left',
    editable: true,
  },
  {
    title: 'Email',
    key: 'email',
    align: 'left',
    editable: true,
  },
];

const EditableTableComponent = () => {
  const [tableStatus, setTableStatus] = React.useState('static');
  const { loading, data } = useTableData();

  return (
    <EditableTableProvider columns={columns} data={data} tableStatus={tableStatus}>
      <Button onClick={() => setTableStatus('editable')}>Edit</Button>
      <EditableTable isLoading={loading} />
      {tableStatus === 'editable' && (
        <>
          <Button onClick={() => setTableStatus('static')}>Cancel</Button>
          <Button type="submit" onClick={() => setTableStatus('static')}>
            Save
          </Button>
        </>
      )}
    </EditableTableProvider>
  );
};

describe('editable table', () => {
  it('renders', async () => {
    render(<EditableTableComponent />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const rows = await screen.findAllByRole('row');
    expect(rows.length).toEqual(31);
  });

  it('is editable', async () => {
    render(<EditableTableComponent />);
    const emailAddress = 'hello-world@gmail.com';

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue(emailAddress)).not.toBeInTheDocument();
    });

    // start test
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    const emailInputs = screen.getAllByLabelText(/email/i);
    const input = emailInputs[0];
    input.setSelectionRange(0, input.value.length);
    await userEvent.type(input, emailAddress);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(input.value).toBe(emailAddress);
  });
});
