const RESEND_API_URL = "https://api.resend.com/emails";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export const sendEmail = async (
  to: Array<string>,
  subject: string,
  body: string
) => {
  if (!RESEND_API_KEY) {
    console.error("No RESEND_API_KEY provided");

    console.log("TO: ", to);
    console.log("SUBJECT: ", subject);
    console.log("BODY: ", body);

    return;
  }

  await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "echo <ikkesvar@echo-webkom.no>",
      to,
      subject,
      html: body,
    }),
  });
};
