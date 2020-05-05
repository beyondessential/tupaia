export const getProjectByCode = ({ project: { projects } }, code) =>
  projects.find(p => p.code === code);

export const selectActiveProject = ({ project }) => project.active;
