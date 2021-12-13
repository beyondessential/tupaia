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
  await db.runSql(`
    CREATE OR REPLACE
    FUNCTION    mv$version()
    RETURNS TEXT
    AS
    $BODY$
    /* ---------------------------------------------------------------------------------------------------------------------------------
    Routine Name: mv$help
    Author:       Rohan Port
    Date:         18/10/2021
    ------------------------------------------------------------------------------------------------------------------------------------
    Revision History    Push Down List
    ------------------------------------------------------------------------------------------------------------------------------------
    Date        | Name          | Description
    ------------+---------------+-------------------------------------------------------------------------------------------------------
                |               |
    ------------+---------------+-------------------------------------------------------------------------------------------------------
    Description:    Displays the version
    
    Arguments:      IN      None
    Returns:                TEXT    The version
    
    ************************************************************************************************************************************
    Copyright 2021 Beyond Essential Systems Pty Ltd
    ***********************************************************************************************************************************/
    DECLARE
    
    BEGIN
    
        RETURN '1_0_1';
    
        EXCEPTION
        WHEN OTHERS
        THEN
            RAISE INFO      'Exception in function mv$help';
            RAISE INFO      'Error %:- %:',     SQLSTATE, SQLERRM;
            RAISE EXCEPTION '%',                SQLSTATE;
    
    END;
    $BODY$
    LANGUAGE    plpgsql
    SECURITY    DEFINER;
  `);
  await db.runSql(`
    CREATE OR REPLACE
    FUNCTION    mv$renameMaterializedViewLog
                (
                    pOldTableName           IN      TEXT,
                    pNewTableName           IN      TEXT,
                    pOwner                  IN      TEXT        DEFAULT USER
                )
        RETURNS VOID
    AS
    $BODY$
    /* ---------------------------------------------------------------------------------------------------------------------------------
    Routine Name: mv$renameMaterializedViewLog
    Author:       Ethan McQuarrie
    Date:         06/12/2021
    ------------------------------------------------------------------------------------------------------------------------------------
    Revision History    Push Down List
    ------------------------------------------------------------------------------------------------------------------------------------
    Date        | Name          | Description
    ------------+---------------+-------------------------------------------------------------------------------------------------------
                |               |
    ------------+---------------+-------------------------------------------------------------------------------------------------------
    Description:    Renames a materialized view log table
    
    Arguments:      IN      pOldTableName       The name of the base table the materialized view logs are against
                    IN      pNewTableName       The name this table is being updated to
                    IN      pOwner              Optional, the owner of the materialized view, defaults to user
    Returns:                VOID
    
    ************************************************************************************************************************************
    Copyright 2021 Beyond Essential Systems Pty Ltd
    ***********************************************************************************************************************************/
    DECLARE
    
        rConst          mv$allConstants;
        aViewLog        pg$mview_logs;
    
        tRenameLogTableSqlStatement             TEXT;
        tUpdateMViewLogsTableSqlStatement       TEXT;
        tUpdateMViewTableColumns                TEXT;
        tUpdateTriggerName                      TEXT;
    BEGIN
    
        rConst   := mv$buildAllConstants();
        tRenameLogTableSqlStatement         := rConst.ALTER_TABLE || 'log$_' || pOldTableName || rConst.RENAME_TO_COMMAND || 'log$_' || pNewTableName;
        tUpdateMViewLogsTableSqlStatement   := rConst.UPDATE_COMMAND || 'pg$mview_logs' || rConst.SET_COMMAND
                                                || 'table_name = ' || rConst.SINGLE_QUOTE_CHARACTER || pNewTableName || rConst.SINGLE_QUOTE_CHARACTER || rConst.COMMA_CHARACTER
                                                || 'pglog$_name = ' || rConst.SINGLE_QUOTE_CHARACTER || 'log$_' || pNewTableName || rConst.SINGLE_QUOTE_CHARACTER
                                                || rConst.WHERE_COMMAND || 'table_name = ' || rConst.SINGLE_QUOTE_CHARACTER || pOldTableName || rConst.SINGLE_QUOTE_CHARACTER;
        tUpdateMViewTableColumns            := rConst.UPDATE_COMMAND || 'pg$mviews' || rConst.SET_COMMAND
                                                || 'pgmv_columns = ' || 'REPLACE'
                                                    || rConst.OPEN_BRACKET || 'pgmv_columns' || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pOldTableName || '_m_row$' || rConst.SINGLE_QUOTE_CHARACTER || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pNewTableName || '_m_row$' || rConst.SINGLE_QUOTE_CHARACTER || rConst.CLOSE_BRACKET || rConst.COMMA_CHARACTER
                                                || 'table_array = ' || 'array_replace'
                                                    || rConst.OPEN_BRACKET || 'table_array' || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pOldTableName || rConst.SINGLE_QUOTE_CHARACTER || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pNewTableName || rConst.SINGLE_QUOTE_CHARACTER || rConst.CLOSE_BRACKET || rConst.COMMA_CHARACTER
                                                || 'alias_array = ' || 'array_replace'
                                                    || rConst.OPEN_BRACKET || 'alias_array' || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pOldTableName || rConst.DOT_CHARACTER || rConst.SINGLE_QUOTE_CHARACTER || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pNewTableName || rConst.DOT_CHARACTER || rConst.SINGLE_QUOTE_CHARACTER || rConst.CLOSE_BRACKET || rConst.COMMA_CHARACTER
                                                || 'rowid_array = ' || 'array_replace'
                                                    || rConst.OPEN_BRACKET || 'rowid_array' || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pOldTableName || '_m_row$' || rConst.SINGLE_QUOTE_CHARACTER || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || pNewTableName || '_m_row$' || rConst.SINGLE_QUOTE_CHARACTER || rConst.CLOSE_BRACKET || rConst.COMMA_CHARACTER
                                                || 'log_array = ' || 'array_replace'
                                                    || rConst.OPEN_BRACKET || 'log_array' || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || 'log$_' || pOldTableName || rConst.SINGLE_QUOTE_CHARACTER || rConst.COMMA_CHARACTER
                                                    || rConst.SINGLE_QUOTE_CHARACTER || 'log$_' || pNewTableName || rConst.SINGLE_QUOTE_CHARACTER || rConst.CLOSE_BRACKET;
        tUpdateTriggerName                  := 'ALTER TRIGGER ' || 'trig$_' || pOldTableName || rConst.ON_COMMAND || pNewTableName || rConst.RENAME_TO_COMMAND || 'trig$_' || pNewTableName;
    
        EXECUTE tRenameLogTableSqlStatement;
        EXECUTE tUpdateMViewLogsTableSqlStatement;
        EXECUTE tUpdateMViewTableColumns;
        EXECUTE tUpdateTriggerName;
    
        RETURN;
    
        EXCEPTION
        WHEN OTHERS
        THEN
            RAISE INFO      'Exception in function mv$renameMaterializedViewLog';
            RAISE INFO      'Error %:- %:',     SQLSTATE, SQLERRM;
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
