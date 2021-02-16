GRANT :db_user to mvrefresh;
GRANT USAGE ON SCHEMA public TO mvrefresh;
GRANT ALL ON SCHEMA mvrefresh TO :db_user;
GRANT USAGE ON FOREIGN SERVER pgmv$_instance TO :db_user;

GRANT pgmv$_role TO :db_user;

ALTER ROLE mvrefresh SET search_path TO public,mvrefresh;
ALTER ROLE :db_user SET search_path TO public,mvrefresh;

GRANT USAGE ON SCHEMA public TO mvrefresh;
GRANT ALL PRIVILEGES ON DATABASE :db_user TO mvrefresh;
GRANT ALL ON SCHEMA public  TO mvrefresh;
GRANT USAGE ON SCHEMA public  TO mvrefresh;
GRANT mvrefresh TO :db_user;
GRANT USAGE ON SCHEMA mvrefresh TO :db_user;
GRANT ALL ON SCHEMA public TO mvrefresh;


GRANT pgmv$_view, pgmv$_usage TO :db_user;
GRANT pgmv$_view, pgmv$_usage, pgmv$_execute TO :db_user;
GRANT USAGE ON FOREIGN SERVER pgmv$_instance TO :db_user;