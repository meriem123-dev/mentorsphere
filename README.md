# MentorSphere

Plateforme web collaborative de mentorat entrepreneurial. MentorSphere met en relation des entrepreneurs porteurs de projet avec des mentors expérimentés, au sein d'un environnement structuré combinant espaces de travail collaboratifs, suivi de progression, mise en relation assistée par intelligence artificielle et communauté d'entraide.

Contrairement à un réseau professionnel classique centré sur la mise en relation, MentorSphere est centré sur le parcours entrepreneurial : chaque projet dispose de son propre Startup Journey, de son Workspace de mentorat, d'outils de collaboration, d'une planification des sessions et d'une assistance IA. L'objectif n'est pas seulement de connecter des personnes, mais d'accompagner concrètement la transformation d'une idée en startup.

Projet personnel.

## Objectifs du projet

- Faciliter l'accès au mentorat pour les entrepreneurs
- Encourager l'entrepreneuriat par un accompagnement structuré
- Favoriser la collaboration entre porteurs de projet
- Accompagner les projets depuis l'idée jusqu'au MVP
- Utiliser l'intelligence artificielle comme assistant du mentor, et non comme un remplacement
- Construire une communauté autour de l'innovation

## Utilisateurs

**Entrepreneur** : une personne ayant une idée, un projet ou une startup, à la recherche d'accompagnement et de mise en relation avec des mentors.

**Mentor** : une personne expérimentée souhaitant accompagner des entrepreneurs, gérer plusieurs mentorats et partager des ressources.

## Fonctionnalités

### Espace Entrepreneur

- Dashboard : statistiques, activité, parcours et suggestions IA
- Startups : gestion de plusieurs projets (création, modification, statut, besoins)
- Mon Parcours : roadmap de la startup, étapes et progression
- Workspace : espace de mentorat (messagerie, objectifs, documents, résumés IA)
- Explorer : recherche de mentors et d'entrepreneurs ,demandes de mentorat
- Communauté : publications, questions, commentaires, likes
- IA Assistant : analyse d'idée, roadmap, amélioration de pitch, recommandations de mentors
- Ressources : articles, documents et vidéos 

### Espace Mentor

- Dashboard : vue d'ensemble de l'activité de mentorat
- Mes Mentorés : suivi des entrepreneurs accompagnés
- Demandes : consultation, acceptation ou refus des demandes de mentorat
- Workspace : messagerie, objectifs, notes, documents, suivi de progression
- Communauté : publications, questions, commentaires
- IA Assistant : résumé automatique, analyse de projet, briefing, plans d'action
- Ressources : publication de vidéos, documents et 

### Fonctionnalités communes

- Authentification (locale et Google), gestion du profil, réinitialisation du mot de passe
- Messagerie en temps réel
- Calendrier et sessions (visioconférence)
- Recherche, favoris, paramètres
- Mode clair et mode sombre
- Gestion documentaire

## Stack technique

### Frontend

- Next.js (App Router), React, TypeScript
- Tailwind CSS v4
- Framer Motion
- Base UI (`@base-ui/react`)
- Sonner, Lucide, Recharts
- React Hook Form
- `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`
- `@jitsi/react-sdk`
- `date-fns`

### Backend

- Express.js, TypeScript
- Prisma ORM
- JWT, bcrypt
- `jsonwebtoken` (RS256) et `google-auth-library` pour JaaS
- Multer et Cloudinary pour les fichiers
- Socket.io pour le temps réel

### Base de données

- PostgreSQL
- Neon (hébergement serverless)

### Intelligence artificielle

- API Groq
- Modèle `openai/gpt-oss-120b`
- Cas d'usage : analyse d'idée, génération de roadmap, amélioration de pitch, résumé de réunions, recommandations de mentors, chat IA

### Infrastructure et outillage

- Frontend déployé sur Vercel
- Backend déployé sur Render
- Base de données hébergée sur Neon
- Images hébergées sur Cloudinary
- Workflows n8n conçus pour l'automatisation des emails (sessions créées, annulées, reportées, rappels) — publiés mais non encore déployés
- Git et GitHub, CI via GitHub Actions
- Diagramme de classes réalisé avec Visual Paradigm

## Structure du dépôt

```
mentorsphere/
├── frontend/
│   ├── app/
│   ├── features/
│   └── types/
└── backend/
    ├── prisma/
    └── src/
        ├── routes/
        ├── controllers/
        └── services/
```

Le backend suit une architecture en couches :

```
Route -> Controller -> Service -> Prisma -> Base de données
```

## Prérequis

- Node.js 18 ou supérieur
- npm, yarn, pnpm ou bun
- Un compte Neon (ou une instance PostgreSQL accessible)
- Un compte Cloudinary
- Une clé API Groq

## Installation

```bash
git clone https://github.com/<votre-organisation>/mentorsphere.git
cd mentorsphere
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application accessible sur [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Base de données

Le schéma est géré par Prisma ORM et versionné dans `backend/prisma/schema.prisma`. Les entités principales sont : `User`, `Mentor`, `Entrepreneur`, `Startup`, `StartupStep`, `Mentorship`, `Message`, `Objective`, `WorkspaceDocument`, `Session`, `SessionParticipant`, `Task`, `Resource`, `Post`, `AIChatSession`, `MentorReview` et `PlatformReview`.

Commandes courantes :

```bash
npx prisma migrate dev --name <nom_de_la_migration>
npx prisma migrate deploy
npx prisma migrate status
npx prisma studio
npx prisma generate
```

## Déploiement

| Composant        | Plateforme                     |
|-------------------|----------------------------------|
| Frontend          | Vercel                             |
| Backend           | Render                              |
| Base de données   | Neon PostgreSQL                     |
| Fichiers/images   | Cloudinary                           |
| Automatisation    | n8n (workflows publiés, déploiement non encore réalisé) |
