export const selectSelectedProject = state => state.project?.selectedProject ?? null;

export const selectSelectedProjectCode = state =>
  state.project?.selectedProject?.code ?? null;

export const selectSelectedProjectId = state => state.project?.selectedProject?.id ?? null;
