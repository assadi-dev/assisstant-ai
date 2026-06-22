# Assistant AI

Plateforme **SaaS multi-agents** : chaque utilisateur crée et pilote ses propres agents IA (jusqu'à **3 en offre Free**), converse avec eux dans une interface de chat, et leur fournit du contexte en important des fichiers dont le texte est extrait automatiquement.

En plus des agents utilisateur, la plateforme embarque **4 agents locaux spécialisés** (Brainstormer, Développeur web, Lead dev, Spécialiste n8n), le **Brainstormer** jouant le rôle de chef d'orchestre.

## Fonctionnalités

- **Création d'agents** personnalisés (nom, rôle, prompt système, modèle) — limite de 3 en Free, appliquée côté serveur.
- **Chat** en streaming avec l'agent sélectionné (historique, états de chargement).
- **Sélection d'agent** active (agents utilisateur + agents locaux).
- **Import de fichiers** avec extraction de texte : `.txt`, `.pdf`, `.json`, `.csv`, `.xlsx`.

## Stack technique

- **Framework** : Next.js 16 (App Router) — front + API via Route Handlers
- **Langage** : TypeScript
- **UI** : Tailwind CSS v4 + shadcn/ui
- **Auth** : Better Auth (Google OAuth + email/mot de passe)
- **Base de données** : PostgreSQL via Drizzle ORM
- **LLM** : Vercel AI SDK (Anthropic `sonnet` par défaut)

## Démarrage rapide

### Prérequis

- Node.js 20+
- Docker (pour PostgreSQL)

### Installation

```bash
# 1. Lancer la base de données PostgreSQL
docker compose up -d

# 2. Installer les dépendances
cd web
npm install

# 3. Configurer l'environnement
#    (renseigner DATABASE_URL, clés d'auth, clé API LLM dans .env)

# 4. Appliquer le schéma de base de données
npm run db:migrate

# 5. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run db:generate` | Génère les migrations Drizzle |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:push` | Pousse le schéma vers la base |
| `npm run db:studio` | Interface Drizzle Studio |

## Structure du projet

```
web/
  app/            # Routes Next.js (chat, agents, auth, API)
  components/     # Composants applicatifs + shadcn/ui
  lib/            # Auth, accès DB, clients LLM, extraction de fichiers
  drizzle/        # Migrations
docs/             # design.md, setup.md, user-stories.md
.agents/          # Définitions des 4 agents locaux
docker-compose.yml
```

## Documentation

- [docs/design.md](docs/design.md) — direction visuelle (source de vérité UI)
- [docs/setup.md](docs/setup.md) — installation détaillée
- [docs/user-stories.md](docs/user-stories.md) — parcours utilisateur
