"use client";

import { useState } from "react";
import Image from "next/image";
import { ProfileFormData } from "@/types/authTypes";
import { SetProfileFormData } from "@/types/authTypes";


//bg colors photo
const AVATAR_COLORS = [
  "bg-brand-blue",
  "bg-brand-rose",
  "bg-brand-blue-light",
  "bg-brand-rose-light",
  "bg-gradient-brand",
  "bg-gradient-rose-fade",
];

interface ProfilePhotoSectionProps {
  formData: ProfileFormData;
  setFormData: SetProfileFormData;
}


//mon cmpst
export default function ProfilePhotoSection({
  formData,
  setFormData,
}: ProfilePhotoSectionProps) {
  const [selectedColor, setSelectedColor] = useState("bg-brand-blue");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  //gérer upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setUploadedImage(result);
      setFormData({ ...formData, photo: result }); // string | null
    };
    reader.readAsDataURL(file);
  }
};


  //mon rendu
  return (
    <div className="border-b border-border pb-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Photo de Profil
      </h3>

      <div className="flex items-center gap-6">
        <div
          className={`w-20 h-20 ${selectedColor} rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ring-2 ring-offset-2 ring-offset-card ring-transparent`}
        >
          {uploadedImage ? (
            <Image
              src={uploadedImage}
              alt="Profile"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            "MM"
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
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full ${color} cursor-pointer border-2 transition ${
                  selectedColor === color
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
