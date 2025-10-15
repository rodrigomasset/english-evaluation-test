import nodemailer from 'nodemailer'

const FROM_NAME = 'Teste de inglês'
const FROM_EMAIL = process.env.MAIL_FROM || 'rodrigocmasset@gmail.com'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'rodrigocmasset@gmail.com',
    pass: process.env.SMTP_PASS, // senha de app do Gmail
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  })
  return info.messageId
}

// Facilidade para reenvio do teste
export async function resendTest(to: string, studentName: string, html: string) {
  const subject = `Teste Inglês de ${studentName}`
  return sendEmail(to, subject, html)
}
