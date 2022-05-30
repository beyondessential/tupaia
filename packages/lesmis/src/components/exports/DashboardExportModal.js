/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@material-ui/icons/GetApp';
import { Dialog, DialogHeader, DialogContent } from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/IconButton';
import { DashboardExportPreview } from './DashboardExportPreview';
import { OptionsBar } from './components';
import { exportImagesToPDF, useCustomGetImages } from '../../utils';
import { useSubDashboards } from './utils/useSubDashboards';
import { ExportOptionsProvider } from './context/ExportOptionsContext';

export const DashboardExportModal = ({ Button, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const subDashboards = useSubDashboards();
  const { addToRefs, getImgs } = useCustomGetImages();
  const fileName = `${title}-dashboards-export`;

  const totalPage =
    subDashboards &&
    subDashboards
      .map(subDashboard => {
        const { items } = subDashboard;
        return items.length > 0 ? items.length : 1;
      })
      .reduce((totalNum, numOfdashboardItems) => totalNum + numOfdashboardItems, 1);

  const handleClickExport = async () => {
    const pageScreenshots = await getImgs();
    await exportImagesToPDF(pageScreenshots, fileName);
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
          <ExportOptionsProvider>
            <OptionsBar totalPage={totalPage} setPage={setPage} />
            <DashboardExportPreview
              subDashboards={subDashboards}
              addToRefs={addToRefs}
              currentPage={page}
            />
          </ExportOptionsProvider>
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
