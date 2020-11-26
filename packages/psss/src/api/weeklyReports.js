import { get } from './api';

const getWeeklyReports = options => get('weekly-reports', options);
