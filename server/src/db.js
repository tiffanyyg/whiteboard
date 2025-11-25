import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PG_HOST || "postgres",
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || "whiteboard",
  password: process.env.PG_PASSWORD || "whiteboard",
  database: process.env.PG_DATABASE || "whiteboarddb",
});

export async function saveBoard(json) {
  await pool.query(
    "INSERT INTO boards (board_data, updated_at) VALUES ($1, NOW())",
    [json]
  );
}

export async function getLatestBoard() {
  const result = await pool.query(
    "SELECT board_data FROM boards ORDER BY updated_at DESC LIMIT 1"
  );

  if (result.rows.length === 0) return null;

  return result.rows[0].board_data;
}
