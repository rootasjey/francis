-- Polar billing integration columns for users table
ALTER TABLE users ADD COLUMN polar_customer_id TEXT;
ALTER TABLE users ADD COLUMN polar_subscription_id TEXT;
ALTER TABLE users ADD COLUMN polar_subscription_status TEXT;
ALTER TABLE users ADD COLUMN polar_product_tier TEXT;
ALTER TABLE users ADD COLUMN subscription_ends_at INTEGER;
