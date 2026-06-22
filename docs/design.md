# Design System — Assistant AI

> Direction visuelle inspirée des templates du dossier [ui/](../ui/) : **dark-first**, vert émeraude néon, **glassmorphisme** et **gradients** lumineux. Pensée pour une implémentation **shadcn/ui + Tailwind v4** sans réinventer de composant.

---

## 1. Principes directeurs

| Principe | Traduction concrète |
|---|---|
| **Dark-first** | Fond near-black (`#0A0E0C`), surfaces sombres légèrement teintées de vert. Le light mode existe mais reste secondaire. |
| **Émeraude néon** | Une seule couleur d'accent (vert émeraude) + son **glow**. Pas d'arc-en-ciel : le vert porte toute l'identité. |
| **Glassmorphisme** | Cartes/panneaux translucides, `backdrop-blur`, bordure lumineuse 1px, highlight interne en haut. |
| **Profondeur par la lumière** | La hiérarchie se lit via lueurs et gradients radiaux, pas via des ombres dures. |
| **Sobriété typographique** | Titres serrés (tracking négatif), corps neutre lisible. Le néon est réservé aux accents, jamais au texte courant long. |

---

## 2. Palette de couleurs

### Sémantique (référence)

| Rôle | Hex | Usage |
|---|---|---|
| `background` | `#0A0E0C` | Fond global (presque noir, légère teinte verte) |
| `surface` | `#10160F` | Cartes opaques, sidebar |
| `surface-glass` | `rgba(20,30,22,0.55)` | Cartes en verre (avec blur) |
| `primary` (émeraude) | `#34D399` | Boutons, accents, liens actifs |
| `primary-strong` | `#10B981` | Hover / gradient bas |
| `primary-glow` | `rgba(52,211,153,0.45)` | Lueurs, ombres colorées |
| `foreground` | `#E8F0EA` | Texte principal |
| `muted-foreground` | `#8A998E` | Texte secondaire, labels |
| `border` | `rgba(255,255,255,0.08)` | Séparateurs |
| `border-glow` | `rgba(52,211,153,0.30)` | Bordure lumineuse des cartes glass |
| `destructive` | `#F26D6D` | Erreurs (ex: deltas négatifs des dashboards) |
| `warning` | `#F0A35E` | Accents secondaires (cf. cartes orange des templates) |

### Tokens shadcn — `app/globals.css`

shadcn/ui pilote ses couleurs via variables CSS consommées par Tailwind. On reste sur le **format de tokens shadcn** (`--background`, `--primary`, …) pour que tous les composants générés héritent automatiquement du thème.

```css
@layer base {
  :root {
    /* Light (secondaire) */
    --background: 150 20% 98%;
    --foreground: 160 25% 10%;
    --card: 0 0% 100%;
    --card-foreground: 160 25% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 160 25% 10%;
    --primary: 160 84% 39%;          /* emerald-500 */
    --primary-foreground: 0 0% 100%;
    --secondary: 150 16% 94%;
    --secondary-foreground: 160 25% 12%;
    --muted: 150 12% 94%;
    --muted-foreground: 155 8% 42%;
    --accent: 152 60% 92%;
    --accent-foreground: 160 40% 18%;
    --destructive: 0 80% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 150 12% 88%;
    --input: 150 12% 88%;
    --ring: 160 84% 39%;
    --radius: 0.9rem;
  }

  .dark {
    /* Dark (mode principal — calé sur les templates) */
    --background: 140 18% 5%;        /* #0A0E0C */
    --foreground: 140 18% 92%;       /* #E8F0EA */
    --card: 135 16% 7%;              /* #10160F */
    --card-foreground: 140 18% 92%;
    --popover: 135 18% 6%;
    --popover-foreground: 140 18% 92%;
    --primary: 158 64% 52%;          /* #34D399 émeraude néon */
    --primary-foreground: 150 40% 6%;
    --secondary: 140 10% 14%;
    --secondary-foreground: 140 18% 92%;
    --muted: 140 8% 16%;
    --muted-foreground: 145 8% 60%;  /* #8A998E */
    --accent: 158 50% 18%;
    --accent-foreground: 158 64% 70%;
    --destructive: 0 78% 68%;
    --destructive-foreground: 0 0% 100%;
    --border: 140 10% 18%;
    --input: 140 10% 16%;
    --ring: 158 64% 52%;
    --radius: 0.9rem;

    /* Tokens étendus (custom, hors shadcn de base) */
    --primary-strong: 160 84% 39%;   /* #10B981 */
    --glow: 158 64% 52%;             /* base des lueurs */
    --warning: 28 82% 65%;
  }
}
```

> ⚠️ **Convention shadcn** : on déclare les couleurs en **HSL sans `hsl()`** (`140 18% 5%`) car le `tailwind.config`/`@theme` les enveloppe en `hsl(var(--x))`. Ne pas mettre de hex directement dans ces variables.

---

## 3. Gradients

Trois familles, toutes déclinées du vert émeraude.

### 3.1 Glow radial de fond (ambiance hero / page)
Lueur diffuse en haut, comme sur les hero `FlowSync` / `VertexAI`.

```css
.bg-aurora {
  background:
    radial-gradient(60% 50% at 50% 0%, hsl(var(--glow) / 0.18), transparent 70%),
    radial-gradient(40% 40% at 100% 10%, hsl(var(--glow) / 0.10), transparent 60%),
    hsl(var(--background));
}
```

### 3.2 Gradient de surface (cartes mises en avant)
Effet « chart area » des dashboards : la carte s'illumine vers le bas-gauche.

```css
.surface-gradient {
  background:
    linear-gradient(160deg, hsl(var(--glow) / 0.12) 0%, transparent 45%),
    radial-gradient(120% 80% at 0% 100%, hsl(var(--glow) / 0.20), transparent 60%),
    hsl(var(--card));
}
```

### 3.3 Gradient de marque (boutons, titres accentués)
```css
.text-gradient {
  background: linear-gradient(180deg, #D7FBE8 0%, hsl(var(--primary)) 60%, hsl(var(--primary-strong)) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.btn-gradient {
  background: linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary-strong)) 100%);
}
```

Utilitaires Tailwind v4 (dans `@theme` ou inline) :
```
bg-[radial-gradient(60%_50%_at_50%_0%,theme(colors.emerald.500/18%),transparent_70%)]
```

---

## 4. Glassmorphisme

La recette des cartes en verre des templates (panneaux Performance / Total earnings).

```css
.glass {
  background: hsl(var(--card) / 0.55);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  /* highlight interne en haut + lueur portée verte */
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / 0.06),
    0 8px 32px -8px hsl(0 0% 0% / 0.6);
}

/* Variante « accentuée » : bordure néon + glow émeraude */
.glass-glow {
  border-color: hsl(var(--glow) / 0.30);
  box-shadow:
    inset 0 1px 0 0 hsl(var(--glow) / 0.15),
    0 0 0 1px hsl(var(--glow) / 0.10),
    0 8px 40px -8px hsl(var(--glow) / 0.35);
}
```

**Règles d'usage**
- Glass **uniquement sur fond riche** (au-dessus d'un gradient/glow). Sur fond plat il devient invisible → préférer `surface` opaque.
- Blur **≤ 20px** pour rester performant et lisible.
- Toujours un **fallback opaque** : `@supports not (backdrop-filter: blur(0)) { .glass { background: hsl(var(--card)); } }`.
- Le texte sur verre doit rester en `foreground` (jamais en muted sous 60% d'opacité de fond).

---

## 5. Typographie

| Niveau | Police | Taille / poids | Tracking |
|---|---|---|---|
| Display (hero) | `Geist` / `Inter` | 48–72px · 700 | `-0.03em` |
| H1 | idem | 32–40px · 600 | `-0.02em` |
| H2 | idem | 24px · 600 | `-0.01em` |
| Body | idem | 15–16px · 400 | `0` |
| Label / meta | idem | 12–13px · 500, `uppercase` possible | `0.04em` |
| Mono (chiffres KPI) | `Geist Mono` | tabular-nums | `0` |

- Police via `next/font` (`Geist` recommandé, déjà template Next.js) → exposée en `--font-sans` / `--font-mono`, branchée dans `@theme`.
- Les **gros chiffres de KPI** (`$240.8K`, `75.5%`) en `font-mono tabular-nums` pour l'alignement.
- Accent néon réservé aux **titres courts / mots-clés**, jamais aux paragraphes.

---

## 6. Élévation, rayons, espacement

- **Rayons** : `--radius: 0.9rem`. Cartes `rounded-2xl`, boutons `rounded-xl`, badges `rounded-full`.
- **Ombres** : pas d'ombre grise dure. On utilise des **ombres colorées** (`shadow-[0_0_40px_-8px_theme(colors.emerald.500/35%)]`) pour signaler l'interactif/actif.
- **Espacement** : grille 4px. Padding cartes `p-5`/`p-6`, gap dashboard `gap-4`/`gap-6`.
- **Bordures** : 1px `border-white/8` par défaut, `border-emerald-400/30` pour l'état accentué.

---

## 7. États interactifs

| État | Effet |
|---|---|
| Hover (bouton) | Légère montée du glow : `shadow-[0_0_24px_-6px_theme(colors.emerald.500/50%)]` + `brightness-110`. |
| Hover (carte) | Bordure passe en `emerald-400/30`, gradient interne +10% d'opacité. Transition `200ms ease`. |
| Focus | `ring-2 ring-ring ring-offset-2 ring-offset-background` (token shadcn `--ring`). Jamais supprimer l'outline clavier. |
| Actif (nav) | Item en `btn-gradient` plein OU pastille verte + texte `primary` (cf. sidebar templates). |
| Disabled | `opacity-50`, pas de glow, `cursor-not-allowed`. |
| Loading | Skeleton `bg-white/5` + shimmer, ou spinner émeraude. |

---

## 8. Mapping vers les composants shadcn/ui

> **Règle absolue du projet** : ne jamais réinventer un composant fourni par shadcn. On installe via le **MCP `shadcn`** et on stylise via les tokens + classes utilitaires ci-dessus.

| Zone UI Assistant AI | Composants shadcn | Traitement design |
|---|---|---|
| **App shell / nav agents** | `sidebar`, `sheet` (mobile) | Sidebar `surface` opaque, item actif `glass-glow` ou gradient. |
| **Sélection d'agent** | `tabs` ou `toggle-group` + `card` | Agent actif = carte `glass-glow` + halo. Agents locaux badgés. |
| **Chat** | `card`, `scroll-area`, `textarea`, `button` | Bulles assistant en `glass`, bulles user en `surface-gradient`. Zone de saisie `glass` collée en bas. |
| **Bouton d'envoi / CTA** | `button` (variant custom `gradient`) | `btn-gradient` + glow au hover. |
| **Import de fichiers** | `dialog`, `input`(file) custom, `progress`, `badge` | Dropzone `glass` en pointillés `border-emerald-400/30`. Badge format (.pdf/.csv…). |
| **Liste / quotas agents (3 max Free)** | `card`, `progress`, `alert`, `tooltip` | Jauge `2/3 agents`. Upsell via `alert` accentué émeraude. |
| **KPIs / stats** | `card` | Chiffre `font-mono`, delta `text-emerald-400`/`text-destructive`. |
| **Notifications** | `sonner` (toast) | Toasts `glass`, bordure selon statut. |
| **États de chargement** | `skeleton` | `bg-white/5` + shimmer. |

### Variant bouton « gradient » à ajouter (CVA)
shadcn génère `button.tsx` avec `cva`. On **étend** la liste des variants au lieu d'en créer un nouveau composant :

```ts
// components/ui/button.tsx — ajout dans variant: { ... }
gradient:
  "text-primary-foreground bg-gradient-to-b from-primary to-[hsl(var(--primary-strong))] " +
  "shadow-[0_0_24px_-8px_hsl(var(--glow)/0.6)] hover:brightness-110 " +
  "transition active:brightness-95",
```

### Classe utilitaire à exposer (`globals.css`)
Déclarer `.glass`, `.glass-glow`, `.surface-gradient`, `.bg-aurora`, `.text-gradient` (sections 3–4) dans `@layer components` pour les réutiliser partout sans dupliquer.

---

## 9. Accessibilité (garde-fous)

- **Contraste** : texte courant sur verre/fond ≥ 4.5:1. Le `muted-foreground` (`#8A998E`) passe sur `background` mais **pas** sur verre très translucide → augmenter l'opacité du fond ou la couleur.
- Le **néon n'est pas porteur d'info seul** : toujours doubler par texte/icône (deltas + flèche + signe).
- **Focus visible** obligatoire (token `--ring`), même sur fonds glass.
- `prefers-reduced-motion` : couper shimmer/glow animés.
- Tester le **light mode** : les gradients verts doivent rester subtils (≤ 8% d'opacité).

---

## 10. Checklist d'implémentation

- [ ] Coller les tokens HSL (section 2) dans `app/globals.css` (`:root` + `.dark`).
- [ ] Brancher `Geist` / `Geist Mono` via `next/font` → `--font-sans` / `--font-mono`.
- [ ] Activer le dark mode par défaut (`<html class="dark">` ou `next-themes` `defaultTheme="dark"`).
- [ ] Déclarer les utilitaires `glass` / `gradient` / `aurora` en `@layer components`.
- [ ] Étendre le `cva` du `button` avec le variant `gradient`.
- [ ] Installer les composants via **MCP shadcn** (`sidebar`, `tabs`, `card`, `dialog`, `progress`, `sonner`, `skeleton`, `alert`, `tooltip`, `scroll-area`, `textarea`).
- [ ] Vérifier contraste + focus sur chaque écran (chat, agents, import).

---

### Axes d'amélioration proposés
1. **Tokens d'animation** : ajouter une variable `--ease-glow` + keyframes shimmer/pulse partagées pour homogénéiser les micro-interactions.
2. **Thème par agent** : décliner la teinte d'accent par agent local (Brainstormer = émeraude, Lead dev = cyan, n8n = rose n8n) tout en gardant le dark glass commun — utile pour la sélection d'agent.
3. **Migration oklch** : passer les tokens en `oklch()` (supporté shadcn v4) pour des dégradés plus propres sur le vert et un dark mode plus régulier.

**Fichier créé :** [docs/design.md](docs/design.md)
