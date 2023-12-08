import sql from "../lib/pg.ts";

export const handleDeleteSensitiveQuestions = async () => {
  const result = await sql`
  DELETE FROM
    answer
  WHERE question_id IN (
      SELECT
        q.id
      FROM
        question q
      JOIN
        happening h ON q.happening_id = h.id
      WHERE
        h.date < NOW() - INTERVAL '30 days'
      AND
        q.is_sensitive = true
  )`;
  console.log(`Deleted ${result.count} sensitive questions`);
};

export const handleDeleteOldStrikes = async () => {
  const result = await sql`
  DELETE FROM
    strike_info
  WHERE
    created_at < NOW() - INTERVAL '1 year'
  `;
  console.log(`Deleted ${result.count} old strikes`);
};

export const handleResetYear = async () => {
  const result = await sql`
    UPDATE
      "user"
    SET
      year = null
  `;
  console.log(`Reset ${result.count} users' years`);
};
