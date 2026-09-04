import  prisma  from "../lib/prisma";
import { Prisma, type PostTag } from "@prisma/client";

const PAGE_SIZE = 10;

interface CreatePostInput {
  content: string;
  tag?: PostTag;
}

const postInclude = {
  author: {
    include: {
      mentor: { select: { profession: true } },
      entrepreneur: { select: { profession: true } },
    },
  },
  _count: { select: { comments: true, likes: true, saves: true } },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

//hepler mappage
function mapPostToDTO(
  post: PostWithRelations,
  likedPostIds: Set<string>,
  savedPostIds: Set<string>
) {
  const profession =
    post.author.mentor?.profession ?? post.author.entrepreneur?.profession ?? null;

  return {
    id: post.id,
    content: post.content,
    tag: post.tag,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      company: profession,
      avatarUrl: post.author.profilePicture,
      avatarColor: post.author.coverPicture,
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    savesCount: post._count.saves,
    isLikedByMe: likedPostIds.has(post.id),
    isSavedByMe: savedPostIds.has(post.id),
  };
}

//métier recup posts
export async function listPosts(userId: string, cursor?: string) {
  const posts = await prisma.post.findMany({
    take: PAGE_SIZE + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  const hasMore = posts.length > PAGE_SIZE;
  const pagePosts = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
  const postIds = pagePosts.map((p) => p.id);

  const [likes, saves] = await Promise.all([
    prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
    prisma.postSave.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedPostIds = new Set(likes.map((l) => l.postId));
  const savedPostIds = new Set(saves.map((s) => s.postId));

  const lastPost: (typeof pagePosts)[number] | undefined = pagePosts[pagePosts.length - 1];

  return {
    posts: pagePosts.map((post) => mapPostToDTO(post, likedPostIds, savedPostIds)),
    nextCursor: hasMore && lastPost ? lastPost.id : null,
  };
}

//métier création
export async function createPost(userId: string, input: CreatePostInput) {
  const post = await prisma.post.create({
    data: {
      content: input.content,
      authorId: userId,
      ...(input.tag !== undefined && { tag: input.tag }),
    },
    include: postInclude,
  });

  return mapPostToDTO(post, new Set(), new Set());
}

//métier liker
export async function toggleLike(postId: string, userId: string) {
  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
  }

  const likesCount = await prisma.postLike.count({ where: { postId } });

  return { liked: !existing, likesCount };
}

export async function toggleSave(postId: string, userId: string) {
  const existing = await prisma.postSave.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.postSave.delete({ where: { id: existing.id } });
  } else {
    await prisma.postSave.create({ data: { postId, userId } });
  }

  const savesCount = await prisma.postSave.count({ where: { postId } });

  return { saved: !existing, savesCount };
}

const commentInclude = {
  author: {
    include: {
      mentor: { select: { profession: true } },
      entrepreneur: { select: { profession: true } },
    },
  },
} satisfies Prisma.PostCommentInclude;

type CommentWithRelations = Prisma.PostCommentGetPayload<{ include: typeof commentInclude }>;

interface CommentAuthorDTO {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
}

interface CommentDTO {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  author: CommentAuthorDTO;
  replies: CommentDTO[];
}

//helper
function mapCommentToDTO(comment: CommentWithRelations, replies: CommentDTO[] = []): CommentDTO {
  const profession =
    comment.author.mentor?.profession ?? comment.author.entrepreneur?.profession ?? null;

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    parentId: comment.parentId,
    author: {
      id: comment.author.id,
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      company: profession,
      avatarUrl: comment.author.profilePicture,
      avatarColor: comment.author.coverPicture,
    },
    replies,
  };
}

//métier recup comments
export async function listComments(postId: string): Promise<CommentDTO[]> {
  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: commentInclude,
  });

  const dtoById = new Map<string, CommentDTO>();
  for (const comment of comments) {
    dtoById.set(comment.id, mapCommentToDTO(comment));
  }

  const topLevel: CommentDTO[] = [];

  for (const comment of comments) {
    const dto = dtoById.get(comment.id)!;

    if (comment.parentId) {
      const parentDto = dtoById.get(comment.parentId);
      if (parentDto) {
        parentDto.replies.push(dto);
      } else {
        topLevel.push(dto);
      }
    } else {
      topLevel.push(dto);
    }
  }

  return topLevel;
}

//métier commnenter
export async function createComment(
  postId: string,
  userId: string,
  content: string,
  parentId?: string
) {
  let effectiveParentId: string | undefined = parentId;

  if (parentId) {
    const parentComment = await prisma.postComment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true, parentId: true },
    });

    if (!parentComment || parentComment.postId !== postId) {
      throw new Error("PARENT_COMMENT_NOT_FOUND");
    }

    // Aplatit à un seul niveau : répondre à une réponse l'attache au commentaire racine
    effectiveParentId = parentComment.parentId ?? parentComment.id;
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      authorId: userId,
      content,
      ...(effectiveParentId !== undefined && { parentId: effectiveParentId }),
    },
    include: commentInclude,
  });

  return mapCommentToDTO(comment);
}