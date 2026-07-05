import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — MentorSphere",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" className="inline-block mb-8">
        <Logo />
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Dernière mise à jour : juillet 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Données collectées</h2>
          <p>Dans le cadre de l&apos;utilisation de MentorSphere, nous collectons :</p>
          <ul>
            <li>
              <strong>Données de compte</strong> : nom, prénom, adresse
              e-mail, mot de passe (chiffré), rôle (entrepreneur ou mentor).
            </li>
            <li>
              <strong>Données de profil</strong> : photo, biographie,
              compétences, domaines d&apos;intérêt ou d&apos;expertise,
              réseaux sociaux, disponibilités (pour les mentors).
            </li>
            <li>
              <strong>Contenu généré</strong> : projets, étapes de la
              roadmap, messages échangés dans les espaces de mentorat,
              documents partagés, publications communautaires.
            </li>
            <li>
              <strong>Données techniques</strong> : informations de
              connexion nécessaires au bon fonctionnement de
              l&apos;authentification.
            </li>
          </ul>
        </section>

        <section>
          <h2>2. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Créer et gérer votre compte utilisateur ;</li>
            <li>
              Mettre en relation entrepreneurs et mentors, et faire
              fonctionner les espaces de mentorat ;
            </li>
            <li>
              Assurer le suivi des projets et du Startup Journey ;
            </li>
            <li>
              Alimenter les fonctionnalités d&apos;intelligence artificielle
              (analyse d&apos;idée, résumé, recommandations) ;
            </li>
            <li>Assurer la sécurité et la modération de la plateforme.</li>
          </ul>
        </section>

        <section>
          <h2>3. Hébergement et sous-traitants</h2>
          <p>
            Vos données sont hébergées et traitées par l&apos;intermédiaire
            des prestataires techniques suivants :
          </p>
          <ul>
            <li>
              <strong>Vercel</strong> — hébergement de l&apos;interface web ;
            </li>
            <li>
              <strong>Render</strong> — hébergement du serveur applicatif ;
            </li>
            <li>
              <strong>Neon (PostgreSQL)</strong> — hébergement de la base de
              données, région Frankfurt (Union européenne) ;
            </li>
            <li>
              <strong>Cloudinary</strong> — stockage des fichiers médias
              (photos de profil, documents) ;
            </li>
            <li>
              <strong>Groq</strong> — traitement des requêtes liées aux
              fonctionnalités d&apos;intelligence artificielle.
            </li>
          </ul>
          <p>
            Ces prestataires n&apos;utilisent vos données que pour fournir
            le service technique correspondant, et non à des fins
            publicitaires propres.
          </p>
        </section>

        <section>
          <h2>4. Partage des données entre utilisateurs</h2>
          <p>
            Certaines informations sont visibles par d&apos;autres
            utilisateurs selon le contexte : un profil mentor est visible
            par les entrepreneurs en recherche de mentorat ; un projet
            marqué « public » est visible par la communauté ; les messages
            échangés dans un espace de mentorat ne sont visibles que par les
            participants à cet espace.
          </p>
        </section>

        <section>
          <h2>5. Sécurité</h2>
          <p>
            L&apos;authentification repose sur des jetons JWT et les mots
            de passe sont stockés sous forme hachée (bcrypt). Les accès aux
            données sont contrôlés selon le rôle de l&apos;utilisateur
            (entrepreneur, mentor, administrateur).
          </p>
        </section>

        <section>
          <h2>6. Conservation des données</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif.
            En cas de suppression de compte, vos données personnelles sont
            supprimées, à l&apos;exception des informations dont la
            conservation serait requise à des fins légales.
          </p>
        </section>

        <section>
          <h2>7. Vos droits</h2>
          <p>Vous disposez à tout moment du droit de :</p>
          <ul>
            <li>Accéder à vos données personnelles ;</li>
            <li>Demander leur rectification ;</li>
            <li>Demander la suppression de votre compte et de vos données ;</li>
            <li>Vous opposer à certains traitements.</li>
          </ul>
          <p>
            Vous pouvez exercer ces droits directement depuis les
            paramètres de votre compte, ou en nous contactant.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            MentorSphere utilise uniquement des cookies techniques
            nécessaires au fonctionnement de l&apos;authentification et à
            la préservation de vos préférences (ex. mode clair/sombre).
            Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé
            à ce jour.
          </p>
        </section>

        <section>
          <h2>9. Modifications de cette politique</h2>
          <p>
            Cette politique de confidentialité peut évoluer avec le
            développement de la plateforme. Toute modification
            significative sera communiquée aux utilisateurs.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Pour toute question relative à vos données personnelles, vous
            pouvez nous contacter à l&apos;adresse indiquée sur la
            plateforme.
          </p>
        </section>
      </div>
    </div>
  );
}