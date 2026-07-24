"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { BaseProfileFormData } from "@/types/authTypes";

const AVATAR_COLORS = [
  "bg-brand-blue",
  "bg-brand-rose",
  "bg-brand-blue-light",
  "bg-brand-rose-light",
  "bg-gradient-brand",
  "bg-gradient-rose-fade",
];

interface ProfilePhotoSectionProps<T extends BaseProfileFormData> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  existingPhotoUrl?: string | null;
}

function getInitialsFromNames(firstName: string, lastName: string): string {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "MM";
}

export default function ProfilePhotoSection<T extends BaseProfileFormData>({
  formData,
  setFormData,
  existingPhotoUrl = null,
}: ProfilePhotoSectionProps<T>) {
  const [selectedColor, setSelectedColor] = useState(
    formData.avatarColor || "bg-brand-blue",
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const initials = getInitialsFromNames(formData.firstName, formData.lastName);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, photo: file, removePhoto: false }));
    }
  };

  const handleRemovePhoto = () => {
    setUploadedImage(null);
    setFormData((prev) => ({
      ...prev,
      photo: null,
      removePhoto: true,
    }));
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setFormData((prev) => ({
      ...prev,
      avatarColor: color,
      photo: null,
      removePhoto: Boolean(uploadedImage || existingPhotoUrl),
    }));
    setUploadedImage(null);
  };

  const displayImage = formData.removePhoto
    ? null
    : (uploadedImage ?? existingPhotoUrl);

  return (
    <div className="border-b border-border pb-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Photo de Profil
      </h3>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <div
            className={`w-20 h-20 ${displayImage ? "" : selectedColor} rounded-2xl flex items-center justify-center text-white text-2xl font-bold ring-2 ring-offset-2 ring-offset-card ring-transparent overflow-hidden`}
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized={displayImage.startsWith("data:")}
              />
            ) : (
              initials
            )}
          </div>

          {displayImage && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow hover:opacity-90"
              aria-label="Supprimer la photo"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-3">
            Choisissez une couleur ou uploadez une photo
          </p>

          <div className="flex gap-2 mb-4">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`w-6 h-6 rounded-full ${color} cursor-pointer border-2 transition ${
                  selectedColor === color && !displayImage
                    ? "border-foreground"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>

          <label className="text-primary text-sm font-medium cursor-pointer hover:underline">
            Importer une photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}