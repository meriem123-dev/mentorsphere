import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const metadata = {
  title: "Conditions d'utilisation — MentorSphere",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" className="inline-block mb-8">
        <Logo />
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">
        Conditions d&apos;utilisation
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Dernière mise à jour : juillet 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Présentation du service</h2>
          <p>
            MentorSphere est une plateforme web mettant en relation des
            entrepreneurs et des mentors expérimentés, dans le but
            d&apos;accompagner le développement de projets entrepreneuriaux.
            La plateforme propose des espaces de mentorat, des outils de
            collaboration, un suivi de progression (« Startup Journey ») et
            des fonctionnalités assistées par intelligence artificielle.
          </p>
          <p>
            MentorSphere agit uniquement comme intermédiaire technique de
            mise en relation. La plateforme n&apos;est ni responsable du
            contenu des échanges entre utilisateurs, ni garante des
            résultats obtenus dans le cadre d&apos;un mentorat.
          </p>
        </section>

        <section>
          <h2>2. Création de compte</h2>
          <p>
            L&apos;accès aux fonctionnalités de MentorSphere nécessite la
            création d&apos;un compte, en tant qu&apos;« Entrepreneur » ou
            « Mentor ». Vous vous engagez à fournir des informations exactes
            et à jour, et à ne pas usurper l&apos;identité d&apos;un tiers.
          </p>
          <p>
            Vous êtes responsable de la confidentialité de votre mot de
            passe et de toute activité effectuée depuis votre compte.
            MentorSphere se réserve le droit de suspendre un compte en cas
            d&apos;usage abusif, frauduleux, ou contraire aux présentes
            conditions.
          </p>
        </section>

        <section>
          <h2>3. Rôles et responsabilités</h2>
          <p>
            <strong>Entrepreneurs</strong> : vous restez seul responsable du
            contenu de vos projets, des documents partagés et des
            informations rendues publiques ou privées sur la plateforme.
          </p>
          <p>
            <strong>Mentors</strong> : le mentorat proposé via MentorSphere
            est fourni à titre d&apos;accompagnement et de partage
            d&apos;expérience. Il ne constitue ni un conseil juridique, ni
            un conseil financier, ni une garantie de résultat pour
            l&apos;entrepreneur accompagné.
          </p>
        </section>

        <section>
          <h2>4. Contenu utilisateur</h2>
          <p>
            Vous conservez la propriété des contenus que vous publiez
            (projets, messages, documents, publications communautaires).
            En les publiant sur MentorSphere, vous accordez à la plateforme
            le droit technique nécessaire de les stocker et de les afficher
            aux utilisateurs autorisés (ex. mentor associé, membres
            d&apos;un projet collaboratif).
          </p>
          <p>
            Est interdit tout contenu illicite, diffamatoire, discriminatoire,
            frauduleux, ou portant atteinte aux droits d&apos;un tiers.
            MentorSphere se réserve le droit de retirer un contenu signalé
            après modération.
          </p>
        </section>

        <section>
          <h2>5. Fonctionnalités d&apos;intelligence artificielle</h2>
          <p>
            MentorSphere propose des fonctionnalités assistées par IA
            (analyse d&apos;idée, génération de roadmap, résumé de
            réunions, recommandations). Ces fonctionnalités sont fournies à
            titre d&apos;aide et ne remplacent pas le jugement humain d&apos;un
            mentor ou d&apos;un professionnel. Les résultats générés peuvent
            être imparfaits ou incomplets.
          </p>
        </section>

        <section>
          <h2>6. Réunions et intégration Google Meet</h2>
          <p>
            La planification de réunions repose sur l&apos;ajout manuel de
            liens de visioconférence (ex. Google Meet) par l&apos;organisateur.
            MentorSphere n&apos;héberge ni n&apos;enregistre les
            visioconférences elles-mêmes, et n&apos;est pas partie aux
            conditions d&apos;utilisation des services tiers de
            visioconférence.
          </p>
        </section>

        <section>
          <h2>7. Disponibilité du service</h2>
          <p>
            MentorSphere s&apos;efforce d&apos;assurer un accès continu à la
            plateforme, sans garantie d&apos;absence d&apos;interruption,
            notamment en cas de maintenance ou d&apos;incident technique
            chez ses prestataires d&apos;hébergement.
          </p>
        </section>

        <section>
          <h2>8. Résiliation</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis vos
            paramètres. MentorSphere peut suspendre ou résilier l&apos;accès
            d&apos;un utilisateur en cas de violation des présentes
            conditions.
          </p>
        </section>

        <section>
          <h2>9. Modifications</h2>
          <p>
            Les présentes conditions peuvent être modifiées à mesure de
            l&apos;évolution de la plateforme. Les utilisateurs seront
            informés de toute modification substantielle.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Pour toute question relative à ces conditions, vous pouvez nous
            contacter à l&apos;adresse indiquée sur la plateforme.
          </p>
        </section>
      </div>
    </div>
  );
}