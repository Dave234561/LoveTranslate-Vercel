import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Heart, Languages, Loader2, ArrowLeftRight, Star, StarOff, History, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";

const MAX_CHARS = 500;

// Translation history item type
interface TranslationHistoryItem {
  id: number;
  sourceText: string;
  translatedText: string;
  fromLang: "en" | "fr";
  toLang: "en" | "fr";
  timestamp: Date;
}

// Common phrases for each language direction
const COMMON_PHRASES = {
  "en-fr": [
    { text: "Hello, how are you?", translation: "Bonjour, comment allez-vous?" },
    { text: "I love you", translation: "Je t'aime" },
    { text: "Thank you very much", translation: "Merci beaucoup" },
    { text: "What is your name?", translation: "Comment vous appelez-vous?" },
    { text: "I'm learning French", translation: "J'apprends le français" },
    { text: "Where are you from?", translation: "D'où venez-vous?" }
  ],
  "fr-en": [
    { text: "Bonjour, comment ça va?", translation: "Hello, how are you?" },
    { text: "Je t'aime", translation: "I love you" },
    { text: "Merci beaucoup", translation: "Thank you very much" },
    { text: "Comment tu t'appelles?", translation: "What is your name?" },
    { text: "J'apprends l'anglais", translation: "I'm learning English" },
    { text: "D'où viens-tu?", translation: "Where are you from?" }
  ]
};

// Translation history item type
interface TranslationHistoryItem {
  id: number;
  sourceText: string;
  translatedText: string;
  fromLang: "en" | "fr";
  toLang: "en" | "fr";
  timestamp: Date;
}

export default function TranslationTab() {
  const [sourceText, setSourceText] = useState("");
  const [direction, setDirection] = useState<{fromLang: "en" | "fr", toLang: "en" | "fr"}>({ fromLang: "en", toLang: "fr" });
  const [translationResult, setTranslationResult] = useState("");
  const [currentTranslationId, setCurrentTranslationId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [showPhraseMeanings, setShowPhraseMeanings] = useState<{[key: number]: boolean}>({});
  const [translationHistory, setTranslationHistory] = useState<TranslationHistoryItem[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const { translateMutation, favoriteMutation } = useTranslation();
  const { toast } = useToast();
  const translationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get common phrases based on current translation direction
  const commonPhrases = direction.fromLang === "en" 
    ? COMMON_PHRASES["en-fr"] 
    : COMMON_PHRASES["fr-en"];

  // Auto-translate after a delay when the user stops typing
  useEffect(() => {
    if (autoTranslate && sourceText.trim()) {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
      
      translationTimerRef.current = setTimeout(() => {
        handleTranslate();
      }, 1000); // Translate after 1 second of inactivity
    }
    
    return () => {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
    };
  }, [sourceText, autoTranslate, direction]);

  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setSourceText(e.target.value);
      if (!autoTranslate) {
        setTranslationResult("");
      }
    }
  };

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast({
        title: "Cannot translate",
        description: "Please enter some text to translate",
        variant: "destructive",
      });
      return;
    }

    translateMutation.mutate(
      {
        text: sourceText,
        fromLang: direction.fromLang,
        toLang: direction.toLang,
      },
      {
        onSuccess: (data) => {
          setTranslationResult(data.translatedText);
          setCurrentTranslationId(data.id);
          setIsFavorite(data.favorite || false);
          
          // Add to history (avoid duplicates by checking if the same text was already translated)
          const historyItem: TranslationHistoryItem = {
            id: data.id,
            sourceText: sourceText,
            translatedText: data.translatedText,
            fromLang: direction.fromLang,
            toLang: direction.toLang,
            timestamp: new Date()
          };
          
          setTranslationHistory(prev => {
            // Check if we already have this translation in history
            const exists = prev.some(item => 
              item.sourceText === historyItem.sourceText && 
              item.fromLang === historyItem.fromLang && 
              item.toLang === historyItem.toLang
            );
            
            // If it exists, don't add it again
            if (exists) return prev;
            
            // Add new item at the beginning and limit to 20 items
            return [historyItem, ...prev].slice(0, 20);
          });
        },
      }
    );
  };
  
  const useHistoryItem = (item: TranslationHistoryItem) => {
    setDirection({
      fromLang: item.fromLang,
      toLang: item.toLang
    });
    setSourceText(item.sourceText);
    setTranslationResult(item.translatedText);
    setCurrentTranslationId(item.id);
    setHistoryDialogOpen(false);
  };

  const handleToggleDirection = () => {
    setDirection(prev => ({
      fromLang: prev.toLang,
      toLang: prev.fromLang
    }));
    setSourceText("");
    setTranslationResult("");
    setCurrentTranslationId(null);
    setIsFavorite(false);
  };

  const handleCopyTranslation = () => {
    if (translationResult) {
      navigator.clipboard.writeText(translationResult);
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard",
      });
    }
  };

  const handleToggleFavorite = () => {
    if (currentTranslationId) {
      const newFavoriteState = !isFavorite;
      
      favoriteMutation.mutate({
        id: currentTranslationId,
        favorite: newFavoriteState
      }, {
        onSuccess: () => {
          setIsFavorite(newFavoriteState);
          toast({
            title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
            description: newFavoriteState 
              ? "This translation has been saved to your favorites" 
              : "This translation has been removed from your favorites",
          });
        }
      });
    }
  };

  const handleUseCommonPhrase = (phrase: string) => {
    setSourceText(phrase);
    if (autoTranslate) {
      // Manually trigger translation immediately for better UX
      translateMutation.mutate(
        {
          text: phrase,
          fromLang: direction.fromLang,
          toLang: direction.toLang,
        },
        {
          onSuccess: (data) => {
            setTranslationResult(data.translatedText);
            setCurrentTranslationId(data.id);
            setIsFavorite(data.favorite || false);
          },
        }
      );
    }
  };

  const togglePhraseMeaning = (index: number) => {
    setShowPhraseMeanings(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <section className="p-4">
      {/* Language Direction Selector */}
      <div className="relative mb-6 rounded-xl overflow-hidden border border-primary/20 shadow-sm love-card">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary/10 to-transparent"></div>
        <div className="flex flex-col p-4 pt-3 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold font-heading flex items-center text-primary">
                <Languages className="mr-2 h-5 w-5 text-primary" />
                Translation
              </h2>
              
              <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-3 h-9 w-9 rounded-full hover:bg-primary/10 text-primary p-0"
                    title="Translation History"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-primary">
                      <History className="mr-2 h-5 w-5" />
                      Translation History
                    </DialogTitle>
                    <DialogDescription>
                      Your recent translations will appear here
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="max-h-[400px] overflow-y-auto mt-4">
                    {translationHistory.length > 0 ? (
                      <div className="grid gap-2">
                        {translationHistory.map((item, index) => (
                          <Card 
                            key={index} 
                            className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all cursor-pointer group love-card"
                            onClick={() => useHistoryItem(item)}
                          >
                            <div className="p-3 hover:bg-primary/5">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-1 line-clamp-1">{item.sourceText}</p>
                                  <p className="text-xs text-gray-500 line-clamp-1">{item.translatedText}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {item.fromLang.toUpperCase()} → {item.toLang.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-gray-400 mt-1">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No translation history yet</p>
                        <p className="text-xs text-gray-400 mt-1">Start translating to see your history</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <DialogClose asChild>
                      <Button className="love-gradient-btn" size="sm">
                        Close
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 border border-primary/20 shadow-sm">
              <Button 
                variant="ghost"
                size="sm"
                className={`rounded-full px-3 py-1 h-8 text-sm transition-all ${
                  direction.fromLang === "en" 
                    ? "text-white love-gradient-btn" 
                    : "text-primary hover:bg-primary/10"
                }`}
                onClick={() => direction.fromLang !== "en" && handleToggleDirection()}
                style={{
                  background: direction.fromLang === "en" 
                    ? 'var(--love-gradient)' 
                    : ''
                }}
              >
                EN → FR
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className={`rounded-full px-3 py-1 h-8 text-sm transition-all ${
                  direction.fromLang === "fr" 
                    ? "text-white love-gradient-btn" 
                    : "text-primary hover:bg-primary/10"
                }`}
                onClick={() => direction.fromLang !== "fr" && handleToggleDirection()}
                style={{
                  background: direction.fromLang === "fr" 
                    ? 'var(--love-gradient)' 
                    : ''
                }}
              >
                FR → EN
              </Button>
            </div>
          </div>
          
          {/* Source text input */}
          <Card className="mb-4 overflow-hidden border-primary/20 shadow-sm love-card">
            <div className="love-gradient-header px-4 py-2.5 flex justify-between items-center">
              <h3 className="text-sm font-medium text-primary/90 font-heading">
                {direction.fromLang === "en" ? "English" : "French"}
              </h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-xs bg-white/80 rounded-full px-2 py-0.5 shadow-sm border border-primary/10">
                  <input 
                    type="checkbox" 
                    checked={autoTranslate} 
                    onChange={() => setAutoTranslate(!autoTranslate)}
                    className="mr-1.5 h-3 w-3 accent-primary"
                  />
                  Auto-translate
                </label>
              </div>
            </div>
            <CardContent className="p-3 bg-white/90">
              <Textarea
                value={sourceText}
                onChange={handleSourceTextChange}
                placeholder={`Type or paste text here... (${direction.fromLang === "en" ? "English" : "French"})`}
                className="resize-none h-28 border-gray-200 focus:border-primary text-base rounded-lg shadow-inner bg-white"
                maxLength={MAX_CHARS}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">{sourceText.length}/{MAX_CHARS}</span>
                {!autoTranslate && (
                  <Button 
                    onClick={handleTranslate} 
                    size="sm"
                    disabled={translateMutation.isPending || !sourceText.trim()}
                    className="love-gradient-btn px-4 py-2 rounded-full shadow-sm"
                    style={{
                      background: 'var(--love-gradient)'
                    }}
                  >
                    {translateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="mr-2 h-4 w-4" />
                        Translate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Translation result */}
          <Card className="relative overflow-hidden border-primary/20 shadow-sm love-card">
            <div className="love-gradient-header px-4 py-2.5 flex justify-between items-center">
              <h3 className="text-sm font-medium text-primary/90 font-heading">
                {direction.toLang === "fr" ? "French" : "English"}
              </h3>
              
              <div className="flex space-x-1">
                {translationResult && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 px-2 rounded-full text-gray-600 hover:text-primary hover:bg-white/70"
                      onClick={handleCopyTranslation}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Copy</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`h-7 px-2 rounded-full ${isFavorite ? 'text-yellow-500' : 'text-gray-600'} hover:text-yellow-500 hover:bg-white/70`}
                      onClick={handleToggleFavorite}
                      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      disabled={favoriteMutation.isPending}
                    >
                      {isFavorite ? (
                        <>
                          <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500" />
                          <span className="text-xs">Saved</span>
                        </>
                      ) : (
                        <>
                          <Star className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Save</span>
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <CardContent className="p-4 bg-white/90">
              <AnimatePresence mode="wait">
                {translateMutation.isPending ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-[100px]"
                  >
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-primary/60">Translating...</p>
                    </div>
                  </motion.div>
                ) : translationResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="min-h-[100px] py-2"
                  >
                    <p className="text-lg leading-relaxed">{translationResult}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[100px] text-gray-400"
                  >
                    <Languages className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm">Your translation will appear here</p>
                    <p className="text-xs mt-1 opacity-70">Type something above and click translate</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Common Phrases */}
      <div className="mt-6">
        <div className="relative mb-6 rounded-xl overflow-hidden border border-primary/20 shadow-sm love-card">
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary/10 to-transparent"></div>
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold font-heading flex items-center text-primary">
                <Heart className="mr-2 h-4 w-4 text-primary" fill="currentColor" />
                Love Phrases
              </h3>
              <span className="text-xs text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 shadow-sm">
                {direction.fromLang === "en" ? "EN → FR" : "FR → EN"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {commonPhrases.map((phrase, index) => (
                <Card key={index} className="overflow-hidden border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40 transition-all bg-white/90 love-card">
                  <div 
                    className="p-3 cursor-pointer hover:bg-primary/5 flex items-center justify-between"
                    onClick={() => handleUseCommonPhrase(phrase.text)}
                  >
                    <p className="text-sm text-gray-800">{phrase.text}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhraseMeaning(index);
                      }}
                      title={showPhraseMeanings[index] ? "Hide translation" : "Show translation"}
                    >
                      {showPhraseMeanings[index] ? (
                        <Heart className="h-4 w-4 fill-primary" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showPhraseMeanings[index] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-primary/10 bg-gradient-to-r from-primary/5 to-transparent"
                      >
                        <div className="px-3 py-2">
                          <p className="text-sm text-primary/90 font-medium">
                            {phrase.translation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
