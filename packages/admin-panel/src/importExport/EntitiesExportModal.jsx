import React from 'react';
import { ExportModal } from './ExportModal';
import { useSelectedProjectCode } from '../projects';

/**
 * Page-level Export button on the Entities resource page. The export endpoint
 * is scoped by URL path — /export/entities/:projectCode — so we read the
 * active project from the URL via useSelectedProjectCode rather than asking
 * the user. On All Data routes (no project in URL) the button is hidden via
 * the entitiesTabRoutes scope guard, so projectCode is always present when
 * this modal renders.
 */
export const EntitiesExportModal = () => {
  const projectCode = useSelectedProjectCode();

  if (!projectCode) return null;

  return (
    <ExportModal
      title="Download entities"
      exportEndpoint={`entities/${projectCode}`}
      fileName={`Entities - ${projectCode}.xlsx`}
    >
      <p>
        Download a spreadsheet of every entity in this project. The file is in the same
        format the import accepts, so you can edit it and re-upload.
      </p>
    </ExportModal>
  );
};
