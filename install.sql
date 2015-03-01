CREATE OR REPLACE FUNCTION {{= it.names.notifyTriggerFunc }}() RETURNS trigger AS $$
DECLARE
  data text := '{}';
BEGIN
  data := '{"table": "' || TG_TABLE_NAME || '",
      "operation": "' || TG_OP || '",
      "timestamp": "' || CURRENT_TIMESTAMP || '"';

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    data := data || ', "data": ' || row_to_json(NEW);
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    data := data || ', "old_data": ' || row_to_json(OLD);
  END IF;

  data := data || '}';

  PERFORM pg_notify('{{= it.changesChannel }}', data);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION {{= it.names.addNotifyTrigger }}(table_name text) 
RETURNS VOID as $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS {{= it.names.notifyTrigger }} ON ' || table_name::regclass;

  EXECUTE '
    CREATE TRIGGER {{= it.names.notifyTrigger }}
      AFTER INSERT OR UPDATE OR DELETE
      ON ' || table_name::regclass || ' 
      FOR EACH ROW 
      EXECUTE PROCEDURE {{= it.names.notifyTriggerFunc }}()';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION {{= it.names.removeNotifyTrigger }}(table_name text)
RETURNS VOID AS $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS {{= it.names.notifyTrigger }} ON ' || table_name::regclass;
END;
$$ LANGUAGE plpgsql;
