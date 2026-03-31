import { authHandlers } from './auth';
import { levelHandlers } from './level';
import { attendanceHandlers } from './attendance';
import { locationHandlers } from './location';
import { walletHandlers } from './wallet';

export const handlers = [
  ...authHandlers,
  ...levelHandlers,
  ...attendanceHandlers,
  ...locationHandlers,
  ...walletHandlers,
];
