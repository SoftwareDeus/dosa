# Supabase Authentication Setup

Diese Anleitung zeigt dir, wie du die Supabase-Authentifizierung für deine UseIt-App konfigurierst.

## 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Notiere dir die `Project URL` und `anon public` Key aus den Project Settings

## 2. Umgebungsvariablen setzen

Erstelle eine `.env`-Datei im Projektverzeichnis:

```env
PUBLIC_SUPABASE_URL=deine_supabase_url
PUBLIC_SUPABASE_ANON_KEY=dein_supabase_anon_key
```

## 3. Google OAuth konfigurieren

### Google Cloud Console
1. Gehe zur [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes aus
3. Aktiviere die Google+ API
4. Gehe zu "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Wähle "Web application" als Application type
6. Füge diese Redirect URIs hinzu:
   - `https://dein-supabase-projekt.supabase.co/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (für lokale Entwicklung)

### Supabase Dashboard
1. Gehe zu Authentication → Providers in deinem Supabase Dashboard
2. Aktiviere Google Provider
3. Füge deine Google Client ID und Client Secret ein
4. Speichere die Einstellungen

## 4. Apple OAuth konfigurieren

### Apple Developer Portal
1. Gehe zum [Apple Developer Portal](https://developer.apple.com/)
2. Erstelle eine neue App ID mit "Sign In with Apple" Capability
3. Erstelle eine Service ID für Web Authentication
4. Konfiguriere die Redirect URIs:
   - `https://dein-supabase-projekt.supabase.co/auth/v1/callback`

### Supabase Dashboard
1. Gehe zu Authentication → Providers in deinem Supabase Dashboard
2. Aktiviere Apple Provider
3. Füge deine Apple Client ID und Client Secret ein
4. Speichere die Einstellungen

## 5. E-Mail-Konfiguration

1. Gehe zu Authentication → Settings in deinem Supabase Dashboard
2. Konfiguriere deine E-Mail-Einstellungen:
   - Site URL: `http://localhost:5173` (für Entwicklung)
   - Redirect URLs: `http://localhost:5173/auth/callback`
3. Für Produktion: Ersetze localhost mit deiner Domain

## 6. App testen

1. Starte die App: `npm run dev`
2. Gehe zu `/login`
3. Teste die verschiedenen Login-Methoden:
   - E-Mail/Passwort Registrierung
   - E-Mail/Passwort Login
   - Google OAuth
   - Apple OAuth (auf iOS-Geräten)

## 7. Mobile App konfigurieren

Für die Capacitor Mobile App:

1. Synchronisiere die Änderungen: `npm run sync`
2. Für iOS: `npm run dev:ios`
3. Für Android: `npm run dev:android`

## Troubleshooting

### Häufige Probleme:

1. **CORS-Fehler**: Stelle sicher, dass deine Domain in den Supabase-Einstellungen hinzugefügt ist
2. **OAuth-Fehler**: Überprüfe die Redirect URIs in Google/Apple Console
3. **E-Mail-Bestätigung**: Überprüfe deine E-Mail-Einstellungen in Supabase

### Debug-Tipps:

- Überprüfe die Browser-Konsole auf Fehler
- Schaue in die Supabase Logs im Dashboard
- Teste zuerst mit E-Mail/Passwort, dann mit OAuth

## Nächste Schritte

Nach der erfolgreichen Konfiguration kannst du:
- Benutzerprofile erweitern
- Rollen und Berechtigungen hinzufügen
- Datenbank-Schema für deine App erstellen
- Push-Benachrichtigungen implementieren

