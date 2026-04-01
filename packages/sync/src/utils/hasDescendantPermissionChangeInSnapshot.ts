import { type BaseDatabase, RECORDS } from '@tupaia/database';
import type { UserAccount } from '@tupaia/types';
import { getSnapshotTableName } from './manageSnapshotTable';

/**
 * Returns `true` if the sync snapshot for `sessionId` includes a change to a descendant of a
 * permission_group the user already has access to. Does not detect new `permission_group`s granted
 * to the user via `user_entity_permission`.
 */
export const hasDescendantPermissionChangeInSnapshot = async (
  database: BaseDatabase,
  sessionId: string,
  userId: UserAccount['id'],
): Promise<boolean> => {
  const snapshotTable = getSnapshotTableName(sessionId);

  /**
   * @privateRemarks `max(depth)` is tree height, plus headroom to account for tree height
   * increasing since last sync. Choice of 10 is arbitrary.
   */
  const maxDepth = database.connection.raw(
    `(
      WITH RECURSIVE tree AS (
        SELECT id, parent_id, 1 AS depth
        FROM permission_group
        WHERE parent_id IS NULL

        UNION ALL

        SELECT pg.id, pg.parent_id, t.depth + 1
        FROM permission_group pg
        INNER JOIN tree t ON pg.parent_id = t.id
      )
      SELECT max(depth) + :headroom AS height
      FROM tree
    )`,
    { headroom: 10 },
  );

  const [{ matches }] = await database.executeSql<[{ matches: boolean }]>(
    `
      WITH RECURSIVE user_perm AS (
        SELECT DISTINCT permission_group_id
        FROM user_entity_permission
        WHERE user_id = :userId
      ),
      walk AS (
        SELECT DISTINCT (s.data ->> 'id') AS current_id, 0 AS depth
        FROM ${snapshotTable} s
        WHERE s.record_type = :recordType

        UNION ALL

        SELECT pl.parent_id, w.depth + 1
        FROM walk w
        INNER JOIN LATERAL (
          SELECT
            coalesce(
              (SELECT pg.parent_id FROM permission_group pg WHERE pg.id = w.current_id),
              (
                SELECT NULLIF (s2.data ->> 'parent_id', '')
                FROM ${snapshotTable} s2
                WHERE s2.record_type = :recordType AND s2.data ->> 'id' = w.current_id
                LIMIT 1
              )
            ) AS parent_id
          ) pl ON pl.parent_id IS NOT NULL
        WHERE w.depth < :maxDepth
      )

      SELECT EXISTS (
        SELECT 1
        FROM walk w
        INNER JOIN user_perm u ON u.permission_group_id = w.current_id
      ) AS matches
    `,
    {
      userId,
      recordType: RECORDS.PERMISSION_GROUP,
      maxDepth,
    },
  );

  return matches;
};
