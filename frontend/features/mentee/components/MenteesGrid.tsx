"use client";

import { motion } from "framer-motion";
import { MenteeCard } from "./MenteeCard";
import { EmptyMenteesState } from "./EmptyMenteeState";
import type { Mentee } from "../../../types/mentoratTypes";
import { useRouter } from "next/navigation";

interface MenteesGridProps {
  mentees: Mentee[];
  onOpenMentee?: (mentee: Mentee) => void;
  onViewProfile?: (entrepreneurId: string) => void;
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function MenteesGrid({ mentees, onOpenMentee, onViewProfile }: MenteesGridProps) {
  const router = useRouter();

  if (mentees.length === 0) {
    return <EmptyMenteesState />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {mentees.map((mentee) => (
        <motion.div key={mentee.mentorshipId} variants={item}>
          <MenteeCard mentee={mentee}  onOpen={(m) => router.push(`/mentor/workspace/${m.mentorshipId}`)} onViewProfile={onViewProfile} />
        </motion.div>
      ))}
    </motion.div>
  );
}