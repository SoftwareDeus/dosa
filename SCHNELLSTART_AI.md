# 🚀 Schnellstart: AI-Features in Dosa

## ✅ Was wurde implementiert?

Die folgenden AI-Features sind jetzt in deine App integriert:

### 1. 💬 AI Chat (Claude)
- **Route:** `/app/ai`
- Interaktiver Chat mit Streaming-Antworten
- Konversationshistorie
- Mobile-optimierte UI
- **Direkt über die Bottom-Navigation erreichbar** (🤖 Icon)

### 2. 👁️ Vision - Bildanalyse
- **Route:** `/app/ai/vision`
- Bilder hochladen oder mit Kamera aufnehmen
- KI-basierte Bildanalyse
- Flexible Prompts

### 3. 🛠️ AI Tools
- **Route:** `/app/ai/tools`
- **Zusammenfassung:** Texte in verschiedenen Längen und Stilen zusammenfassen
- **Übersetzung:** Texte in 11+ Sprachen übersetzen

---

## 🔧 Setup (3 Schritte)

### Schritt 1: API Key holen

1. Gehe zu [Anthropic Console](https://console.anthropic.com)
2. Erstelle einen Account (falls noch nicht vorhanden)
3. Navigiere zu "API Keys"
4. Erstelle einen neuen API Key
5. Kopiere den Key (z.B. `sk-ant-api03-...`)

### Schritt 2: Environment Variable setzen

Erstelle eine `.env` Datei im Projektroot (falls nicht vorhanden):

```bash
cp env.example .env
```

Füge deinen API Key hinzu:

```env
# Deine anderen Variablen...
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# NEU: Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-dein-key-hier
```

### Schritt 3: App starten

```bash
npm run dev
```

Die App läuft jetzt auf: http://localhost:5173

---

## 🎯 Features testen

### 1. Chat ausprobieren
1. Öffne die App
2. Logge dich ein
3. Klicke auf das 🤖 Icon in der Bottom-Navigation
4. Schreibe eine Nachricht, z.B. "Erkläre mir Quantenphysik einfach"
5. Die Antwort wird in Echtzeit gestreamt

### 2. Bild analysieren
1. Gehe zu `/app/ai/vision` (über die Tabs oben)
2. Lade ein Bild hoch oder mache ein Foto
3. Stelle eine Frage zum Bild
4. Klicke "Analysieren"

### 3. Tools nutzen
1. Gehe zu `/app/ai/tools`
2. **Zusammenfassung:** Füge einen langen Text ein und lass ihn zusammenfassen
3. **Übersetzung:** Übersetze einen Text in eine andere Sprache

---

## 📱 Mobile App

Die AI-Features funktionieren auch in der mobilen App:

```bash
# Android
npm run build:mobile
npm run dev:android

# iOS (nur macOS)
npm run build:mobile
npm run dev:ios
```

**Kamera-Integration:** In der mobilen App kannst du direkt Fotos für die Bildanalyse aufnehmen!

---

## 📂 Projektstruktur (neu hinzugefügt)

```
src/
├── lib/
│   ├── ai/
│   │   └── chat-client.ts         # Client-side AI Utilities
│   └── server/
│       └── ai.ts                   # Server-side AI Client
│
├── routes/
│   ├── api/
│   │   └── ai/
│   │       ├── chat/+server.ts     # Chat API
│   │       ├── vision/+server.ts   # Vision API
│   │       ├── summarize/+server.ts # Zusammenfassung API
│   │       └── translate/+server.ts # Übersetzung API
│   │
│   └── app/
│       └── ai/
│           ├── +layout.svelte      # AI Sub-Navigation
│           ├── +page.svelte        # Chat UI
│           ├── vision/+page.svelte # Vision UI
│           └── tools/+page.svelte  # Tools UI
│
└── messages/
    ├── en.json                     # Englische Übersetzungen (aktualisiert)
    └── de-de.json                  # Deutsche Übersetzungen (aktualisiert)
```

---

## 💰 Kosten

Die Nutzung der Claude API ist kostenpflichtig:

| Modell | Verwendung | Kosten (Input) | Kosten (Output) |
|--------|-----------|----------------|-----------------|
| Claude 3.5 Sonnet | Chat, Vision | $3/M Tokens | $15/M Tokens |
| Claude 3.5 Haiku | Tools | $1/M Tokens | $5/M Tokens |

**Beispiel:** Ein typischer Chat mit 1000 Wörtern Input und 500 Wörtern Output kostet ca. $0.02-0.03

**Tipp:** Anthropic bietet einen Free Tier mit 50 Requests/Tag zum Testen.

---

## 🔒 Sicherheit

✅ API Key wird nur server-side verwendet  
✅ Alle Endpoints erfordern Authentifizierung  
✅ Rate Limiting wird behandelt  
✅ Fehlerbehandlung implementiert  

---

## 🐛 Troubleshooting

### "AI features are not enabled"
➡️ **Lösung:** Setze `ANTHROPIC_API_KEY` in der `.env` Datei und starte den Server neu

### "Rate limit exceeded"
➡️ **Lösung:** Warte ein paar Minuten oder upgrade deinen Anthropic Plan

### Streaming funktioniert nicht
➡️ **Lösung:** 
- Prüfe Browser-Kompatibilität (Chrome, Firefox, Safari unterstützen SSE)
- Deaktiviere Ad-Blocker temporär

---

## 📚 Weitere Dokumentation

- **Detaillierte Doku:** [AI_FEATURES.md](./AI_FEATURES.md)
- **Anthropic Docs:** https://docs.anthropic.com
- **API Reference:** https://docs.anthropic.com/en/api

---

## 🎨 Anpassungen

Die AI-Features sind vollständig anpassbar:

### UI-Farben ändern
Öffne die jeweiligen `.svelte` Dateien und passe die Tailwind-Klassen an:
- Chat: `bg-purple-600` → `bg-blue-600`
- Vision: `bg-blue-600` → `bg-green-600`
- Tools: `bg-green-600` → `bg-red-600`

### Modelle wechseln
In `src/lib/server/ai.ts`:
```typescript
export const DEFAULT_MODEL = CLAUDE_MODELS.HAIKU; // Schneller & günstiger
// oder
export const DEFAULT_MODEL = CLAUDE_MODELS.OPUS; // Beste Qualität
```

### System Prompts anpassen
In den API-Endpoints (`src/routes/api/ai/*/+server.ts`) kannst du die System-Prompts ändern, um das Verhalten zu beeinflussen.

---

## ✨ Nächste Schritte

Weitere AI-Features, die du hinzufügen könntest:
- 🎤 **Voice Input:** Spracherkennung für den Chat
- 📄 **PDF-Analyse:** Dokumente analysieren mit Claude
- 🧠 **Memory:** Langzeit-Konversationshistorie
- 🎨 **Image Generation:** Integration mit DALL-E oder Midjourney
- 🔍 **RAG (Retrieval Augmented Generation):** Eigene Dokumente durchsuchen

---

**Fragen?** Öffne ein Issue auf GitHub oder schaue in die [AI_FEATURES.md](./AI_FEATURES.md) für detaillierte Informationen.

Viel Spaß mit den AI-Features! 🚀

