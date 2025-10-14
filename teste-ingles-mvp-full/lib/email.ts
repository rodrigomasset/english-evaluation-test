import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})
export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromName = process.env.MAIL_FROM_NAME || 'Teste de inglês'
  const fromAddr = process.env.MAIL_FROM_ADDR || process.env.SMTP_USER!
  await transporter.sendMail({ from: `${fromName} <${fromAddr}>`, to, subject, html })
}
