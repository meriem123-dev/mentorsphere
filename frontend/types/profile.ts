export type SocialPlatform = "LINKEDIN" | "GITHUB" | "WEBSITE";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

interface EditProfileDomain {
  domain: { id: string; name: string };
}

interface EditProfileLanguage {
  language: { id: string; name: string };
}

interface EditProfileSkill {
  skill: { id: string; name: string };
}

interface EditProfileSocialLink {
  id: string;
  platform: string;
  url: string;
}

interface EditProfileAvailability {
  id: string;
  slot: string;
}

interface EditProfileFile {
  id: string;
  fileName: string;
  fileUrl: string;
}

interface EditProfileUserBase {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  coverPicture: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  birthDate: string | null;
  languages: EditProfileLanguage[];
  skills: EditProfileSkill[];
  socialLinks: EditProfileSocialLink[];
  availabilities: EditProfileAvailability[];
  cv: EditProfileFile | null;
}

export interface EntrepreneurEditProfile {
  id: string;
  profession: string | null;
  level: string | null;
  lookingFor: string[];
  domains: EditProfileDomain[];
  user: EditProfileUserBase & {
    documents: EditProfileFile[];
  };
}

export interface MentorEditProfile {
  id: string;
  profession: string | null;
  yearsOfExperience: string | null;
  domains: EditProfileDomain[];
  user: EditProfileUserBase;
}