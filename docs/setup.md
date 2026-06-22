# Setup & lancement — Assistant AI

## Prérequis
- Node 20.9+ (testé sous Node 24)
- Docker (pour Postgres)

## 1. Base de données (Postgres via Docker)
Depuis la racine du projet :
```bash
docker compose up -d
```
Postgres écoute sur `localhost:5432` (db `assistant_ai`, user `postgres`, mot de passe `password`).

## 2. Variables d'environnement
Les variables Next sont dans [`web/.env.local`](../web/.env.local) :
- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (⚠️ remplacer par une chaîne aléatoire : `openssl rand -base64 32`)
- `BETTER_AUTH_URL` (`http://localhost:3000` en dev)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

> Dans la console Google Cloud, ajouter l'URI de redirection :
> `http://localhost:3000/api/auth/callback/google`

## 3. Schéma & migrations (Drizzle)
```bash
cd web
npm run db:push       # applique le schéma à la base
npm run db:views      # crée les vues KPI (nécessite psql ; sinon exécuter lib/db/views.sql à la main)
```
- `npm run db:generate` / `db:migrate` pour le workflow de migrations versionnées.
- `npm run db:studio` pour explorer la base.

## 4. Démarrer l'app
```bash
cd web
npm run dev
```
Ouvrir http://localhost:3000.

## Parcours
- `/` — landing (publique)
- `/login` — Google + email/mot de passe + inscription
- `/dashboard` — KPI + graphiques (protégé)
- `/agents` — CRUD agents + quota (3 max Free) + agents locaux
- `/chat` — conversation (sélection d'agent ; branchement modèle à venir)

## Notes
- Le dashboard lit les **vues KPI** ; tant que `db:views` n'a pas été exécuté, les compteurs affichent 0 (fallback).
- Quota appliqué **côté serveur** dans `app/api/agents/route.ts`.
