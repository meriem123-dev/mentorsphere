"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProfilePhotoSection from "@/features/auth/components/ProfilePhotoSection";
import AboutSection from "@/features/auth/components/AboutSection";
import { profileApi } from "@/features/profile/api/profileAPI";
import { useAuth } from "@/context/AuthContext";
import { isValidAge, isValidCity } from "@/features/auth/utils/validation";
import { TextInput } from "@/features/auth/components/TextInput";
import type {
  ApiErrorResponse,
  BaseProfileFormData,
} from "@/types/authTypes";
import type { EntrepreneurEditProfile } from "@/types/profile";

interface EntrepreneurStep1FormProps {
  initialData: EntrepreneurEditProfile;
  onSuccess: () => void;
}

export function EntrepreneurStep1Form({
  initialData,
  onSuccess,
}: EntrepreneurStep1FormProps) {
  const { refetch } = useAuth();
  const [formData, setFormData] = useState<BaseProfileFormData>({
    firstName: initialData.user.firstName ?? "",
    lastName: initialData.user.lastName ?? "",
    bio: initialData.user.bio ?? "",
    birthDate: initialData.user.birthDate
      ? new Date(initialData.user.birthDate).toISOString().slice(0, 10)
      : "",
    country: initialData.user.country ?? "",
    city: initialData.user.city ?? "",
    languages: initialData.user.languages.map((l) => l.language.name),
    photo: null,
    avatarColor: initialData.user.coverPicture ?? "bg-brand-blue",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Merci de renseigner votre prénom et votre nom");
      return;
    }
    if (!formData.bio || formData.bio.trim().length < 10) {
      toast.error("Merci de renseigner une biographie (min 10 caractères)");
      return;
    }
    if (!formData.city || !isValidCity(formData.city)) {
      toast.error("Le nom de la ville ne doit pas contenir de chiffres");
      return;
    }
    if (!isValidAge(formData.birthDate)) {
      toast.error(
        formData.birthDate
          ? "Vous devez avoir au moins 15 ans"
          : "Merci de renseigner votre date de naissance",
      );
      return;
    }
    if (formData.languages.length === 0) {
      toast.error("Merci de sélectionner au moins une langue");
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.updateEntrepreneurProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
        birthDate: formData.birthDate,
        country: formData.country,
        city: formData.city,
        languages: formData.languages,
        avatarColor: formData.photo ? undefined : formData.avatarColor,
        photoFile: formData.photo,
        removePhoto: formData.removePhoto,
      });
      toast.success("Profil mis à jour");
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
    <div className="space-y-8">
      <ProfilePhotoSection
        formData={formData}
        setFormData={setFormData}
        existingPhotoUrl={initialData.user.profilePicture}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Prénom"
          value={formData.firstName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
          }
        />
        <TextInput
          label="Nom"
          value={formData.lastName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
          }
        />
      </div>
      <AboutSection formData={formData} setFormData={setFormData} />
      <Button onClick={handleSubmit} variant="default" className="w-full">
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}