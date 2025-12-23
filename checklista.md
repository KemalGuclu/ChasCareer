# ChasCareer Webapp – Checklista & Todo

> Bocka av varje steg med `[x]` när det är klart.

---

## Fas 1: Discovery & Kravanalys

### Dokumentation
- [ ] Granska befintlig kravspecifikation.md
- [ ] Granska PRD.md
- [ ] Sammanställa frågor till användarintervjuer

### Användarintervjuer
- [ ] Boka intervjuer med Backoffice (3-4 personer)
  - [ ] Person 1: __________ (datum: ____)
  - [ ] Person 2: __________ (datum: ____)
  - [ ] Person 3: __________ (datum: ____)
- [ ] Boka intervjuer med Utbildare (2-3 personer)
  - [ ] Person 1: __________ (datum: ____)
  - [ ] Person 2: __________ (datum: ____)
- [ ] Boka intervjuer med Studerande (5-6 personer)
  - [ ] Person 1: __________ (datum: ____)
  - [ ] Person 2: __________ (datum: ____)
  - [ ] Person 3: __________ (datum: ____)
  - [ ] Person 4: __________ (datum: ____)
  - [ ] Person 5: __________ (datum: ____)
- [ ] Sammanställa intervju-insights

### Teknisk Analys
- [ ] Analysera befintlig data för eventuell migrering
- [ ] Kartlägga Canvas-integration möjligheter
- [ ] Dokumentera befintliga dataformat
- [ ] Identifiera migreringsplan

### Leverabler Fas 1
- [ ] ✅ Validerad kravspecifikation
- [ ] ✅ Prioriterade user stories
- [ ] ✅ MVP-scope dokument
- [ ] ✅ Integrationsplan

---

## Fas 2: Design

### Designsystem
- [ ] Välj färgschema
- [ ] Välj typsnitt
- [ ] Definiera spacing och grid
- [ ] Skapa komponentbibliotek

### Wireframes
- [ ] Dashboard – Admin
  - [ ] Översiktsvy
  - [ ] Filtreringsvy
  - [ ] Detaljvy studerande
- [ ] Dashboard – Studerande
  - [ ] Min progression
  - [ ] Mina leads
- [ ] Dashboard – Utbildare
- [ ] Processvy (fas-visualisering)
- [ ] Företagsdatabas
  - [ ] Listvy
  - [ ] Detaljvy företag
  - [ ] Lägg till/redigera
- [ ] Inloggningssida

### Hi-fi Mockups
- [ ] Alla wireframes till hi-fi
- [ ] Responsiva varianter (mobil, tablet)
- [ ] Mörkt läge (valfritt)

### Prototyp
- [ ] Klickbar prototyp i Figma
- [ ] Alla huvudflöden testbara

### Användartester
- [ ] Rekrytera 3-5 testpersoner
- [ ] Genomför tester
- [ ] Dokumentera feedback
- [ ] Prioritera ändringar
- [ ] Iterera design

### Leverabler Fas 2
- [ ] ✅ Designsystem
- [ ] ✅ Godkända wireframes
- [ ] ✅ Hi-fi mockups
- [ ] ✅ Klickbar prototyp
- [ ] ✅ Användartest-rapport

---

## Fas 3: MVP-utveckling

### Sprint 1: Setup & Autentisering

#### Projektsetup
- [ ] Skapa Git-repo
- [ ] Initiera Next.js projekt
- [ ] Konfigurera TypeScript
- [ ] Sätta upp ESLint & Prettier
- [ ] Installera beroenden

#### Databas
- [ ] Skapa databas (Supabase/PostgreSQL)
- [ ] Definiera schema
- [ ] Skapa migrations
- [ ] Sätta upp ORM (Prisma/Drizzle)

#### Autentisering
- [ ] Konfigurera NextAuth.js
- [ ] Implementera inloggning
- [ ] Skapa middleware för skyddade routes
- [ ] Testa rollbaserad åtkomst

#### CI/CD
- [ ] Sätta upp GitHub Actions
- [ ] Konfigurera preview deployments
- [ ] Sätta upp staging-miljö (Vercel)

### Sprint 2-3: Dashboard

#### Layout
- [ ] Skapa grundläggande layout-komponent
- [ ] Implementera navigation (sidebar/topbar)
- [ ] Skapa header med användarinfo
- [ ] Responsiv navigation (hamburger-meny)

#### Admin Dashboard
- [ ] Översiktskomponent med nyckeltal
- [ ] Lista alla studerande
- [ ] Implementera filtrering
  - [ ] Per Career-grupp
  - [ ] Per fas (1-4)
  - [ ] Per status
- [ ] Implementera sök
- [ ] Visa detaljer för studerande

#### Studerande Dashboard
- [ ] Visa aktuell fas
- [ ] Visa progression (%)
- [ ] Lista avklarade moment
- [ ] Lista kommande moment/deadlines
- [ ] Visa mål och status

#### Utbildare Dashboard
- [ ] Lista tilldelade grupper
- [ ] Enkel statistik

#### Kvalitet
- [ ] Unit tests för komponenter
- [ ] Responsiv testning

### Sprint 4-5: Processmodul

#### Datamodell
- [ ] Skapa Progression-tabell
- [ ] Skapa Milestone-tabell
- [ ] Skapa Phase-tabell
- [ ] Seed initial data (FAS 1-4, moment)

#### UI
- [ ] Fas-visualisering (timeline/stepper)
- [ ] Momentlista per fas
- [ ] "Markera som klar"-knapp
- [ ] Bekräftelsedialog
- [ ] Kommentarfält

#### Automation
- [ ] Skapa cron-jobb för påminnelser
- [ ] Implementera notifikationssystem
  - [ ] In-app notifikationer
  - [ ] Email (valfritt)
- [ ] Logik för deadline-påminnelser (7 dagar, 1 dag)

#### Kvalitet
- [ ] Integration tests
- [ ] E2E test för markera moment

### MVP Checklista
- [ ] ✅ Användarhantering fungerar
- [ ] ✅ Admin kan se alla studerande
- [ ] ✅ Admin kan filtrera och söka
- [ ] ✅ Studerande kan logga in
- [ ] ✅ Studerande ser sin progression
- [ ] ✅ Studerande kan markera moment
- [ ] ✅ Påminnelser fungerar
- [ ] ✅ Responsiv design fungerar
- [ ] ✅ Deployment på staging

---

## Fas 4: V1.0 Features

### Sprint 6-7: Företagsdatabas

#### Datamodell
- [ ] Skapa Company-tabell
- [ ] Skapa Contact-tabell
- [ ] Skapa LIA_Placement-tabell
- [ ] Skapa Lead-tabell
- [ ] Definiera relationer

#### Företag CRUD
- [ ] Lista företag
- [ ] Sök och filter (stad, bransch, storlek)
- [ ] Visa företagsdetaljer
- [ ] Lägg till företag
- [ ] Redigera företag
- [ ] Ta bort företag

#### Kontakter CRUD
- [ ] Lista kontakter för ett företag
- [ ] Lägg till kontakt
- [ ] Redigera kontakt
- [ ] Ta bort kontakt

#### LIA-platser
- [ ] Lista LIA-platser
- [ ] Registrera ny LIA-plats
- [ ] Koppla studerande till plats
- [ ] Status-hantering
- [ ] Visa historik

#### Leads
- [ ] Koppla lead till studerande
- [ ] Statushantering
- [ ] Synka med studerandes CRM

#### Import
- [ ] Inbyggd CRM-modul i databasen
- [ ] Import-flöde med preview
- [ ] Validering och felhantering

### Sprint 8: Rapportering

#### Rapporttyper
- [ ] Individrapport
  - [ ] Fas-status
  - [ ] Antal leads
  - [ ] Antal kontakter
  - [ ] Studiebesök
- [ ] Grupprapport
  - [ ] Aggregerad fas-status
  - [ ] Jämförelse mellan studerande
- [ ] Klassrapport
  - [ ] Översiktsstatistik
  - [ ] Trenddiagram

#### Export
- [ ] PDF-generering (react-pdf / puppeteer)
- [ ] Excel-export (xlsx)
- [ ] Ladda ner-funktion

### Sprint 9: Slack-integration

#### Setup
- [ ] Skapa Slack-app
- [ ] Konfigurera OAuth
- [ ] Spara tokens säkert

#### Funktioner
- [ ] Webhook för notifikationer
- [ ] Deadline-påminnelser till kanal
- [ ] DM till enskild studerande
- [ ] Konfigurera vilka events som triggrar

#### Test
- [ ] Testa i test-workspace
- [ ] Dokumentera setup

### V1.0 Checklista
- [ ] ✅ Företagsdatabas komplett
- [ ] ✅ LIA-platshantering fungerar
- [ ] ✅ Rapporter kan genereras
- [ ] ✅ PDF-export fungerar
- [ ] ✅ Excel-export fungerar
- [ ] ✅ Slack-notifikationer fungerar

---

## Fas 5: Testning & Lansering

### Testning

#### Automatiserade Tester
- [ ] E2E-tester för kritiska flöden
  - [ ] Inloggning
  - [ ] Markera moment
  - [ ] Generera rapport
  - [ ] CRUD företag
- [ ] Prestandatestning (k6/Artillery)
- [ ] Belastningstestning (200 användare)

#### Säkerhet
- [ ] OWASP-check
- [ ] Penetrationstestning (basic)
- [ ] GDPR-granskning

#### UAT (User Acceptance Testing)
- [ ] Förbered testscenarier
- [ ] UAT med Backoffice
  - [ ] Person 1: __________ (datum: ____)
  - [ ] Person 2: __________ (datum: ____)
- [ ] UAT med Studerande
  - [ ] Person 1: __________ (datum: ____)
  - [ ] Person 2: __________ (datum: ____)
- [ ] Samla feedback
- [ ] Prioritera bugfixar

#### Bugfixar
- [ ] Kritiska buggar
- [ ] Höga buggar
- [ ] Medel buggar
- [ ] Re-test

### Dokumentation
- [ ] Användardokumentation (Backoffice)
- [ ] Användardokumentation (Studerande)
- [ ] Teknisk dokumentation
- [ ] API-dokumentation
- [ ] Driftdokumentation

### Lansering

#### Produktionsmiljö
- [ ] Sätt upp produktionsmiljö
- [ ] Konfigurera domän
- [ ] SSL-certifikat
- [ ] Sätt upp monitoring (Sentry/LogRocket)
- [ ] Konfigurera backups

#### Datamigrering
- [ ] Exportera data från nuvarande system
- [ ] Validera data
- [ ] Importera till produktion
- [ ] Verifiera integritet

#### Utbildning
- [ ] Planera utbildningstillfällen
- [ ] Utbildning Backoffice (datum: ____)
- [ ] Utbildning Utbildare (datum: ____)
- [ ] Quick-start guide till studerande

#### Go-Live
- [ ] Soft launch med en klass
- [ ] Samla feedback
- [ ] Justera vid behov
- [ ] Full lansering
- [ ] Kommunicera till alla användare

### Lanserings-Checklista
- [ ] ✅ Alla kritiska buggar fixade
- [ ] ✅ Prestanda acceptabel (< 2s)
- [ ] ✅ Säkerhet verifierad
- [ ] ✅ GDPR-compliant
- [ ] ✅ Dokumentation klar
- [ ] ✅ Produktion uppsatt
- [ ] ✅ Data migrerad
- [ ] ✅ Personal utbildad
- [ ] ✅ Soft launch genomförd
- [ ] ✅ Lansering! 🎉

---

## Post-Lansering

### Vecka 1-2
- [ ] Övervaka prestanda
- [ ] Övervaka error logs
- [ ] Svara på supportärenden
- [ ] Samla användarfeedback
- [ ] Prioritera förbättringar

### Månad 1
- [ ] NPS-enkät
- [ ] Analysera användningsdata
- [ ] Planera V1.1 (bugfixar + små förbättringar)
- [ ] Retrospektiv med teamet

---

## Snabb Referens

### Kontakter
| Roll | Namn | Kontakt |
|------|------|---------|
| Product Owner | | |
| Tech Lead | | |
| Designer | | |
| Backoffice-kontakt | | |

### Länkar
| Resurs | URL |
|--------|-----|
| Git-repo | |
| Staging | |
| Produktion | |
| Figma | |
| Slack-kanal | |

### Kommandon
```bash
# Starta utvecklingsserver
npm run dev

# Kör tester
npm test

# Bygg för produktion
npm run build

# Kör migrations
npx prisma migrate dev
```
