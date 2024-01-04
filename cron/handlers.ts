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

interface Feedback {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  category: string;
  is_read: boolean;
  created_at: Date;
}

export const handleCheckForNewFeedbacks = async () => {
  const result = await sql<Array<Feedback>>`
    SELECT
      id
    FROM
      site_feedback
    WHERE
      created_at > NOW() - INTERVAL '1 day';
  `;

  if (result.count > 0) {
    console.log(`Found ${result.count} new feedbacks`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "echo <ikkesvar@echo-webkom.no>",
        to: ["me@omfj.no"],
        subject: `Det har kommet ${result.count} nye tilbakemeldinger på echo-webkom.no`,
        html: "<p>Det har kommet nye tilbakemeldinger på echo-webkom.no</p>",
      }),
    });
  } else {
    console.log("Found no new feedbacks");
  }
};
