# 👨‍💼 Administratörsguide - ChasCareer

Denna guide är för dig som har **Admin-rollen** i ChasCareer.

---

## 📋 Översikt

Som administratör har du tillgång till alla funktioner i systemet:
- Användarhantering
- Företagshantering
- Rapporter och statistik
- Systemkonfiguration

---

## 👥 Användarhantering

### Navigera till Användare
1. Logga in som admin
2. Klicka på **"Användare"** i sidomenyn (under Admin-sektionen)

### Lägg till ny användare
1. Klicka på **"Lägg till användare"**
2. Fyll i:
   - **Email** - Användarens email (används för inloggning)
   - **Namn** - Visningsnamn
   - **Roll** - Välj mellan Admin, Utbildare eller Studerande
   - **Career-grupp** - Välj grupp (valfritt)
3. Klicka **"Lägg till"**

### Redigera användare
1. Klicka på **pennikonen** bredvid användaren
2. Ändra önskade fält
3. Klicka **"Spara"**

### Ta bort användare
1. Klicka på **papperskorgen** bredvid användaren
2. Bekräfta borttagningen

> ⚠️ **Varning:** Att ta bort en användare raderar all associerad data!

---

## 🏢 Företagshantering

### Godkänna föreslagna företag
1. Gå till **"Företag"** i menyn
2. Se den gula rutan **"Väntande godkännande"** högst upp
3. Klicka ✓ för att godkänna eller ✗ för att avvisa

### Importera företag via CSV
1. Klicka på **"Importera CSV"**
2. Ladda upp en CSV-fil med följande kolumner:
   - `name` (obligatoriskt) - Företagsnamn
   - `city` (obligatoriskt) - Stad
   - `industry` - Bransch (valfritt)
   - `size` - Storlek (valfritt)
   - `website` - Webbplats (valfritt)
   - `description` - Beskrivning (valfritt)
3. Klicka **"Importera"**

**Exempelformat:**
```csv
name,city,industry,size,website
Spotify,Stockholm,Tech,1000+,https://spotify.com
Ericsson,Stockholm,Telecom,10000+,https://ericsson.com
```

### Redigera företag
1. Klicka på ett företag i listan
2. Klicka på **"Redigera"**
3. Uppdatera informationen
4. Klicka **"Spara"**

### Hantera kontakter
1. Gå till företagets detaljsida
2. Under "Kontakter" kan du:
   - Lägga till nya kontakter
   - Redigera befintliga (klicka pennikonen)
   - Ta bort kontakter (klicka papperskorgen)

---

## 📈 Rapporter

### Individuella rapporter
1. Gå till **"Rapporter"**
2. Välj fliken **"Individuella"**
3. Välj en studerande i dropdown
4. Se detaljerad statistik och progression
5. Klicka **"Exportera PDF"** för att ladda ner

### Grupprapporter
1. Välj fliken **"Grupprapporter"**
2. Välj en career-grupp
3. Se aggregerad statistik
4. Exportera som CSV

### Klassrapporter
1. Välj fliken **"Klassrapport"**
2. Välj en utbildning
3. Se övergripande statistik för hela klassen

---

## 💬 Slack-integration

### Konfigurera Slack
Sätt följande miljövariabler:
- `SLACK_WEBHOOK_URL` - För kanalnotifikationer
- `SLACK_BOT_TOKEN` - För direktmeddelanden (xoxb-...)

### Skicka DM till studerande
1. Gå till **"Studerande"**
2. Klicka på **meddelandeikonen** bredvid studenten
3. Skriv ditt meddelande
4. Klicka **"Skicka"**

---

## ⚙️ Sortering och filtrering

Alla listor har sortering och filtrering:
- **Sökfält** - Snabbsökning på namn/email
- **Filter** - Filtrera på grupp, roll, status etc.
- **Sortering** - Klicka på pilknappen för att ändra ordning

---

## 🌙 Tema

Växla mellan ljust och mörkt tema:
1. Klicka på **sol/måne-ikonen** i header
2. Välj Ljust, Mörkt eller System
