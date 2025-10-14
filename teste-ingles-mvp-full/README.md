# Teste de Inglês – MVP (Next.js + Vercel + Supabase)

## Deploy (somente cliques)
1) Supabase → crie projeto Postgres → SQL Editor → cole `scripts/seed.sql` → Run.
2) GitHub → crie repo → faça upload de todo o conteúdo deste projeto.
3) Vercel → New Project → Import Git Repository → adicione Environment Variables:
   - DATABASE_URL (string do Supabase)
   - JWT_SECRET (chave longa aleatória)
   - USE_PLAINTEXT_PASSWORDS=true
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=465
   - SMTP_SECURE=true
   - SMTP_USER=rodrigocmasset@gmail.com
   - SMTP_PASS=<App Password>
   - MAIL_FROM_NAME=Teste de inglês
   - MAIL_FROM_ADDR=rodrigocmasset@gmail.com
   - ADMIN_SEED_SECRET=seed-123456
4) Deploy → acesse `/api/admin/seed?secret=seed-123456` para importar ~210 questões.
5) Teste: `/teste?ref=01`, `/professor/login`, `/master/login`.
