---
name: presentation
description: Génère un script de présentation 5 minutes pour un recruteur ESN, ET/OU une présentation visuelle (HTML/CSS, PowerPoint, PDF) à la demande, basé sur les documents de référence du candidat (CV, dossier de compétences).
context: use when the user asks to prepare a presentation script, pitch, self-introduction, or a visual presentation deck (HTML, PowerPoint, PDF) for a freelance recruiter
user-invocable: true
---

# Skill : Présentation freelance (ESN)

## Objectif
Produire une présentation pour un recruteur ESN, en français, pour un positionnement en mission freelance. Deux livrables possibles, selon la demande :
1. **Script oral** — texte d'une présentation de 5 minutes (livrable par défaut).
2. **Présentation visuelle** — un deck au format **HTML/CSS**, **PowerPoint (.pptx)** ou **PDF**, généré à la demande de l'utilisateur.

Si la demande ne précise pas le format, produire le **script oral** et proposer ensuite de générer une version visuelle.

## Documents de référence
Les documents sources sont dans le dossier `references/` (chemin relatif à ce skill) :
- `cv_react-node.pdf` — CV du candidat
- `Assadi_Dossier_De_Compétences.pdf` — Dossier de compétences détaillé

Lire ces documents avant toute rédaction.

## Instructions de rédaction

1. **Lire les documents** avec les outils disponibles avant toute rédaction.
2. **Challenger le candidat** si des informations manquent ou sont insuffisantes pour rédiger un pitch convaincant (ex: réalisations chiffrées, contexte de missions, valeur ajoutée).
3. **Rédiger le script** en suivant cette structure :
   - Accroche (15 sec) — une phrase qui capte l'attention
   - Qui je suis (30 sec) — profil, spécialité, années d'expérience
   - Ce que je fais (1 min) — stack technique, type de missions, domaines métier
   - Mes réalisations clés (1 min 30) — 2-3 exemples concrets et impactants
   - Ma valeur ajoutée (1 min) — ce qui me différencie des autres freelances
   - Mon projet / disponibilité (45 sec) — ce que je cherche, quand je suis dispo
4. **Conseils d'amélioration** : après le script, lister 3 à 5 axes d'amélioration concrets.
5. **Préparer les questions fréquentes ESN** : fournir 8 à 10 questions typiques avec des réponses suggérées adaptées au profil.
6. **Conseils sur les questions à poser au recruteur** : lister 5 questions pertinentes que le candidat peut poser.

## Contraintes (script oral)
- Langue : français exclusivement
- Ton : vendeur, dynamique, confiant — pas académique
- Format de sortie : Markdown structuré
- Durée cible : 5 minutes à l'oral (environ 700-750 mots)

---

## Présentation visuelle (à la demande)

Lorsque l'utilisateur demande une **présentation visuelle** (ou un « deck », « slides », « support visuel »), générer le support dans le format demandé : **HTML/CSS**, **PowerPoint** ou **PDF**.

### Étapes communes
1. **Lire les documents de référence** (`references/`) et, si disponible, réutiliser le script oral déjà rédigé.
2. **Confirmer le format** si l'utilisateur ne l'a pas précisé (HTML/CSS, PowerPoint, ou PDF).
3. **Invoquer le skill `ui-ux-pro-max`** pour le design : choisir un style, une palette et un pairing de polices cohérents avant de produire le support. C'est obligatoire pour garantir une qualité visuelle pro.
4. **Structurer le deck** en slides (1 idée par slide), en s'appuyant sur la structure du script :
   - Slide 1 — Titre / accroche + nom + spécialité
   - Slide 2 — Qui je suis (profil, années d'expérience)
   - Slide 3 — Ce que je fais (stack technique, types de missions)
   - Slide 4-5 — Réalisations clés (2-3 exemples chiffrés)
   - Slide 6 — Valeur ajoutée / différenciation
   - Slide 7 — Disponibilité & contact (call to action)

### Direction artistique (rappel CLAUDE.md)
- Thème : bleu nuit moderne (`#0a0f2c` / `#0d1b4b`) avec dégradés
- Typographie : sans-serif (`Inter`, `Outfit`, ou `system-ui` en fallback)
- Style : épuré, professionnel, contraste fort, micro-animations légères si pertinent
- Le skill `ui-ux-pro-max` peut proposer d'autres styles/palettes — les présenter à l'utilisateur si pertinent.

### Inspiration visuelle (OBLIGATOIRE)
**Toujours s'inspirer des images du dossier `presentations/template/`** avant de concevoir le design. Les **lire** (outil Read) pour en extraire les codes visuels et les transposer au support.

Codes récurrents observés dans ces templates :
- **Typographie géante et condensée** : un mot-clé en très grande taille, souvent en arrière-plan « fantôme » (texte ajouré / faible opacité) qui structure la slide.
- **Palette duotone saturée par deck** + **dégradés** (bleu, violet, teal/magenta selon le modèle) — garder le bleu nuit du projet comme base par défaut.
- **Objets / éléments 3D flottants** apportant de la profondeur ; composition en couches.
- **Fort contraste** : texte blanc sur fond saturé.
- **Détails graphiques** : badges, pastilles à icônes, puces numérotées, petits traits/formes décoratives.
- Esthétique **dynamique et marketing**, jamais plate ni académique.

S'inspirer de ces codes **sans copier** les visuels : transposer la mise en page, la hiérarchie typographique et l'énergie au contenu de la présentation freelance.

### Convention de nommage et d'arborescence (OBLIGATOIRE)
- Chaque présentation est rangée dans **son propre dossier** sous `presentations/`.
- Le **dossier** ET les **fichiers** suivent ces règles de nommage :
  - tout en **minuscules**
  - mots séparés par des **underscores `_`** (pas d'espaces)
  - **aucun caractère spécial ni accent** (`é`→`e`, `à`→`a`, etc.)
  - le nom se **termine par la date du jour au format `AAAAMMJJ`** (ex. `20260601`)
- Format type : `presentations/<nom>_AAAAMMJJ/<nom>_AAAAMMJJ.<ext>`
- Exemple (date du jour `20260601`) : `presentations/presentation_freelance_20260601/presentation_freelance_20260601.html`
- Récupérer la date du jour réelle (ne pas coder `20260601` en dur — c'est un exemple).

### Génération par format

**HTML / CSS**
- Produire un fichier HTML autonome (CSS inline ou `<style>`, aucune dépendance externe sauf polices Google Fonts).
- Navigation entre slides au clavier (flèches) ou scroll plein écran ; chaque slide en `100vh`.
- Inclure les dégradés et micro-animations légères (transitions, fade-in).
- Ex. : `presentations/presentation_freelance_20260601/presentation_freelance_20260601.html`

**PowerPoint (.pptx)**
- Invoquer le skill `pptx` pour la génération du fichier `.pptx`.
- Appliquer la direction artistique (couleurs, polices, mise en page) sur chaque slide.
- Ex. : `presentations/presentation_freelance_20260601/presentation_freelance_20260601.pptx`

**PDF**
- Invoquer le skill `pdf` pour produire le PDF, OU générer d'abord le HTML puis le convertir en PDF.
- Garder un format paysage (16:9) adapté à une présentation projetée.
- Ex. : `presentations/presentation_freelance_20260601/presentation_freelance_20260601.pdf`

### Après génération
- Indiquer le chemin du fichier produit.
- Proposer 2-3 axes d'amélioration du support (clarté visuelle, hiérarchie, impact).
