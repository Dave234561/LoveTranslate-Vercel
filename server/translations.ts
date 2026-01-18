import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { InsertTranslation } from "@shared/schema";
import { z } from "zod";

export function setupTranslations(app: Express) {
  // Schema for translation requests
  const translateSchema = z.object({
    text: z.string().min(1).max(500),
    fromLang: z.enum(["en", "fr"]),
    toLang: z.enum(["en", "fr"]),
  });

  // Endpoint to translate text
  app.post("/api/translate", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, fromLang, toLang } = translateSchema.parse(req.body);
      let userId: number | undefined = req.user?.id;

      // For testing purposes, if not logged in, use test user
      if (!userId) {
        if (!req.isAuthenticated()) {
          const testUser = await storage.getUserByUsername("test");
          if (testUser) {
            userId = testUser.id;
          } else {
            return res.status(401).json({ message: "Unauthorized" });
          }
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      // Translate the text (in a real app, you would use a translation API)
      let translatedText = "";
      
      // Simple mock translation for demonstration
      if (fromLang === "en" && toLang === "fr") {
        // English to French
        translatedText = mockTranslateEnToFr(text);
      } else if (fromLang === "fr" && toLang === "en") {
        // French to English
        translatedText = mockTranslateFrToEn(text);
      } else {
        translatedText = text; // Same language, no translation
      }

      // Save the translation to storage
      const translation: InsertTranslation = {
        userId,
        sourceText: text,
        translatedText,
        fromLang,
        toLang,
        favorite: false,
      };

      const savedTranslation = await storage.createTranslation(translation);
      res.status(200).json(savedTranslation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Get all translations for the current user
  app.get("/api/translations", async (req: Request, res: Response) => {
    // For testing purposes, if not logged in, get test user's translations 
    if (!req.isAuthenticated()) {
      const testUser = await storage.getUserByUsername("test");
      if (testUser) {
        const translations = await storage.getTranslations(testUser.id);
        return res.status(200).json(translations);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const translations = await storage.getTranslations(userId);
    res.status(200).json(translations);
  });

  // Get favorite translations for the current user
  app.get("/api/translations/favorites", async (req: Request, res: Response) => {
    // For testing purposes, if not logged in, get test user's favorites
    if (!req.isAuthenticated()) {
      const testUser = await storage.getUserByUsername("test");
      if (testUser) {
        const favorites = await storage.getFavoriteTranslations(testUser.id);
        return res.status(200).json(favorites);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const favorites = await storage.getFavoriteTranslations(userId);
    res.status(200).json(favorites);
  });

  // Toggle favorite status of a translation
  app.patch("/api/translations/:id/favorite", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const translationId = parseInt(req.params.id);
      let userId: number | undefined = req.user?.id;
      const { favorite } = req.body;

      // For testing purposes, if not logged in, use test user
      if (!userId) {
        if (!req.isAuthenticated()) {
          const testUser = await storage.getUserByUsername("test");
          if (testUser) {
            userId = testUser.id;
          } else {
            return res.status(401).json({ message: "Unauthorized" });
          }
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      const translation = await storage.getTranslation(translationId);
      
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }

      if (translation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedTranslation = await storage.updateTranslation(translationId, { favorite });
      res.status(200).json(updatedTranslation);
    } catch (error) {
      next(error);
    }
  });
}

// Mock translation functions for demo purposes
function mockTranslateEnToFr(text: string): string {
  const translations: Record<string, string> = {
    "Hello, how are you?": "Bonjour, comment allez-vous?",
    "hello, how are you?": "Bonjour, comment allez-vous?",
    "hello how are you": "Bonjour, comment allez-vous?",
    "hello": "bonjour",
    "how are you": "comment allez-vous",
    "good morning": "bonjour",
    "good evening": "bonsoir",
    "thank you": "merci",
    "goodbye": "au revoir",
    "please": "s'il vous plaît",
    "yes": "oui",
    "no": "non",
    "excuse me": "excusez-moi",
    "i love you": "je t'aime",
    "how are you doing today": "comment allez-vous aujourd'hui",
    "i love learning languages": "j'adore apprendre des langues",
    "can we meet tomorrow": "pouvons-nous nous rencontrer demain",
    "thank you for your help": "merci pour votre aide",
    "what is your name": "comment vous appelez-vous",
    "my name is": "je m'appelle",
    "nice to meet you": "enchanté de faire votre connaissance",
    "how's the weather": "quel temps fait-il",
    "i'm sorry": "je suis désolé",
    "where are you from": "d'où venez-vous",
    "i'm from": "je viens de",
    "i don't understand": "je ne comprends pas",
    "could you repeat that": "pourriez-vous répéter cela",
    "i need help": "j'ai besoin d'aide",
    "what time is it": "quelle heure est-il",
    "where is the bathroom": "où sont les toilettes",
    "how much does it cost": "combien ça coûte",
    "i speak a little french": "je parle un peu français",
    "do you speak english": "parlez-vous anglais"
  };

  const textWithoutPunctuation = text.replace(/[.,?!;:]/g, '').trim();
  if (translations[text]) return translations[text];
  const lowerText = textWithoutPunctuation.toLowerCase();
  if (translations[lowerText]) return translations[lowerText];

  const words = lowerText.split(/\s+/);
  let translatedWords = [];
  let translatedAny = false;

  for (const word of words) {
    if (translations[word]) {
      translatedWords.push(translations[word]);
      translatedAny = true;
    } else {
      translatedWords.push(word);
    }
  }

  if (translatedAny) return translatedWords.join(' ');
  if (lowerText.includes('hello') && lowerText.includes('how are you')) return "Bonjour, comment allez-vous?";

  return text
    .replace(/th/g, "z")
    .replace(/w/g, "v")
    .replace(/tion/g, "sion")
    .replace(/ing/g, "ant")
    .replace(/h/g, "")
    .replace(/u/g, "ou") + " 🇫🇷";
}

function mockTranslateFrToEn(text: string): string {
  const translations: Record<string, string> = {
    "Bonjour, comment allez-vous?": "Hello, how are you?",
    "bonjour, comment allez-vous?": "Hello, how are you?",
    "bonjour comment allez-vous": "Hello, how are you?",
    "bonjour": "hello",
    "comment allez-vous": "how are you",
    "bonsoir": "good evening",
    "merci": "thank you",
    "au revoir": "goodbye",
    "s'il vous plaît": "please",
    "oui": "yes",
    "non": "no",
    "excusez-moi": "excuse me",
    "je t'aime": "i love you",
    "comment allez-vous aujourd'hui": "how are you doing today",
    "j'adore apprendre des langues": "i love learning languages",
    "pouvons-nous nous rencontrer demain": "can we meet tomorrow",
    "merci pour votre aide": "thank you for your help",
    "comment vous appelez-vous": "what is your name",
    "je m'appelle": "my name is",
    "enchanté de faire votre connaissance": "nice to meet you",
    "quel temps fait-il": "how's the weather",
    "je suis désolé": "i'm sorry",
    "d'où venez-vous": "where are you from",
    "je viens de": "i'm from",
    "je ne comprends pas": "i don't understand",
    "pourriez-vous répéter cela": "could you repeat that",
    "j'ai besoin d'aide": "i need help",
    "quelle heure est-il": "what time is it",
    "où sont les toilettes": "where is the bathroom",
    "combien ça coûte": "how much does it cost",
    "je parle un peu français": "i speak a little french",
    "parlez-vous anglais": "do you speak english"
  };

  const textWithoutPunctuation = text.replace(/[.,?!;:]/g, '').trim();
  if (translations[text]) return translations[text];
  const lowerText = textWithoutPunctuation.toLowerCase();
  if (translations[lowerText]) return translations[lowerText];

  const words = lowerText.split(/\s+/);
  let translatedWords = [];
  let translatedAny = false;

  for (const word of words) {
    if (translations[word]) {
      translatedWords.push(translations[word]);
      translatedAny = true;
    } else {
      translatedWords.push(word);
    }
  }

  if (translatedAny) return translatedWords.join(' ');
  if (lowerText.includes('bonjour') && lowerText.includes('comment allez')) return "Hello, how are you?";

  return text
    .replace(/ou/g, "u")
    .replace(/eau/g, "o")
    .replace(/ez/g, "e")
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/ê/g, "e")
    .replace(/à/g, "a")
    .replace(/ç/g, "c") + " 🇬🇧";
}
