import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Translation, InsertTranslation } from "@shared/schema";

interface TranslateTextParams {
  text: string;
  fromLang: "en" | "fr";
  toLang: "en" | "fr";
}

interface ToggleFavoriteParams {
  id: number;
  favorite: boolean;
}

export function useTranslation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: async ({ text, fromLang, toLang }: TranslateTextParams) => {
      const res = await apiRequest("POST", "/api/translate", { text, fromLang, toLang });
      return await res.json() as Translation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ id, favorite }: ToggleFavoriteParams) => {
      const res = await apiRequest("PATCH", `/api/translations/${id}/favorite`, { favorite });
      return await res.json() as Translation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
      toast({
        title: "Success",
        description: "Translation saved to favorites",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save favorite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: translations = [], isLoading: isLoadingTranslations } = useQuery<Translation[]>({
    queryKey: ["/api/translations"],
  });

  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery<Translation[]>({
    queryKey: ["/api/translations/favorites"],
  });

  const commonPhrases = [
    { text: "How are you doing today?", fromLang: "en", toLang: "fr" },
    { text: "I love learning languages", fromLang: "en", toLang: "fr" },
    { text: "Can we meet tomorrow?", fromLang: "en", toLang: "fr" },
    { text: "Thank you for your help", fromLang: "en", toLang: "fr" },
    { text: "Comment allez-vous?", fromLang: "fr", toLang: "en" },
    { text: "J'adore apprendre des langues", fromLang: "fr", toLang: "en" },
    { text: "Pouvons-nous nous rencontrer demain?", fromLang: "fr", toLang: "en" },
    { text: "Merci pour votre aide", fromLang: "fr", toLang: "en" },
  ];

  return {
    translateMutation,
    favoriteMutation,
    translations,
    favorites,
    isLoadingTranslations,
    isLoadingFavorites,
    commonPhrases,
  };
}
