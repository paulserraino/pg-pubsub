CREATE OR REPLACE FUNCTION notify_trigger() RETURNS trigger AS $$
DECLARE
  _json_ text := '{}';
  result record;
BEGIN
	IF TG_OP = 'INSERT' THEN
		_json_ := '{"table": "' || TG_TABLE_NAME || '",
  		"operation": "insert",
		  "timestamp": "' || CURRENT_TIMESTAMP || '",
		  "data": ' || row_to_json(NEW) || '}';

  ELSIF TG_OP = 'UPDATE' THEN
    _json_ := '{"table": "' || TG_TABLE_NAME || '",
      "operation": "update",
      "timestamp": "' || CURRENT_TIMESTAMP || '",
      "old_data": ' || row_to_json(OLD) || ',
      "data": ' || row_to_json(NEW) || '}';

  ELSIF TG_OP = 'DELETE' THEN
    _json_ := '{"table": "' || TG_TABLE_NAME || '",
      "operation": "delete",
      "timestamp": "' || CURRENT_TIMESTAMP || '",
      "data": ' || row_to_json(OLD) || '}';
  END IF;

  PERFORM pg_notify(TG_TABLE_NAME::text, _json_);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_notify_trigger_to_table(table_name text) 
RETURNS VOID as $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS notify_trigger_event ON ' || table_name::regclass;

  EXECUTE '
    CREATE TRIGGER notify_trigger_event
      AFTER INSERT OR UPDATE OR DELETE
      ON ' || table_name::regclass || ' 
      FOR EACH ROW 
      EXECUTE PROCEDURE notify_trigger()';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_notify_trigger_from_table(table_name text)
RETURNS VOID AS $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS notify_trigger_event ON ' || table_name::regclass;
END;
$$ LANGUAGE plpgsql;
