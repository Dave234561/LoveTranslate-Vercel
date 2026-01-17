import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { InsertMessage, InsertConversation } from "@shared/schema";
import { z } from "zod";

// Simple middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export function setupMessages(app: Express) {
  // Get all conversations for the current user
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const conversations = await storage.getConversations(userId);
    res.status(200).json(conversations);
  });

  // Create a new conversation
  app.post("/api/conversations", isAuthenticated, async (req, res, next) => {
    try {
      const createConversationSchema = z.object({
        participantId: z.number().int().positive(),
      });

      const { participantId } = createConversationSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if the user exists
      const participant = await storage.getUser(participantId);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }

      // Check if a conversation already exists between these users
      const existingConversations = await storage.getConversations(userId);
      const existingConversation = existingConversations.find(
        (c) => (c.userId === userId && c.participantId === participantId) ||
              (c.userId === participantId && c.participantId === userId)
      );

      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }

      // Create a new conversation
      const conversation: InsertConversation = {
        userId,
        participantId,
      };

      const newConversation = await storage.createConversation(conversation);
      res.status(201).json(newConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Get messages for a specific conversation
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the user is part of this conversation
    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.userId !== userId && conversation.participantId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await storage.getMessages(conversationId);
    res.status(200).json(messages);
  });

  // Send a message in a conversation
  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res, next) => {
    try {
      const sendMessageSchema = z.object({
        text: z.string().min(1).max(1000),
      });

      const { text } = sendMessageSchema.parse(req.body);
      const conversationId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify the user is part of this conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation.userId !== userId && conversation.participantId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Create and save the message
      const message: InsertMessage = {
        conversationId,
        senderId: userId,
        text,
      };

      const newMessage = await storage.createMessage(message);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Mark all messages in a conversation as read
  app.post("/api/conversations/:id/read", isAuthenticated, async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the user is part of this conversation
    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.userId !== userId && conversation.participantId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.markMessagesAsRead(conversationId, userId);
    res.status(200).json({ success: true });
  });
}
