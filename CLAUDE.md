# Assistant AI — Plateforme SaaS multi-agents

**Assistant AI** est une plateforme **SaaS** qui permet à chaque utilisateur de **créer et piloter ses propres agents IA** (jusqu'à **3 agents maximum en offre Free**), de **converser** avec eux dans une interface de chat, et de **leur fournir du contexte** en important des fichiers dont on extrait automatiquement le texte.

En complément des agents créés par l'utilisateur, la plateforme embarque **4 agents locaux spécialisés** aux rôles distincts. Le **Brainstormer** joue le rôle de chef d'orchestre : il challenge l'utilisateur, garantit que les règles du projet sont respectées, vérifie les skills disponibles et **répartit le travail vers les agents compatibles**.

---

## Stack technique

- **Framework** : Next.js (App Router) — front + API via Route Handlers.
- **UI** : Tailwind CSS + **shadcn/ui** (composants installés via le registre).
- **Langage** : TypeScript.
- **Auth** : **Better Auth** — connexion Google (OAuth) + email/mot de passe, gestion des sessions.
- **Base de données** : **PostgreSQL** via **Drizzle ORM** (schéma typé, migrations `drizzle-kit`).
- **Modèle LLM** : `sonnet` (agents locaux et agents utilisateur) pour l'instant.
- **Quotas** : limite de plan (Free = 3 agents) appliquée **côté serveur**.

### Règle absolue — composants UI

Tout développement front **doit s'appuyer sur les composants shadcn/ui** et **respecter la direction visuelle définie dans [`docs/design.md`](docs/design.md)**.

- **Pour toute intégration visuelle, design frontend, UI ou style → se référer à [`docs/design.md`](docs/design.md)** (palette, glassmorphisme, gradients, typographie, tokens). C'est la source de vérité : ne pas inventer de style ad hoc.
- **Ne jamais réinventer** un composant déjà fourni par shadcn (bouton, dialog, table, form, tabs, sidebar, sheet, toast, etc.).
- Découvrir et installer les composants via le **MCP `shadcn`** (`search_items_in_registries`, `view_items_in_registries`, `get_add_command_for_items`).
- Pour toute question d'API/usage d'une lib (Next.js, shadcn, Tailwind, parseurs de fichiers…), consulter **`context7`** avant de coder — ne pas répondre de mémoire.
- Respecter les conventions du `components.json` du projet (alias `@/components/ui`).

---

## Fonctionnalités cœur

### 1. Création d'agents (max 3 en Free)
- L'utilisateur crée un ou plusieurs agents personnalisés (nom, rôle, prompt système, modèle).
- **Limite stricte de 3 agents** sur le plan Free — la création au-delà doit être bloquée côté UI **et** côté API, avec un message d'upsell clair.

### 2. Chat / conversation
- Section de conversation type chat (historique, streaming des réponses, états de chargement).
- Le message de l'utilisateur est traité par l'agent **actuellement sélectionné**.

### 3. Sélection d'agent
- Section dédiée au choix de l'agent actif (agents utilisateur + agents locaux).
- Le changement d'agent est explicite et visible dans l'UI.

### 4. Import de fichiers & extraction de texte
Formats supportés à l'import : **`.txt`, `.pdf`, `.json`, `.csv`, `.xlsx`**.

- À l'import, **extraire le contenu texte** du fichier pour le fournir comme contexte à l'agent.
- Mapping d'extraction :
  - `.txt` → lecture brute.
  - `.pdf` → extraction du texte (pdf-parse / équivalent).
  - `.json` → texte structuré / aplati lisible.
  - `.csv` → parsing tabulaire → texte.
  - `.xlsx` → lecture des feuilles → texte tabulaire.
- Gérer proprement : fichiers volumineux, formats invalides, et fichiers sans texte extractible (message d'erreur explicite).

---

## Les 4 agents locaux

| Agent | Rôle | Responsabilité |
|---|---|---|
| **Brainstormer** | Orchestrateur & garde-fou | Challenge l'utilisateur, **vérifie que les règles du projet sont appliquées**, inspecte les **skills disponibles** et **répartit la tâche vers les agents compatibles**. Point d'entrée par défaut quand la demande est floue. |
| **Développeur web** | Implémentation front/UI | Construit les pages et composants en **Next.js + shadcn/ui** (récupérés via MCP/context7). |
| **Lead dev** | Architecture & revue | Décisions techniques, structuration du code, revue de qualité, cohérence globale. |
| **Spécialiste n8n** | Automatisation | Conçoit les workflows n8n (webhooks, intégrations, traitements automatisés). |

### Rôle pivot du Brainstormer
1. Reformule et **challenge** le besoin (pose des questions si une info clé manque).
2. **Vérifie les règles** de ce CLAUDE.md (UI = shadcn, quotas, conventions).
3. **Liste les skills compatibles** avec la demande.
4. **Délègue** à l'agent le plus adapté (un seul par défaut ; en chaîne seulement si la demande couvre plusieurs étapes).
5. **Restitue** l'essentiel du livrable et le chemin des fichiers produits.

---

## Règles de développement

- **TypeScript strict** ; pas de `any` non justifié.
- **UI exclusivement via shadcn/ui** (voir règle absolue ci-dessus).
- Respecter l'arborescence Next.js App Router (`app/`, `components/`, `lib/`).
- Logique d'extraction de fichiers isolée dans `lib/` (un parseur par format, testable).
- **Quotas du plan** (3 agents Free) appliqués côté serveur, jamais seulement côté client.
- Gestion d'erreurs explicite sur l'import de fichiers et les appels modèle.

## Convention de fichiers (proposée)

```
app/                 # routes Next.js (chat, agents, API route handlers)
components/ui/       # composants shadcn (générés)
components/          # composants applicatifs
lib/                 # extraction fichiers, clients modèles, utils
lib/extractors/      # un module par format : txt, pdf, json, csv, xlsx
agents/              # définitions des 4 agents locaux (prompts, config)
```

## Langue & posture

- **Langue** : français par défaut, sauf demande contraire.
- **Posture coach** (héritée du Brainstormer) : challenger, conseiller, ne pas seulement exécuter.
- Après chaque livrable, proposer **1 à 3 axes d'amélioration** et indiquer le **chemin des fichiers créés**.
- Être direct, synthétique, orienté résultat.
