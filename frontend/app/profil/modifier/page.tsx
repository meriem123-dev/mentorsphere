"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { profileApi } from "@/features/profile/api/profileAPI";
import { ProfileEditTabs, type ProfileTab } from  "@/features/profile/components/ProfileEditTabs";
import { EmailPasswordForm } from "@/features/profile/components/EmailPasswordForm";
import { EntrepreneurStep1Form } from  "@/features/profile/components/EntrepreneurStep1Form";
import { EntrepreneurStep2Form } from  "@/features/profile/components/EntrepreneurStep2Form";
import { EntrepreneurStep3Form } from  "@/features/profile/components/EntrepreneurStep3Form";
import { MentorStep1Form } from "@/features/profile/components/MentorStep1Form";
import { MentorStep2Form } from "@/features/profile/components/MentorStep2Form";
import { MentorStep3Form } from "@/features/profile/components/MentorStep3Form";
import type { EntrepreneurEditProfile, MentorEditProfile } from "@/types/profile";

export default function ModifierProfilPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("step1");
  const [profile, setProfile] = useState<EntrepreneurEditProfile | MentorEditProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await profileApi.getMyProfile();
        if (!ignore) setProfile(data);
      } catch {
        if (!ignore) setProfile(null);
      } finally {
        if (!ignore) setProfileLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user || !profile) return null;

  function handleSuccess() {
    profileApi.getMyProfile().then(setProfile);
  }

  const isMentor = user.role === "MENTOR";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">

      <ProfileEditTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-4">
        {activeTab === "email" && <EmailPasswordForm />}
        {activeTab === "step1" &&
          (isMentor ? (
            <MentorStep1Form
              initialData={profile as MentorEditProfile}
              onSuccess={handleSuccess}
            />
          ) : (
            <EntrepreneurStep1Form
              initialData={profile as EntrepreneurEditProfile}
              onSuccess={handleSuccess}
            />
          ))}
        {activeTab === "step2" &&
          (isMentor ? (
            <MentorStep2Form
              initialData={profile as MentorEditProfile}
              onSuccess={handleSuccess}
            />
          ) : (
            <EntrepreneurStep2Form
              initialData={profile as EntrepreneurEditProfile}
              onSuccess={handleSuccess}
            />
          ))}
        {activeTab === "step3" &&
          (isMentor ? (
            <MentorStep3Form
              initialData={profile as MentorEditProfile}
              onSuccess={handleSuccess}
            />
          ) : (
            <EntrepreneurStep3Form
              initialData={profile as EntrepreneurEditProfile}
              onSuccess={handleSuccess}
            />
          ))}
      </div>
    </div>
  );
}