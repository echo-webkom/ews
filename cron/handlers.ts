import { db } from "../lib/db.ts";
import { sql } from "npm:kysely";

export const handleDeleteSensitiveQuestions = async () => {
  const result = await db
    .deleteFrom("answer")
    .where(
      "question_id",
      "in",
      db
        .selectFrom("question")
        .leftJoin("happening", "happening_id", "id")
        .where("date", "<", sql<Date>`NOW() - INTERVAL '30 days'`)
        .where("is_sensitive", "=", true)
        .select("id")
    )
    .execute();
  console.log(`Deleted ${result.length} sensitive questions`);
};

export const handleDeleteOldStrikes = async () => {
  const result = await db
    .deleteFrom("strike_info")
    .where("created_at", "<", sql<Date>`NOW() - INTERVAL '1 year'`)
    .execute();
  console.log(`Deleted ${result.length} old strikes`);
};

export const handleUnbanUsers = async () => {
  await fetch("https://echo.uib.no/api/unban", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("ADMIN_KEY")}`,
    },
  });
};

export const handleResetYear = async () => {
  const result = await db
    .updateTable("user")
    .set("year", null)
    .returning("id")
    .execute();
  console.log(`Reset ${result.length} users' years`);
};

export const handleCheckForNewFeedbacks = async () => {
  const result = await db
    .selectFrom("site_feedback")
    .where("created_at", ">", sql<Date>`NOW() - INTERVAL '1 day'`)
    .execute();
  const numberOfNewFeedbacks = result.length;

  console.log(`Found ${numberOfNewFeedbacks} new feedbacks`);

  if (numberOfNewFeedbacks > 0) {
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
        to: ["me@omfj.no", "n.d.engh@gmail.com", "KjetilAlvestad@gmail.com"],
        subject: `${numberOfNewFeedbacks} ny(e) tilbakemeldinger på echo.uib.no`,
        html: `<p>Det har kommet ${numberOfNewFeedbacks} ny(e) tilbakemelding(er) på <a href="https://echo.uib.no">echo.uib.no</a>. Les de(n) <a href="https://echo.uib.no/admin/tilbakemeldinger">her</a>.</p>`,
      }),
    });
  }
};
