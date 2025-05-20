import { startDevConfigs } from './base.config';
import serverStacks from '../server-stacks.json';

export const apps = startDevConfigs(serverStacks['tupaia-web']);
