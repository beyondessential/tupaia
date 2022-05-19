/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@material-ui/icons/GetApp';
import { Dialog, DialogHeader, DialogContent } from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/IconButton';
import { DashboardExportPreview } from './DashboardExportPreview';
import { useExportToImage } from '../../utils';

export const DashboardExportModal = ({ Button, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileName = `${title}-dashboards-export`;
  const { exportRef, exportToImg } = useExportToImage(fileName);

  const handleClickExport = async () => {
    await exportToImg();
  };

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsOpen(false)} title={title}>
          <MuiIconButton>
            <DownloadIcon onClick={handleClickExport} />
          </MuiIconButton>
        </DialogHeader>
        <DialogContent>
          <div ref={exportRef}>
            <DashboardExportPreview />
          </div>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setIsOpen(true)} />
    </>
  );
};

DashboardExportModal.propTypes = {
  title: PropTypes.string,
  Button: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

DashboardExportModal.defaultProps = {
  title: null,
  Button: null,
};
