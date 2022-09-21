let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Remove orphaned outer join details from previous use of broken renameMaterializedView function
  await db.runSql(`
    DELETE FROM pg$mviews_oj_details
    WHERE view_name = 'analytics_tmp'
  `);

  await db.runSql(`
CREATE OR REPLACE
FUNCTION    mv$renameMaterializedView
            (
                pOldViewName           IN      TEXT,
                pNewViewName           IN      TEXT,
                pOwner                 IN      TEXT        DEFAULT USER
            )
    RETURNS VOID
AS
$BODY$
/* ---------------------------------------------------------------------------------------------------------------------------------
Routine Name: mv$renameMaterializedView
Author:       Rohan Port
Date:         17/08/2021
------------------------------------------------------------------------------------------------------------------------------------
Revision History    Push Down List
------------------------------------------------------------------------------------------------------------------------------------
Date        | Name          | Description
------------+---------------+-------------------------------------------------------------------------------------------------------
21/09/2022  | Rohan Port    | Fix to rename references in outerjoin details table as well 
------------+---------------+-------------------------------------------------------------------------------------------------------
Description:    Renames a materialized view, edits the view_name in the pg$mviews table

                This function performs the following steps
                1)  Edits the view_name in the pg$mviews table to be the new name
                2)  Alters the materialized view table name to be the new name

Arguments:      IN      pOldViewName        The existing name of the materialized view
                IN      pNewViewName        The new name of the materialized view
                IN      pOwner              Optional, the owner of the materialized view, defaults to user
Returns:                VOID
************************************************************************************************************************************
Copyright 2021 Beyond Essential Systems Pty Ltd
***********************************************************************************************************************************/
DECLARE

    aPgMview    pg$mviews;
    rConst      mv$allConstants;

    tUpdatePgMviewsSqlStatement             TEXT := '';
    tUpdatePgMviewOjDetailsSqlStatement     TEXT := '';
    tRenameTableSqlStatement                TEXT := '';
    tRenameIndexSqlStatement                TEXT := '';
   
    rIndex	         RECORD;
    tOldIndexName    TEXT;
    tNewIndexName    TEXT;
begin
	
	rConst      := mv$buildAllConstants();

    tUpdatePgMviewsSqlStatement   :=  rConst.UPDATE_COMMAND || 'pg$mviews' || rConst.SET_COMMAND || 'view_name = ' 
                                           || rConst.SINGLE_QUOTE_CHARACTER || pNewViewName || rConst.SINGLE_QUOTE_CHARACTER 
                                           || rConst.WHERE_COMMAND || 'view_name = ' || rConst.SINGLE_QUOTE_CHARACTER || pOldViewName || rConst.SINGLE_QUOTE_CHARACTER;

    tUpdatePgMviewOjDetailsSqlStatement   :=  rConst.UPDATE_COMMAND || 'pg$mviews_oj_details' || rConst.SET_COMMAND || 'view_name = ' 
                                             || rConst.SINGLE_QUOTE_CHARACTER || pNewViewName || rConst.SINGLE_QUOTE_CHARACTER 
                                             || rConst.WHERE_COMMAND || 'view_name = ' || rConst.SINGLE_QUOTE_CHARACTER || pOldViewName || rConst.SINGLE_QUOTE_CHARACTER;
    
    tRenameTableSqlStatement   :=  rConst.ALTER_TABLE || pOldViewName || rConst.RENAME_TO_COMMAND || pNewViewName;

    EXECUTE tUpdatePgMviewsSqlStatement;
    EXECUTE tUpdatePgMviewOjDetailsSqlStatement;
    EXECUTE tRenameTableSqlStatement;

    FOR rIndex IN 
        SELECT indexname FROM pg_indexes WHERE schemaname = pOwner AND tablename = pNewViewName AND indexname like '%' || rConst.MV_M_ROW$_COLUMN || '%'
    LOOP
        tOldIndexName := rIndex.indexname;
        tNewIndexName := REPLACE(tOldIndexName, pOldViewName, pNewViewName);
        tRenameIndexSqlStatement :=  rConst.ALTER_INDEX || tOldIndexName || rConst.RENAME_TO_COMMAND || tNewIndexName;
        execute tRenameIndexSqlStatement;
    END LOOP;

    RETURN;

    EXCEPTION
    WHEN OTHERS
    THEN
        RAISE INFO      'Exception in function mv$renameMaterializedView';
        RAISE INFO      'Error %:- %:',     SQLSTATE, SQLERRM;
        RAISE INFO      E'Error Context:% % \n % \n %',CHR(10),  tUpdatePgMviewsSqlStatement, tRenameTableSqlStatement, tRenameIndexSqlStatement;
        RAISE EXCEPTION '%',                SQLSTATE;

END;
$BODY$
LANGUAGE    plpgsql
SECURITY    DEFINER;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
