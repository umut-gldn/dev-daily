import { getJson, setJson } from "./_lib/storage.js";

const LIST_KEY = "email:subscribers";

const isValidEmail = (value) => {
  if (!value || typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getList = async () => {
  const list = await getJson(LIST_KEY);
  return Array.isArray(list) ? list : [];
};

const saveList = async (list) => {
  await setJson(LIST_KEY, list);
};

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) throw new Error("Email service not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email error ${res.status}: ${text}`);
  }
};

export default async function handler(req, res) {
  return res.status(503).json({ ok: false, error: "Email digest disabled" });

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const action = body.action;

  if (action === "subscribe") {
    const email = body.email;
    if (!isValidEmail(email)) return res.status(400).json({ ok: false, error: "Invalid email" });
    const list = await getList();
    if (!list.includes(email)) list.push(email);
    await saveList(list);
    return res.status(200).json({ ok: true, count: list.length });
  }

  if (action === "unsubscribe") {
    const email = body.email;
    if (!isValidEmail(email)) return res.status(400).json({ ok: false, error: "Invalid email" });
    const list = await getList();
    const next = list.filter((e) => e !== email);
    await saveList(next);
    return res.status(200).json({ ok: true, count: next.length });
  }

  if (action === "send") {
    const to = body.to;
    const subject = body.subject || "Dev Daily Digest";
    const html = body.html;
    if (!to || !html) return res.status(400).json({ ok: false, error: "Missing to/html" });
    await sendEmail({ to, subject, html });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: "Unknown action" });
}
