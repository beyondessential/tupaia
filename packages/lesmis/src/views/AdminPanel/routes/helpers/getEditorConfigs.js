export const getBaseEditorConfigs = translate => ({
  dismissButtonText: translate('admin.dismiss'),
  cancelButtonText: translate('admin.cancel'),
  saveButtonText: translate('admin.save'),
});

export const getEditorConfigs = translate => {
  return {
    displayUsedBy: true,
    usedByConfig: {
      header: 'Used by',
      typeHeadings: {
        question: translate('admin.questions'),
        indicator: 'Indicators',
        dashboardItem: translate('admin.dashboardItems'),
        mapOverlay: translate('admin.mapOverlays'),
        legacyReport: 'Legacy Reports',
        dataGroup: translate('admin.dataGroups'),
        survey: translate('admin.surveys'),
      },
    },
    ...getBaseEditorConfigs(translate),
  };
};
