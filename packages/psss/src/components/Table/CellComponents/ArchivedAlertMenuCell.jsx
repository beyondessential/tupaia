import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { ActionsMenu } from '@tupaia/ui-components';
import * as COLORS from '../../../constants/colors';
import { ArchiveTableContext } from '../../../context';

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
      style: { color: COLORS.RED },
    },
  ];

  return <ActionsMenu options={actions} />;
});

ArchivedAlertMenuCell.propTypes = {
  id: PropTypes.string.isRequired,
};
