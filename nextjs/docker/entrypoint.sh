# #!/usr/bin/env bash
# set -euo pipefail

# DB_HOST="${DB_HOST:-db}"
# DB_PORT="${DB_PORT:-5432}"
# DB_USER="${DB_USER:-pipetech}"
# DB_PASSWORD="${DB_PASSWORD:-Admin@9999}"
# DB_NAME="${DB_NAME:-pipetech}"

# export PGPASSWORD="$DB_PASSWORD"

# echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}/${DB_NAME} ..."
# for i in {1..90}; do
#   if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
#     echo "Postgres is ready."
#     break
#   fi
#   sleep 1
# done

# # Prisma generate is done in build time.
# # echo "Prisma generate..."
# # npx prisma@6.0.0 generate

# # Demo-friendly: apply schema without requiring migrations.
# echo "Prisma db push..."
# npx prisma@6.0.0 db push --skip-generate

# # Optional (project plan): timeblocks + exclusion constraint hard-rule.
# if [ -f "./scripts/post_migrate.sql" ]; then
#   echo "Applying post_migrate.sql ..."
#   psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -v ON_ERROR_STOP=1 -f ./scripts/post_migrate.sql
# fi

# echo "Seeding demo data..."
# node ./prisma/seed.mjs

echo "Starting Next.js..."
npm run dev
