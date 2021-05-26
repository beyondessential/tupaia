import React, { useCallback, useContext } from 'react';
import { ActionsMenu } from '@tupaia/ui-components';
import { ArchiveTableContext } from '../../../containers/Tables';

export const ArchivedAlertMenuCell = React.memo(({ id }) => {
  const { setAlertId, setIsRestoreModalOpen, setIsDeleteModalOpen } = useContext(
    ArchiveTableContext,
  );

  const restoreAlert = useCallback(() => {
    setAlertId(id);
    setIsRestoreModalOpen(true);
  }, [setAlertId, setIsRestoreModalOpen]);

  const deleteAlert = useCallback(() => {
    setAlertId(id);
    setIsDeleteModalOpen(true);
  }, [setAlertId, setIsDeleteModalOpen]);

  const actions = [
    {
      label: 'Restore',
      action: restoreAlert,
    },
    {
      label: 'Delete',
      action: deleteAlert,
    },
  ];

  return <ActionsMenu options={actions} />;
});
