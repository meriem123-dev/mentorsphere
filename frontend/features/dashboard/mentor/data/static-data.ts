import type { Feedback } from "@/types/dashTypes";

export const STATIC_FEEDBACKS: Feedback[] = [
  {
    id: "1",
    menteeName: "Elena Kovacs",
    initials: "EK",
    rating: 5,
    quote: "Sarah m'a aidé à pivoter ma stratégie de pricing. Résultat : +35% de conversion.",
    accent: "rose",
  },
  {
    id: "2",
    menteeName: "David Kim",
    initials: "DK",
    rating: 5,
    quote: "Conseils très concrets sur le go-to-market. Exactement ce dont j'avais besoin.",
    accent: "blue",
  },
];

export const STATIC_AVERAGE_RATING = "4.9";
export const STATIC_AVERAGE_RATING_DELTA = "Top 5% mentors";