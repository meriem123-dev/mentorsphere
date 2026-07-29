type ObjectiveCategory =  | "Vision & stratégie"
  | "Étude de marché"
  | "Validation du besoin"
  | "Développement produit"
  | "Expérience utilisateur"
  | "Modèle économique"
  | "Marketing & croissance"
  | "Ventes"
  | "Finance"
  | "Levée de fonds"
  | "Préparation investisseurs"
  | "Juridique"
  | "Opérations"
  | "Leadership"
  | "Équipe"
  | "Technologie"
  | "Réseau & partenariats"
  | "Développement personnel";

const CATEGORY_STYLES: Record<ObjectiveCategory, string> = {
  "Vision & stratégie": "bg-brand-blue/10 text-brand-blue",
  "Étude de marché": "bg-brand-blue-light/15 text-brand-blue",
  "Validation du besoin": "bg-info/10 text-info",

  "Développement produit": "bg-brand-rose/10 text-brand-rose",
  "Expérience utilisateur": "bg-brand-rose-light/15 text-brand-rose",

  "Modèle économique": "bg-warning/10 text-warning",
  "Marketing & croissance": "bg-warning/10 text-warning",
  Ventes: "bg-warning/15 text-warning",

  Finance: "bg-success/10 text-success",
  "Levée de fonds": "bg-success/15 text-success",
  "Préparation investisseurs": "bg-success/20 text-success",

  Juridique: "bg-muted text-muted-foreground",
  Opérations: "bg-muted text-muted-foreground",

  Leadership: "bg-brand-blue/15 text-brand-blue",
  Équipe: "bg-brand-blue-light/15 text-brand-blue",

  Technologie: "bg-brand-rose-light/15 text-brand-rose",
  "Réseau & partenariats": "bg-brand-blue-light/15 text-brand-blue",
  "Développement personnel": "bg-brand-rose/10 text-brand-rose",
};

export function ObjectiveCategoryBadge({ category }: { category: ObjectiveCategory }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
}