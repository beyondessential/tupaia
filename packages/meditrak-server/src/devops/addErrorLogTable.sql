CREATE TABLE error_log (
    id TEXT PRIMARY KEY,
    api_request_log_id TEXT REFERENCES api_request_log(id) ON DELETE CASCADE ON UPDATE CASCADE,
    type TEXT,
    error_time TIMESTAMP DEFAULT now()
);
