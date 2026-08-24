import type { Request, Response } from "express";
import { PostTag } from "@prisma/client";
import * as communityService from "../services/communityService";

const MAX_CONTENT_LENGTH = 2000;
const VALID_TAGS = Object.values(PostTag);

export async function listPostsHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    const result = await communityService.listPosts(userId, cursor);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listPostsHandler:", error);
    return res.status(500).json({ message: "Erreur lors du chargement du feed" });
  }
}

export async function createPostHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { content, tag } = req.body as { content?: string; tag?: string };

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Le contenu du post est requis" });
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return res
        .status(400)
        .json({ message: `Le contenu ne peut pas dépasser ${MAX_CONTENT_LENGTH} caractères` });
    }

    if (tag !== undefined && !VALID_TAGS.includes(tag as PostTag)) {
      return res.status(400).json({ message: "Tag invalide" });
    }

    const post = await communityService.createPost(userId, {
      content: content.trim(),
      ...(tag !== undefined && { tag: tag as PostTag }),
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error("Erreur createPostHandler:", error);
    return res.status(500).json({ message: "Erreur lors de la publication du post" });
  }
}

export async function toggleLikeHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;

    if (!postId) {
      return res.status(400).json({ message: "postId manquant" });
    }

    const result = await communityService.toggleLike(postId, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur toggleLikeHandler:", error);
    return res.status(500).json({ message: "Impossible de liker le post" });
  }
}

export async function toggleSaveHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;

    if (!postId) {
      return res.status(400).json({ message: "postId manquant" });
    }

    const result = await communityService.toggleSave(postId, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur toggleSaveHandler:", error);
    return res.status(500).json({ message: "Erreur lors du save" });
  }
}

const MAX_COMMENT_LENGTH = 1000;

export async function listCommentsHandler(req: Request, res: Response) {
  try {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;

    if (!postId) {
      return res.status(400).json({ message: "postId manquant" });
    }

    const comments = await communityService.listComments(postId);
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Erreur listCommentsHandler:", error);
    return res.status(500).json({ message: "Erreur lors du chargement des commentaires" });
  }
}

export async function createCommentHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const { content } = req.body as { content?: string };

    if (!postId) {
      return res.status(400).json({ message: "postId manquant" });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Le contenu du commentaire est requis" });
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return res
        .status(400)
        .json({ message: `Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères` });
    }

    const comment = await communityService.createComment(postId, userId, content.trim());
    return res.status(201).json(comment);
  } catch (error) {
    console.error("Erreur createCommentHandler:", error);
    return res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" });
  }
}