GRANT :db_user to :mv_user;
GRANT USAGE ON SCHEMA public TO :mv_user;
GRANT ALL ON SCHEMA :mv_user TO :db_user;
GRANT USAGE ON FOREIGN SERVER pgmv$_instance TO :db_user;

GRANT pgmv$_role TO :db_user;

ALTER ROLE :mv_user SET search_path TO public,:mv_user;
ALTER ROLE :db_user SET search_path TO public,:mv_user;

GRANT USAGE ON SCHEMA public TO :mv_user;
GRANT ALL PRIVILEGES ON DATABASE :db_name TO :mv_user;
GRANT ALL ON SCHEMA public  TO :mv_user;
GRANT USAGE ON SCHEMA public  TO :mv_user;
GRANT USAGE ON SCHEMA :mv_user TO :db_user;
GRANT ALL ON SCHEMA public TO :mv_user;

GRANT pgmv$_view, pgmv$_usage, pgmv$_execute TO :db_user;
