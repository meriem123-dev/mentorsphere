"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import SectionCard from "@/components/ui/SectionCard";
import { ChoicePills } from "@/components/ui/ChoicePills";
import { TextInput } from "@/features/auth/components/TextInput";
import { FileUploadInput } from "@/components/ui/FileUploadInput";
import { Button } from "@/components/ui/button";
import { Link, CalendarClock, FileText, X } from "lucide-react";
import { profileApi } from "@/features/profile/api/profileAPI";
import { useAuth } from "@/context/AuthContext";
import type { ApiErrorResponse } from "@/types/authTypes";
import type { MentorEditProfile } from "@/types/profile";
import { isValidUrl } from "@/features/auth/utils/validation";

const AVAILABILITY_OPTIONS = ["Jours de semaine", "Soirées", "Week-end"];

interface MentorStep3FormProps {
  initialData: MentorEditProfile;
  onSuccess: () => void;
}

function findSocialUrl(
  links: { platform: string; url: string }[],
  platform: string,
) {
  return links.find((l) => l.platform === platform)?.url ?? "";
}

export function MentorStep3Form({
  initialData,
  onSuccess,
}: MentorStep3FormProps) {
  const { refetch } = useAuth();

  const [linkedin, setLinkedin] = useState(
    findSocialUrl(initialData.user.socialLinks, "LINKEDIN"),
  );
  const [github, setGithub] = useState(
    findSocialUrl(initialData.user.socialLinks, "GITHUB"),
  );
  const [portfolio, setPortfolio] = useState(
    findSocialUrl(initialData.user.socialLinks, "PORTFOLIO"),
  );
  const [website, setWebsite] = useState(
    findSocialUrl(initialData.user.socialLinks, "WEBSITE"),
  );
  const [availability, setAvailability] = useState<string[]>(
    initialData.user.availabilities.map((a) => a.slot),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [keepExistingCv, setKeepExistingCv] = useState(true);
  const [documents, setDocuments] = useState<File[]>([]);
  const [removedDocumentIds, setRemovedDocumentIds] = useState<string[]>([]);

  async function handleSubmit() {
    if (!isValidUrl(linkedin)) {
      toast.error("Le lien LinkedIn n'est pas une URL valide");
      return;
    }
    if (!isValidUrl(github)) {
      toast.error("Le lien GitHub n'est pas une URL valide");
      return;
    }
    if (!isValidUrl(portfolio)) {
      toast.error("Le lien Portfolio n'est pas une URL valide");
      return;
    }
    if (!isValidUrl(website)) {
      toast.error("Le lien du site web n'est pas une URL valide");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateMentorProfile({
        linkedin,
        github,
        portfolio,
        website,
        availability,
        cvFile: cv,
        removeCv: !keepExistingCv && !cv,
        documentFiles: documents.length ? documents : undefined,
        removeDocumentIds: removedDocumentIds.length
          ? removedDocumentIds
          : undefined,
      });
      toast.success("Profil mis à jour");
      setDocuments([]);
      await refetch();
      onSuccess();
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      toast.error("Erreur lors de la mise à jour", {
        description: axiosError.response?.data?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Réseaux sociaux" icon={<Link />}>
        <div className="space-y-3">
          <TextInput
            label="LinkedIn"
            placeholder="linkedin URL"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
          <TextInput
            label="GitHub"
            placeholder="github URL"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
          <TextInput
            label="Portfolio"
            placeholder="portfolio URL"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
          />
          <TextInput
            label="Site web"
            placeholder="website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Disponibilités" icon={<CalendarClock />}>
        <ChoicePills
          options={AVAILABILITY_OPTIONS}
          value={availability}
          onChange={(value) => setAvailability(value as string[])}
          multiple
        />
      </SectionCard>

      <SectionCard title="Documents" icon={<FileText />}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">CV</p>
            {initialData.user.cv && keepExistingCv && !cv && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm mb-2">
                <a
                  href={initialData.user.cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 truncate"
                >
                  <FileText size={14} className="text-primary flex-shrink-0" />
                  <span className="truncate text-foreground">
                    {initialData.user.cv.fileName}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setKeepExistingCv(false)}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <FileUploadInput
              label="Remplacer le CV"
              files={cv ? [cv] : []}
              onChange={(files) => setCv(files[0] ?? null)}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Documents existants
            </p>
            {(initialData.user.documents ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun document</p>
            )}
            {(initialData.user.documents ?? [])
              .filter((doc) => !removedDocumentIds.includes(doc.id))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm mb-2"
                >
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 truncate"
                  >
                    <FileText
                      size={14}
                      className="text-primary flex-shrink-0"
                    />
                    <span className="truncate text-foreground">
                      {doc.fileName}
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setRemovedDocumentIds((prev) => [...prev, doc.id])
                    }
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
          </div>

          <FileUploadInput
            label="Ajouter des documents"
            multiple
            files={documents}
            onChange={setDocuments}
          />
        </div>
      </SectionCard>

      <Button onClick={handleSubmit} variant="default" className="w-full mt-4">
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}