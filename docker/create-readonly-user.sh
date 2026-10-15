set -euo pipefail

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-rightsave}"

docker exec -i rightsave-db psql -U "$DB_USER" -d "$DB_NAME" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ml_readonly') THEN
    CREATE ROLE ml_readonly WITH LOGIN PASSWORD 'ml_readonly';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE rightsave TO ml_readonly;
GRANT USAGE ON SCHEMA public TO ml_readonly;
GRANT SELECT ON "Content", "UserMemory", "Collection", "ContentCollection" TO ml_readonly;
SQL

echo "ml_readonly ready"