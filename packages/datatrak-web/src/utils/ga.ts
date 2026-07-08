type WindowWithGa = Window & {
  gtag: (...args: any[]) => void;
};

const gtag = (window as unknown as WindowWithGa).gtag || (() => {});

if (!(window as unknown as WindowWithGa).gtag && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('Google Analytics library not found');
}

export const GA_CATEGORY = {
  APP: 'App',
  LOGIN: 'Login',
  SURVEY: 'Survey',
  TASK: 'Task',
  SYNC: 'Sync',
} as const;

export const GA_EVENT = {
  // App lifecycle
  APP_INSTALLED: 'app_installed',
  LOGIN: 'login',

  // Surveys
  SUBMIT_SURVEY: 'submit_survey',
  SUBMIT_SURVEY_BY_PROJECT: 'submit_survey_by_project',
  SUBMIT_SURVEY_BY_COUNTRY: 'submit_survey_by_country',
  SUBMIT_SURVEY_BY_USER: 'submit_survey_by_user',

  // Tasks
  TASK_CREATED: 'task_created',
  TASK_CREATED_BY_PROJECT: 'task_created_by_project',
  TASK_CREATED_BY_COUNTRY: 'task_created_by_country',
  TASK_CREATED_BY_SURVEY: 'task_created_by_survey',

  // Sync
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  FIRST_SYNC: 'first_sync',
  SYNC_ERROR: 'sync_error',
  SYNC_COMPAT_ERROR: 'sync_compat_error',
} as const;

export const gaEvent = (
  action: string,
  category: string,
  label?: string,
  extraParams?: Record<string, string | number>,
) =>
  gtag('event', action, {
    event_category: category,
    event_label: label,
    ...extraParams,
  });

export const gaSetUserProperties = (properties: Record<string, string>) =>
  gtag('set', 'user_properties', properties);
