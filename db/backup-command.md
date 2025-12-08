# schema.sql
pg_dump -U liora -d devdb --schema-only --no-owner --no-privileges -f schema.sql

# seeder.sql
(echo "SET session_replication_role = replica;"; \
 pg_dump -U liora -d devdb --data-only --no-owner --no-privileges --column-inserts; \
 echo "SET session_replication_role = DEFAULT;") > seeder.sql

# backup.sql
pg_dump -U liora -d devdb --no-owner --no-privileges -f backup.sql
