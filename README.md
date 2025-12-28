# ChasCareer

**Karriärplattform för Chas Academy-studenter** - Hjälper studerande att navigera sin LIA- och karriärresa.

## 🚀 Live Demo
https://chas-career-si1d.vercel.app

## ✨ Features

### För Studerande
- 📊 **Progressionsspårning** - Markera avklarade moment i FAS 1-4
- 🏢 **Företagsdatabas** - Föreslå och hitta LIA-företag
- 📝 **LIA-hantering** - Ansök om och hantera LIA-platser
- 🔔 **Slack-notifikationer** - Påminnelser och statusuppdateringar

### För Admin/Utbildare
- 👥 **Användarhantering** - Lägg till, redigera och ta bort användare
- 🏢 **Företagshantering** - Godkänn föreslagna företag, CSV-import
- 📈 **Rapporter** - Individ-, grupp- och klassrapporter med export
- 💬 **Slack DM** - Skicka direktmeddelanden till studenter
- 🌙 **Dark/Light mode** - Växla mellan ljust och mörkt tema


## �🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js (Google OAuth + Credentials)
- **Deploy:** Vercel

## 🏁 Kom igång

### Förutsättningar
- Node.js 18+
- PostgreSQL-databas (eller Supabase)

### Installation
```bash
# Klona repo
git clone https://github.com/KemalGuclu/ChasCareer.git
cd ChasCareer

# Installera dependencies
npm install

# Kopiera miljövariabler
cp .env.example .env
# Fyll i dina värden i .env

# Generera Prisma-klient
npx prisma generate

# Kör migrationer
npx prisma migrate deploy

# Seed databasen (optional)
npx prisma db seed

# Starta dev-server
npm run dev
```

## 🔐 Miljövariabler
Se `.env.example` för alla variabler. Viktiga:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Slumpad sträng för sessions
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `SLACK_WEBHOOK_URL` - Slack kanal-notifikationer
- `SLACK_BOT_TOKEN` - Slack DM (börjar med xoxb-)

## 📁 Projektstruktur
```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard-sidor
│   └── login/         # Auth-sidor
├── components/
│   ├── layout/        # Layout-komponenter
│   └── ui/            # shadcn/ui komponenter
└── lib/
    ├── auth.ts        # NextAuth config
    └── prisma.ts      # Prisma client
```

## 🧪 Demo-inloggning
Använd demo-knapparna på login-sidan för att testa som:
- **Admin** - Full åtkomst
- **Utbildare** - Se grupper och rapporter
- **Studerande** - Progression och LIA

## 📝 License
MIT
