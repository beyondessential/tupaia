import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@material-ui/icons/GetApp';
import { Dialog, DialogHeader, DialogContent } from '@tupaia/ui-components';
import { MapTable, useMapDataExport } from '@tupaia/ui-map-components';
import MuiIconButton from '@material-ui/core/IconButton';

export const MapTableModal = ({ Button, overlayReportData, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { serieses, measureData } = overlayReportData;
  const { doExport } = useMapDataExport(serieses, measureData, title);

  if (!serieses || serieses.length === 0 || !measureData || measureData.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <DialogHeader onClose={() => setIsOpen(false)} title={title}>
          <MuiIconButton onClick={doExport}>
            <DownloadIcon />
          </MuiIconButton>
        </DialogHeader>
        <DialogContent>
          <MapTable serieses={serieses} measureData={measureData} />
        </DialogContent>
      </Dialog>
      <Button onClick={() => setIsOpen(true)} />
    </>
  );
};

MapTableModal.propTypes = {
  title: PropTypes.string,
  overlayReportData: PropTypes.object,
  Button: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

MapTableModal.defaultProps = {
  title: null,
  overlayReportData: null,
  Button: null,
};
