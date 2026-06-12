# Kernfusion und Kernspaltung Website

Professionelle Präsentationswebsite für Physik Klasse 11 mit Startseite, animiertem Design, dynamischen Inhaltsseiten und passwortgeschützter Admin-Seite.

## Was enthalten ist

- `index.html`: öffentliche Präsentationsseite
- `/admin`: Admin-Seite zum Anlegen, Bearbeiten und Löschen weiterer Seiten
- `/api`: Vercel-Funktionen für Login und Supabase-Zugriff
- `supabase/schema.sql`: Datenbankstruktur inklusive Beispielseiten
- `assets/sun-hero.svg`: Sonnenmotiv für die Titelseite
- `css` und `js`: Design, Animationen und Seitenlogik

## Wichtig zur Technik

Das Projekt nutzt HTML, CSS und JavaScript. Für Vercel ist das die passendste Variante, weil Vercel kleine Server-Funktionen direkt aus dem Ordner `/api` ausführt. Ein klassisches Java-Backend wäre für diese Veröffentlichung deutlich aufwendiger.

Die Admin-Seite ist nicht nur optisch versteckt: Das Passwort wird in einer Vercel-Funktion geprüft. Schreibzugriffe auf Supabase laufen über geschützte API-Endpunkte.

## Supabase einrichten

1. Erstelle ein neues Projekt bei Supabase.
2. Öffne in Supabase den Bereich `SQL Editor`.
3. Kopiere den Inhalt aus `supabase/schema.sql` hinein.
4. Führe das SQL aus.
5. Öffne `Project Settings` > `API`.
6. Notiere dir:
   - `Project URL`
   - `service_role key`

Wichtig: Der `service_role key` darf nicht öffentlich im Browser stehen. Er wird nur als geheime Vercel-Variable verwendet.

## Lokal testen

1. Installiere Node.js, falls noch nicht vorhanden.
2. Öffne den Projektordner im Terminal.
3. Kopiere `.env.example` zu `.env.local`.
4. Trage dort deine Supabase-Werte und ein Admin-Passwort ein.
5. Installiere die Abhängigkeiten:

```bash
npm install
```

6. Starte die lokale Vercel-Umgebung:

```bash
npm run dev
```

7. Öffne die angezeigte lokale Adresse im Browser.
8. Die Admin-Seite liegt unter:

```text
/admin
```

## GitHub hochladen

Lade den kompletten Inhalt dieses Ordners in ein neues GitHub-Repository hoch. Diese Dateien gehören dazu:

- `index.html`
- `admin/`
- `api/`
- `assets/`
- `css/`
- `js/`
- `lib/`
- `supabase/`
- `package.json`
- `vercel.json`
- `.gitignore`
- `.env.example`
- `README.md`

Die Datei `.env.local` gehört nicht in GitHub.

## Vercel veröffentlichen

1. Verbinde dein GitHub-Repository mit Vercel.
2. Lege in Vercel unter `Settings` > `Environment Variables` diese Variablen an:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

3. `SUPABASE_URL` ist deine Supabase Project URL.
4. `SUPABASE_SERVICE_ROLE_KEY` ist dein Supabase service_role key.
5. `ADMIN_PASSWORD` ist dein selbst gewähltes Admin-Passwort.
6. `ADMIN_SESSION_SECRET` ist eine lange zufällige Zeichenfolge.
7. Starte danach ein neues Deployment.

## Neue Seiten hinzufügen

1. Öffne deine Website unter `/admin`.
2. Logge dich mit dem Passwort ein.
3. Klicke auf `Neue Seite`.
4. Fülle Titel, Kurzbeschreibung und Haupttext aus.
5. Optional:
   - Bild-URL einfügen
   - YouTube-, Vimeo- oder MP4-Video-URL einfügen
6. Speichern.

Die neue Seite erscheint automatisch auf der öffentlichen Website, solange `Veröffentlicht` aktiviert ist.

## Design anpassen

Die Hauptfarben stehen in `css/styles.css` im Bereich `:root`.

```css
--blue: #0b43d9;
--ink: #090909;
--white: #ffffff;
```

Schwarz wird im Design als eigener Kontrastbereich verwendet und nicht direkt mit Königsblau gemischt.
