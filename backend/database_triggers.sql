-- PostgreSQL Triggers for Automatic NOTIFY on Inventory Changes
-- Run this SQL script in your PostgreSQL database to enable automatic notifications
-- even when changes are made directly to the database (bypassing the API)

-- Function to send NOTIFY when inventory_items table changes
CREATE OR REPLACE FUNCTION notify_inventory_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Build JSON payload based on operation type
  IF TG_OP = 'INSERT' THEN
    payload := json_build_object(
      'action', 'created',
      'id', NEW.id,
      'timestamp', NOW()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload := json_build_object(
      'action', 'updated',
      'id', NEW.id,
      'timestamp', NOW()
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'action', 'deleted',
      'id', OLD.id,
      'timestamp', NOW()
    );
  END IF;

  -- Send NOTIFY
  PERFORM pg_notify('inventory_changes', payload::text);
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for INSERT, UPDATE, DELETE on inventory_items
DROP TRIGGER IF EXISTS inventory_items_insert_trigger ON inventory_items;
CREATE TRIGGER inventory_items_insert_trigger
  AFTER INSERT ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_inventory_changes();

DROP TRIGGER IF EXISTS inventory_items_update_trigger ON inventory_items;
CREATE TRIGGER inventory_items_update_trigger
  AFTER UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_inventory_changes();

DROP TRIGGER IF EXISTS inventory_items_delete_trigger ON inventory_items;
CREATE TRIGGER inventory_items_delete_trigger
  AFTER DELETE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_inventory_changes();

-- Verify triggers are created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'inventory_items';

