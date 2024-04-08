import { db } from "../lib/db.ts";
import { sql } from "npm:kysely";
import { sendEmail } from "../lib/email.ts";

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
  const response = await fetch("https://echo.uib.no/api/unban", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("ADMIN_KEY")}`,
    },
  });

  console.log("Ping to /api/unban:", response.status);
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
  const feedbacks = await db
    .selectFrom("site_feedback")
    .selectAll()
    .where("created_at", ">", sql<Date>`NOW() - INTERVAL '1 day'`)
    .where("is_read", "=", false)
    .execute();

  console.log(`Found ${feedbacks.length} new feedbacks`);

  if (feedbacks.length > 0) {
    const to = ["me@omfj.no", "n.d.engh@gmail.com", "KjetilAlvestad@gmail.com"];
    const subject = `${feedbacks.length} ny(e) tilbakemeldinger på echo.uib.no`;

    const body = [
      `<p>Det har kommet ${feedbacks.length} ny(e) tilbakemelding(er) på <a href="https://echo.uib.no">echo.uib.no</a>. Les de(n) <a href="https://echo.uib.no/admin/tilbakemeldinger">her</a>.</p>`,
      '<ul style="padding-top: 2rem;">',
      ...feedbacks.map(
        (feedback) => `<li>
      <div>
        <p><strong>${feedback.name ?? "Ukjent"}</strong> (${
          feedback.email ?? "Ingen e-post"
        })</p>
        <p>${feedback.message}</p>
      </div>
      </li>`
      ),
      "</ul>",
    ].join("");

    await sendEmail(to, subject, body);
  }
};
