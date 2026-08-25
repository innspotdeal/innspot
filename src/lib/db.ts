import { Pool } from "pg";
import "server-only";

// اتصال واحد بقاعدة البيانات يتشارك فيه كل السيرفر (Connection Pool)
// محتاج متغير بيئة DATABASE_URL (رابط قاعدة بيانات Postgres)
declare global {
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL غير موجود في متغيرات البيئة");
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });
}

export const pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}
