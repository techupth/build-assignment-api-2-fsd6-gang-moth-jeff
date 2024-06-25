// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;
import 'dotenv/config';

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:Skytab09@localhost:5432/Creating Data API Assignment",
});

export default connectionPool;
