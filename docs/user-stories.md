# Assistant AI — User Stories (v1)

Format : `En tant que <rôle>, je veux <action>, afin de <bénéfice>` + critères d'acceptation (CA).
Priorités : **P0** (MVP), **P1** (important), **P2** (plus tard).

---

## EPIC 1 — Landing page `/` (non prioritaire, P2)

### US-1.1 — Présentation produit
**En tant que** visiteur non connecté, **je veux** voir une page d'accueil qui présente Assistant AI, **afin de** comprendre la valeur et m'inscrire.
- CA : route `/` publique, sans auth.
- CA : sections hero + bénéfices + CTA « Se connecter / Commencer ».
- CA : CTA renvoie vers `/login`.
- CA : si l'utilisateur est déjà connecté, lien direct vers `/dashboard`.

---

## EPIC 2 — Authentification (P0)

### US-2.1 — Connexion Google
**En tant que** visiteur, **je veux** me connecter avec Google, **afin de** accéder rapidement sans créer de mot de passe.
- CA : bouton « Continuer avec Google » sur `/login`.
- CA : à la 1re connexion, un compte est créé automatiquement.
- CA : redirection vers `/dashboard` après succès.

### US-2.2 — Connexion email / mot de passe
**En tant que** visiteur, **je veux** me connecter avec email + mot de passe, **afin de** utiliser un compte classique.
- CA : champs email + mot de passe avec validation (format email, mot de passe requis).
- CA : message d'erreur explicite si identifiants invalides.
- CA : lien « Mot de passe oublié » (P1) et « Créer un compte ».

### US-2.3 — Inscription
**En tant que** nouvel utilisateur, **je veux** créer un compte email/mot de passe, **afin de** démarrer sur le plan Free.
- CA : compte créé sur le **plan Free** par défaut (quota = 3 agents).
- CA : contrôle d'unicité de l'email.

### US-2.4 — Protection des routes & déconnexion
**En tant qu'** utilisateur, **je veux** que les pages applicatives soient protégées et pouvoir me déconnecter.
- CA : `/dashboard`, `/chat`, `/agents` exigent une session ; sinon redirection `/login`.
- CA : bouton de déconnexion accessible depuis la sidebar/compte.

---

## EPIC 3 — Layout & Sidebar (P0)

### US-3.1 — Navigation latérale
**En tant qu'** utilisateur connecté, **je veux** une sidebar de navigation, **afin de** circuler entre les sections.
- CA : sidebar shadcn (`sidebar`), repliable, responsive (sheet en mobile).
- CA : item actif mis en évidence.

**Sections proposées dans la sidebar :**
| Section | Route | Statut | Rôle |
|---|---|---|---|
| **Dashboard** | `/dashboard` | P0 | Accueil + stats/charts |
| **Chat** | `/chat` | P0 | Conversation avec l'agent sélectionné |
| **Agents** | `/agents` | P0 | Liste / créer / modifier / supprimer |
| Fichiers / Contexte | `/files` | P1 | Imports `.txt/.pdf/.json/.csv/.xlsx` extraits |
| Paramètres / Compte | `/settings` | P1 | Profil, plan, quota, upgrade |

> Le pied de sidebar affiche l'utilisateur + le **badge de plan** (Free 2/3 agents) avec CTA upgrade.

---

## EPIC 4 — Dashboard (P0)

### US-4.1 — Vue d'ensemble avec stats
**En tant qu'** utilisateur, **je veux** un tableau de bord avec des stats pertinentes, **afin de** suivre mon usage en un coup d'œil.
- CA : cartes KPI (shadcn `card`) :
  - **Agents** utilisés / quota (ex. 2 / 3).
  - **Conversations** (total).
  - **Messages** envoyés (période).
  - **Fichiers importés** (total).
- CA : états vides clairs si aucune donnée (nouvel utilisateur).

### US-4.2 — Graphiques
**En tant qu'** utilisateur, **je veux** des charts, **afin de** visualiser l'évolution de mon usage.
- CA : graphiques via **shadcn `chart`** (Recharts) :
  - Messages par jour (7/30 derniers jours) — courbe/aire.
  - Répartition des messages **par agent** — barres ou donut.
- CA : sélecteur de période (7j / 30j) — P1.

---

## EPIC 5 — Agents (P0)

### US-5.1 — Lister les agents
**En tant qu'** utilisateur, **je veux** voir la liste de mes agents, **afin de** les gérer.
- CA : affichage en cartes ou table (shadcn) : nom, rôle, modèle, date.
- CA : distinction **agents utilisateur** vs **agents locaux** (Brainstormer, Développeur web, Lead dev, Spécialiste n8n) — les locaux ne sont ni modifiables ni supprimables.
- CA : compteur de quota visible (X / 3 en Free).

### US-5.2 — Créer un agent
**En tant qu'** utilisateur, **je veux** créer un agent (nom, rôle, prompt système, modèle), **afin de** l'adapter à mon besoin.
- CA : formulaire shadcn (`form` + `dialog`/page) avec validation.
- CA : **blocage à 3 agents en Free**, côté UI **et** côté API, avec message d'upsell.
- CA : modèle par défaut `sonnet`.

### US-5.3 — Modifier un agent
**En tant qu'** utilisateur, **je veux** modifier un agent existant, **afin de** affiner son comportement.
- CA : pré-remplissage du formulaire ; sauvegarde + retour à la liste.
- CA : interdit sur les agents locaux.

### US-5.4 — Supprimer un agent
**En tant qu'** utilisateur, **je veux** supprimer un agent, **afin de** libérer un emplacement de quota.
- CA : confirmation (shadcn `alert-dialog`) avant suppression.
- CA : le quota se met à jour ; interdit sur les agents locaux.

---

## EPIC 6 — Chat (P0, cadré ici, détaillé plus tard)

### US-6.1 — Converser avec l'agent sélectionné
**En tant qu'** utilisateur, **je veux** discuter avec l'agent actif, **afin de** obtenir des réponses.
- CA : sélection de l'agent actif visible et explicite.
- CA : historique, streaming des réponses, états de chargement.
- CA : import de fichiers en contexte (détaillé dans un EPIC dédié ultérieur).

---

## Décisions techniques actées

- **Auth** : **Better Auth** (Google OAuth + email/mot de passe + sessions).
- **Base de données** : **PostgreSQL + Drizzle ORM** (migrations `drizzle-kit`), **Docker local** en dev (`postgres` / `password` / db `assistant_ai`, `DATABASE_URL`).
- **Stats dashboard** : **calcul en direct** + **vues SQL** dédiées pour les KPI en v1.
- **Landing `/`** : **validée** — placeholder simple en v1, design soigné plus tard.
- **Modèle** : `sonnet`.
