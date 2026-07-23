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

interface UpdateEntrepreneurProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  birthDate?: Date | null;
  country?: string;
  city?: string;
  languages?: string[];
  domains?: string[];
  skills?: string[];
  profession?: string | null;
  level?: string | null;
  lookingFor?: string[];
  availability?: string[];
  socialLinks?: { platform: string; url: string }[];
  avatarColor?: string | null;
  photoFile?: Express.Multer.File;
  cvFile?: Express.Multer.File;
  documentFiles?: Express.Multer.File[];
  removeCv?: boolean;
  removeDocumentIds?: string[];
  removePhoto?: boolean;
}

interface UpdateMentorProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  birthDate?: Date | null;
  country?: string;
  city?: string;
  languages?: string[];
  domains?: string[];
  skills?: string[];
  profession?: string;
  yearsOfExperience?: string;
  availability?: string[];
  socialLinks?: { platform: string; url: string }[];
  avatarColor?: string | null;
  photoFile?: Express.Multer.File;
  cvFile?: Express.Multer.File;
  documentFiles?: Express.Multer.File[];
  removePhoto?: boolean;
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

        const entrepreneur = await tx.entrepreneur.upsert({
          where: { userId: input.userId },
          create: {
            userId: input.userId,
            profession: input.profession,
            level: input.level,
            lookingFor: input.lookingFor,
          },
          update: {
            profession: input.profession,
            level: input.level,
            lookingFor: input.lookingFor,
          },
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

  //modif entrepreneur profile
  static async updateEntrepreneurProfile(
    input: UpdateEntrepreneurProfileInput,
  ) {
    const photoUrl = input.photoFile
      ? await uploadToCloudinary(input.photoFile, "profiles")
      : undefined;
    const cvUrl = input.cvFile
      ? await uploadToCloudinary(input.cvFile, "cv")
      : undefined;

    const languageIds = input.languages
      ? await resolveLanguageIds(input.languages)
      : undefined;
    const skillIds = input.skills
      ? await resolveSkillIds(input.skills)
      : undefined;
    const domainIds = input.domains
      ? await resolveDomainIds(input.domains)
      : undefined;

    return prisma.$transaction(
      async (tx) => {
        const user = await tx.user.update({
          where: { id: input.userId },
          data: {
            ...(input.firstName !== undefined
              ? { firstName: input.firstName }
              : {}),
            ...(input.lastName !== undefined
              ? { lastName: input.lastName }
              : {}),
            ...(input.bio !== undefined ? { bio: input.bio } : {}),
            ...(input.birthDate !== undefined
              ? { birthDate: input.birthDate }
              : {}),
            ...(input.country !== undefined ? { country: input.country } : {}),
            ...(input.city !== undefined ? { city: input.city } : {}),
            ...(photoUrl
              ? { profilePicture: photoUrl, coverPicture: null }
              : {}),
            ...(!photoUrl && input.removePhoto ? { profilePicture: null } : {}),
            ...(!photoUrl && input.avatarColor !== undefined
              ? { coverPicture: input.avatarColor }
              : {}),
          },
        });
        if (languageIds) {
          await tx.userLanguage.deleteMany({ where: { userId: input.userId } });
          await tx.userLanguage.createMany({
            data: languageIds.map((languageId) => ({
              userId: input.userId,
              languageId,
            })),
          });
        }

        if (skillIds) {
          await tx.userSkill.deleteMany({ where: { userId: input.userId } });
          await tx.userSkill.createMany({
            data: skillIds.map((skillId) => ({
              userId: input.userId,
              skillId,
            })),
          });
        }

        if (domainIds) {
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
        }

        // --- CV : remplacement ---
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

        // --- CV : suppression (uniquement si aucun nouveau CV n'est envoyé) ---
        if (input.removeCv && !cvUrl) {
          await tx.cV.deleteMany({ where: { userId: input.userId } });
        }

        // --- Documents : ajout ---
        if (input.documentFiles?.length) {
          const documentUrls = await Promise.all(
            input.documentFiles.map((f) => uploadToCloudinary(f, "documents")),
          );
          const documentsData = input.documentFiles.map((file, i) => ({
            userId: input.userId,
            title: file.originalname,
            type: file.mimetype,
            fileName: file.originalname,
            fileUrl: documentUrls[i]!,
          }));
          await tx.document.createMany({ data: documentsData });
        }

        // --- Documents : suppression ---
        if (input.removeDocumentIds?.length) {
          await tx.document.deleteMany({
            where: {
              id: { in: input.removeDocumentIds },
              userId: input.userId, // évite de supprimer le document d'un autre user
            },
          });
        }

        return user;
      },
      { timeout: 15000, maxWait: 5000 },
    );
  }

  //modif mentor profile
  static async updateMentorProfile(input: UpdateMentorProfileInput) {
    const photoUrl = input.photoFile
      ? await uploadToCloudinary(input.photoFile, "profiles")
      : undefined;
    const cvUrl = input.cvFile
      ? await uploadToCloudinary(input.cvFile, "cv")
      : undefined;

    const languageIds = input.languages
      ? await resolveLanguageIds(input.languages)
      : undefined;
    const skillIds = input.skills
      ? await resolveSkillIds(input.skills)
      : undefined;
    const domainIds = input.domains
      ? await resolveDomainIds(input.domains)
      : undefined;

    return prisma.$transaction(
      async (tx) => {
        const user = await tx.user.update({
          where: { id: input.userId },
          data: {
            ...(input.firstName !== undefined
              ? { firstName: input.firstName }
              : {}),
            ...(input.lastName !== undefined
              ? { lastName: input.lastName }
              : {}),
            ...(input.bio !== undefined ? { bio: input.bio } : {}),
            ...(input.birthDate !== undefined
              ? { birthDate: input.birthDate }
              : {}),
            ...(input.country !== undefined ? { country: input.country } : {}),
            ...(input.city !== undefined ? { city: input.city } : {}),
            ...(photoUrl
              ? { profilePicture: photoUrl, coverPicture: null }
              : {}),
            ...(!photoUrl && input.removePhoto ? { profilePicture: null } : {}),
            ...(!photoUrl && input.avatarColor !== undefined
              ? { coverPicture: input.avatarColor }
              : {}),
          },
        });

        if (languageIds) {
          await tx.userLanguage.deleteMany({ where: { userId: input.userId } });
          await tx.userLanguage.createMany({
            data: languageIds.map((languageId) => ({
              userId: input.userId,
              languageId,
            })),
          });
        }

        if (skillIds) {
          await tx.userSkill.deleteMany({ where: { userId: input.userId } });
          await tx.userSkill.createMany({
            data: skillIds.map((skillId) => ({
              userId: input.userId,
              skillId,
            })),
          });
        }

        if (
          input.profession !== undefined ||
          input.yearsOfExperience !== undefined ||
          domainIds
        ) {
          const mentor = await tx.mentor.upsert({
            where: { userId: input.userId },
            create: {
              userId: input.userId,
              profession: input.profession ?? "",
              yearsOfExperience: input.yearsOfExperience ?? "",
            },
            update: {
              ...(input.profession !== undefined
                ? { profession: input.profession }
                : {}),
              ...(input.yearsOfExperience !== undefined
                ? { yearsOfExperience: input.yearsOfExperience }
                : {}),
            },
          });

          if (domainIds) {
            await tx.mentorDomain.deleteMany({
              where: { mentorId: mentor.id },
            });
            await tx.mentorDomain.createMany({
              data: domainIds.map((domainId) => ({
                mentorId: mentor.id,
                domainId,
              })),
            });
          }
        }

        if (input.availability) {
          await tx.availability.deleteMany({ where: { userId: input.userId } });
          await tx.availability.createMany({
            data: input.availability.map((slot) => ({
              userId: input.userId,
              slot,
            })),
          });
        }

        if (input.socialLinks) {
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

        if (input.documentFiles?.length) {
          const documentUrls = await Promise.all(
            input.documentFiles.map((f) => uploadToCloudinary(f, "documents")),
          );
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

  //recup toutes les infos
  static async getFullEntrepreneurProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        coverPicture: true,
        city: true,
        country: true,
        bio: true,
        birthDate: true,
        languages: {
          select: { language: { select: { id: true, name: true } } },
        },
        skills: { select: { skill: { select: { id: true, name: true } } } },
        socialLinks: { select: { id: true, platform: true, url: true } },
        availabilities: { select: { id: true, slot: true } },
        cv: { select: { id: true, fileName: true, fileUrl: true } },
        documents: { select: { id: true, fileName: true, fileUrl: true } },
        entrepreneur: {
          select: {
            id: true,
            profession: true,
            level: true,
            lookingFor: true,
            domains: {
              select: { domain: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!user || !user.entrepreneur) return null;

    const { entrepreneur, ...userFields } = user;

    return {
      id: entrepreneur.id,
      profession: entrepreneur.profession,
      level: entrepreneur.level,
      lookingFor: entrepreneur.lookingFor,
      domains: entrepreneur.domains,
      user: userFields,
    };
  }

  static async getFullMentorProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        coverPicture: true,
        city: true,
        country: true,
        bio: true,
        birthDate: true,
        languages: {
          select: { language: { select: { id: true, name: true } } },
        },
        skills: { select: { skill: { select: { id: true, name: true } } } },
        socialLinks: { select: { id: true, platform: true, url: true } },
        availabilities: { select: { id: true, slot: true } },
        cv: { select: { id: true, fileName: true, fileUrl: true } },
        mentor: {
          select: {
            id: true,
            profession: true,
            yearsOfExperience: true,
            domains: {
              select: { domain: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!user || !user.mentor) return null;

    const { mentor, ...userFields } = user;

    return {
      id: mentor.id,
      profession: mentor.profession,
      yearsOfExperience: mentor.yearsOfExperience,
      domains: mentor.domains,
      user: userFields,
    };
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
