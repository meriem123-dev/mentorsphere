import prisma from "../lib/prisma";
import { uploadToCloudinary } from "../utils/cloudinary";

interface CompleteEntrepreneurProfileInput {
  userId: string;
  bio: string;
  birthDate: Date | null;
  country: string;
  city: string;
  languages: string[];
  domains: string[];
  skills: string[];
  profession: string | null;
  level: string | null;
  lookingFor: string[];
  availability: string[];
  socialLinks: { platform: string; url: string }[];
  avatarColor: string | null;
  photoFile: Express.Multer.File | null;
  cvFile: Express.Multer.File | null;
  documentFiles: Express.Multer.File[];
}

interface CompleteMentorProfileInput {
  userId: string;
  bio: string;
  birthDate: Date | null;
  country: string;
  city: string;
  languages: string[];
  domains: string[];
  skills: string[];
  profession: string;
  yearsOfExperience: string;
  availability: string[];
  socialLinks: { platform: string; url: string }[];
  avatarColor: string | null;
  photoFile: Express.Multer.File | null;
  cvFile: Express.Multer.File | null;
  documentFiles: Express.Multer.File[];
}

export class ProfileService {
  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { profileCompleted: true },
    });
  }
  static async completeEntrepreneurProfile(
    input: CompleteEntrepreneurProfileInput,
  ) {
    const photoUrl = input.photoFile
      ? await uploadToCloudinary(input.photoFile, "profiles")
      : undefined;

    const languageIds = await resolveLanguageIds(input.languages);
    const skillIds = await resolveSkillIds(input.skills);
    const domainIds = await resolveDomainIds(input.domains);

    return prisma.$transaction(
      async (tx) => {
        const user = await tx.user.update({
          where: { id: input.userId },
          data: {
            bio: input.bio,
            birthDate: input.birthDate,
            country: input.country,
            city: input.city,
            profileCompleted: true,
            ...(photoUrl
              ? { profilePicture: photoUrl, coverPicture: null }
              : {}),
            ...(!photoUrl && input.avatarColor
              ? { coverPicture: input.avatarColor }
              : {}),
          },
        });
        await tx.userLanguage.deleteMany({ where: { userId: input.userId } });
        await tx.userLanguage.createMany({
          data: languageIds.map((languageId) => ({
            userId: input.userId,
            languageId,
          })),
        });

        await tx.userSkill.deleteMany({ where: { userId: input.userId } });
        await tx.userSkill.createMany({
          data: skillIds.map((skillId) => ({ userId: input.userId, skillId })),
        });

        const entrepreneur = await tx.entrepreneur.upsert({
          where: { userId: input.userId },
          create: { userId: input.userId },
          update: {},
        });

        await tx.entrepreneurDomain.deleteMany({
          where: { entrepreneurId: entrepreneur.id },
        });
        await tx.entrepreneurDomain.createMany({
          data: domainIds.map((domainId) => ({
            entrepreneurId: entrepreneur.id,
            domainId,
          })),
        });

        return user;
      },
      { timeout: 15000, maxWait: 5000 },
    );
  }

  static async completeMentorProfile(input: CompleteMentorProfileInput) {
    const photoUrl = input.photoFile
      ? await uploadToCloudinary(input.photoFile, "profiles")
      : undefined;
    const cvUrl = input.cvFile
      ? await uploadToCloudinary(input.cvFile, "cv")
      : undefined;
    const documentUrls = input.documentFiles.length
      ? await Promise.all(
          input.documentFiles.map((f) => uploadToCloudinary(f, "documents")),
        )
      : [];

    const languageIds = await resolveLanguageIds(input.languages);
    const skillIds = await resolveSkillIds(input.skills);
    const domainIds = await resolveDomainIds(input.domains);

    return prisma.$transaction(
      async (tx) => {
        const user = await tx.user.update({
          where: { id: input.userId },
          data: {
            bio: input.bio,
            birthDate: input.birthDate,
            country: input.country,
            city: input.city,
            profileCompleted: true,
            ...(photoUrl
              ? { profilePicture: photoUrl, coverPicture: null }
              : {}),
            ...(!photoUrl && input.avatarColor
              ? { coverPicture: input.avatarColor }
              : {}),
          },
        });

        await tx.userLanguage.deleteMany({ where: { userId: input.userId } });
        await tx.userLanguage.createMany({
          data: languageIds.map((languageId) => ({
            userId: input.userId,
            languageId,
          })),
        });

        await tx.userSkill.deleteMany({ where: { userId: input.userId } });
        await tx.userSkill.createMany({
          data: skillIds.map((skillId) => ({ userId: input.userId, skillId })),
        });

        const mentor = await tx.mentor.upsert({
          where: { userId: input.userId },
          create: {
            userId: input.userId,
            profession: input.profession,
            yearsOfExperience: input.yearsOfExperience,
          },
          update: {
            profession: input.profession,
            yearsOfExperience: input.yearsOfExperience,
          },
        });

        await tx.mentorDomain.deleteMany({ where: { mentorId: mentor.id } });
        await tx.mentorDomain.createMany({
          data: domainIds.map((domainId) => ({
            mentorId: mentor.id,
            domainId,
          })),
        });

        if (input.availability.length > 0) {
          await tx.availability.deleteMany({ where: { userId: input.userId } });
          await tx.availability.createMany({
            data: input.availability.map((slot) => ({
              userId: input.userId,
              slot,
            })),
          });
        }

        if (input.socialLinks.length > 0) {
          await tx.socialLink.deleteMany({ where: { userId: input.userId } });
          await tx.socialLink.createMany({
            data: input.socialLinks.map((link) => ({
              userId: input.userId,
              platform: link.platform as any,
              url: link.url,
            })),
          });
        }

        if (cvUrl) {
          await tx.cV.upsert({
            where: { userId: input.userId },
            create: {
              userId: input.userId,
              fileName: input.cvFile!.originalname,
              fileUrl: cvUrl,
            },
            update: {
              fileName: input.cvFile!.originalname,
              fileUrl: cvUrl,
            },
          });
        }

        if (input.documentFiles.length > 0) {
          const documentsData = input.documentFiles.map((file, i) => ({
            userId: input.userId,
            title: file.originalname,
            type: file.mimetype,
            fileName: file.originalname,
            fileUrl: documentUrls[i]!,
          }));

          await tx.document.createMany({ data: documentsData });
        }

        return user;
      },
      { timeout: 15000, maxWait: 5000 },
    );
  }
}

//résout des noms de langues en ids, créant celles qui n'existent pas encore
async function resolveLanguageIds(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const lang = await prisma.language.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(lang.id);
  }
  return ids;
}

async function resolveSkillIds(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const skill = await prisma.skill.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(skill.id);
  }
  return ids;
}

async function resolveDomainIds(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const domain = await prisma.domain.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(domain.id);
  }
  return ids;
}
