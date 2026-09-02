"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "@/components/ui/star-rating";
import { feedbackApi } from "@/features/feedback/api/feedbackAPI";
import type { MentorToRate, PlatformTestimonial } from "@/types/feedbackTypes";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// recalcule la moyenne locale sans attendre un refetch
function applyOptimisticRating(
  mentor: MentorToRate,
  newRating: number,
): Pick<MentorToRate, "averageRating" | "reviewsCount"> {
  if (mentor.myRating === null) {
    const newCount = mentor.reviewsCount + 1;
    const totalScore = mentor.averageRating * mentor.reviewsCount + newRating;
    return { averageRating: totalScore / newCount, reviewsCount: newCount };
  }
  const totalScore =
    mentor.averageRating * mentor.reviewsCount - mentor.myRating + newRating;
  return { averageRating: totalScore / mentor.reviewsCount, reviewsCount: mentor.reviewsCount };
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [mentors, setMentors] = useState<MentorToRate[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [savingMentorId, setSavingMentorId] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<PlatformTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformRating, setPlatformRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [mentorsData, testimonialsData, myReview] = await Promise.all([
          feedbackApi.getMentorsToRate(),
          feedbackApi.getTestimonials(),
          feedbackApi.getMyPlatformReview(),
        ]);
        if (cancelled) return;
        setMentors(mentorsData);
        setCommentDrafts(
          Object.fromEntries(mentorsData.map((m) => [m.mentorshipId, m.myComment ?? ""])),
        );
        setTestimonials(testimonialsData);
        if (myReview) {
          setPlatformRating(myReview.rating);
          setComment(myReview.comment ?? "");
        }
      } catch (err) {
        if (!cancelled) toast.error("Impossible de charger vos évaluations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // note (et commentaire courant s'il existe) — appelé au clic sur une étoile
  async function handleRateMentor(mentorshipId: string, rating: number) {
    const mentor = mentors.find((m) => m.mentorshipId === mentorshipId);
    if (!mentor) return;

    const optimistic = applyOptimisticRating(mentor, rating);
    setMentors((prev) =>
      prev.map((m) =>
        m.mentorshipId === mentorshipId ? { ...m, myRating: rating, ...optimistic } : m,
      ),
    );

    try {
      await feedbackApi.rateMentor(mentorshipId, rating, commentDrafts[mentorshipId] || undefined);
      toast.success("Merci pour votre note !");
    } catch (err) {
      toast.error("Impossible d'enregistrer votre note");
    }
  }

  // sauvegarde du commentaire (garde la note actuelle)
  async function handleSaveComment(mentorshipId: string) {
    const mentor = mentors.find((m) => m.mentorshipId === mentorshipId);
    if (!mentor) return;
    if (!mentor.myRating) {
      toast.info("Notez d'abord ce mentor avec les étoiles avant d'ajouter un commentaire.");
      return;
    }

    setSavingMentorId(mentorshipId);
    try {
      await feedbackApi.rateMentor(mentorshipId, mentor.myRating, commentDrafts[mentorshipId]);
      setMentors((prev) =>
        prev.map((m) =>
          m.mentorshipId === mentorshipId
            ? { ...m, myComment: commentDrafts[mentorshipId] }
            : m,
        ),
      );
      toast.success("Commentaire enregistré");
    } catch (err) {
      toast.error("Impossible d'enregistrer le commentaire");
    } finally {
      setSavingMentorId(null);
    }
  }

  async function handleSubmitPlatformReview() {
    if (platformRating === 0) {
      toast.info("Sélectionnez une note globale avant d'envoyer");
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.submitPlatformReview({ rating: platformRating, comment });
      toast.success("Merci pour votre avis sur MentorSphere !");
    } catch (err) {
      toast.error("Impossible d'envoyer votre avis");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-brand-navy/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
          <div className="relative mb-6 flex flex-col items-center text-center">
            <Dialog.Title className="text-lg font-semibold text-brand-rose">
              Votre avis compte
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Notez vos mentors et partagez votre expérience sur MentorSphere.
            </Dialog.Description>

            <Dialog.Close
              aria-label="Fermer"
              className="absolute right-0 top-0 cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <div className="flex flex-col gap-8">
              <section>
                <h3 className="text-base font-medium text-foreground">Évaluez vos mentors</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notez vos mentors sur 5 étoiles et rédigez un avis pour la communauté.
                </p>

                {mentors.length === 0 ? (
                  <p className="mt-4 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Vous n&apos;avez pas encore de mentor à évaluer.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {mentors.map((mentor) => (
                      <div key={mentor.mentorshipId} className="rounded-2xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-medium text-white">
                            {mentor.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{mentor.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{mentor.title}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <StarRating value={mentor.averageRating} readOnly size="sm" />
                            <span>{mentor.averageRating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Votre note</span>
                          <StarRating
                            value={mentor.myRating ?? 0}
                            onChange={(rating) => handleRateMentor(mentor.mentorshipId, rating)}
                            size="sm"
                          />
                        </div>

                        <textarea
                          value={commentDrafts[mentor.mentorshipId] ?? ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [mentor.mentorshipId]: e.target.value,
                            }))
                          }
                          placeholder="Un mot sur votre accompagnement avec ce mentor ?"
                          rows={2}
                          className="mt-3 w-full resize-none rounded-xl border bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-blue/40"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveComment(mentor.mentorshipId)}
                          disabled={savingMentorId === mentor.mentorshipId}
                          className="mt-2 w-full cursor-pointer rounded-lg border py-1.5 text-xs font-medium text-white transition-colors bg-gradient-brand hover:opacity-80 disabled:opacity-60"
                        >
                          {savingMentorId === mentor.mentorshipId
                            ? "Enregistrement…"
                            : "Enregistrer le commentaire"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-5">
                  <h3 className="text-base font-medium text-foreground">Votre avis sur la plateforme</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Comment évaluez-vous votre expérience globale sur MentorSphere ?
                  </p>

                  <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-muted/40 py-4">
                    <span className="text-xs text-muted-foreground">Note globale</span>
                    <StarRating value={platformRating} onChange={setPlatformRating} size="lg" />
                  </div>

                  <label className="mt-4 block text-xs text-muted-foreground">Votre commentaire</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Qu'est-ce qui vous a plu ? Qu'est-ce qui pourrait s'améliorer ?"
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue/40"
                  />

                  <button
                    type="button"
                    onClick={handleSubmitPlatformReview}
                    disabled={submitting}
                    className="mt-4 w-full cursor-pointer rounded-xl bg-gradient-brand py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                  >
                    {submitting ? "Envoi…" : "Envoyer mon avis sur MentorSphere"}
                  </button>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-brand-navy to-brand-rose p-5 text-white">
                  <p className="text-xs uppercase tracking-wide text-white/60">Témoignages</p>
                  <h3 className="mt-1 text-base font-medium">Ce qu&apos;ils disent</h3>

                  <div className="mt-4 flex flex-col gap-3">
                    {testimonials.map((t) => (
                      <div key={t.id} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                        <p className="text-sm leading-snug text-white/90">{t.quote}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-medium">
                              {t.initials}
                            </div>
                            <div className="leading-tight">
                              <p className="text-xs font-medium">{t.author}</p>
                              <p className="text-[10px] text-white/60">{t.date}</p>
                            </div>
                          </div>
                          <StarRating value={t.rating} readOnly size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}