/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertQuestionEditPermissions } from './assertQuestionPermissions';

export class DeleteQuestions extends DeleteHandler {
  async assertUserHasAccess() {
    const questionChecker = accessPolicy =>
      assertQuestionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, questionChecker]));
  }
}
