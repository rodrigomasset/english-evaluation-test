import nodemailer from 'nodemailer'

const FROM_EMAIL = process.env.FROM_EMAIL || 'rodrigocmasset@gmail.com'
const FROM_NAME = 'Teste de inglês'

// Configura o transporte com Gmail (senha de app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FROM_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD || 'qzmt uosx jpwk bqnd',
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

// Alias compatível com o código das rotas
export async function sendMail(args: { to: string; subject: string; html: string }) {
  return sendEmail(args.to, args.subject, args.html)
}

// Facilidade para reenvio do teste
export async function resendTest(to: string, studentName: string, html: string) {
  const subject = `Teste Inglês de ${studentName}`
  return sendEmail(to, subject, html)
}
