import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChevronLeft, 
  Send, 
  Languages, 
  MoreVertical, 
  Check, 
  CheckCheck,
  Image,
  Smile,
  Mic
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ConversationViewProps {
  conversation: {
    id: number;
    participantName: string;
    participantInitials: string;
  };
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  senderId: number;
  sentAt: string;
  isRead: boolean;
  translateFrom?: string;
  translateTo?: string;
  originalText?: string;
}

export default function ConversationView({ conversation, onClose }: ConversationViewProps) {
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock messages based on the conversation participant (Marie or John)
  const [messages, setMessages] = useState<Message[]>(() => {
    const isFrench = conversation.participantName === "Marie Dupont";
    
    if (isFrench) {
      // French conversation
      return [
        {
          id: 1,
          text: "Bonjour! Comment allez-vous aujourd'hui?",
          senderId: 2, // Not the current user
          sentAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
          isRead: true
        },
        {
          id: 2,
          text: "I'm doing well, thank you! How about you?",
          senderId: user?.id || 1, // Current user
          sentAt: new Date(Date.now() - 8 * 60000).toISOString(), // 8 minutes ago
          isRead: true
        },
        {
          id: 3,
          text: "Très bien aussi, merci! Avez-vous pratiqué votre français aujourd'hui?",
          senderId: 2, // Not the current user
          sentAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          isRead: true
        }
      ];
    } else {
      // English conversation
      return [
        {
          id: 1,
          text: "Hello! How can I help with your translations today?",
          senderId: 2, // Not the current user
          sentAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
          isRead: true
        },
        {
          id: 2,
          text: "I need help translating some business documents from English to French.",
          senderId: user?.id || 1, // Current user
          sentAt: new Date(Date.now() - 8 * 60000).toISOString(), // 8 minutes ago
          isRead: true
        },
        {
          id: 3,
          text: "Of course! You can use our translation tool or we can discuss specific phrases here.",
          senderId: 2, // Not the current user
          sentAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          isRead: true
        }
      ];
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate the other person typing
  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
    const typingTimeout = setTimeout(() => {
      if (messages.length > 0) {
        // Only show typing if there are existing messages
        setIsTyping(true);
        
        // After 2-4 seconds, send a new message
        const messageDelay = Math.floor(Math.random() * 2000) + 2000;
        setTimeout(() => {
          const lastMessage = messages[messages.length - 1];
          
          // Only send a response if the last message was from the user
          if (lastMessage && lastMessage.senderId === user?.id) {
            // Select responses based on the conversation partner
            const isFrench = conversation.participantName === "Marie Dupont";
            
            const responses = isFrench ? 
              // French responses
              [
                "Je comprends ce que vous dites!",
                "C'est très intéressant.",
                "Pouvez-vous m'en dire plus?",
                "J'adore discuter avec vous en français.",
                "C'est une bonne pratique pour votre français!"
              ] 
              : 
              // English responses
              [
                "I understand what you're saying.",
                "That's very interesting.",
                "Can you tell me more about that?",
                "I can help you translate that to French.",
                "Would you like me to explain any specific terms?"
              ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const newMessage = {
              id: Date.now(),
              text: randomResponse,
              senderId: 2, // The other person
              sentAt: new Date().toISOString(),
              isRead: true
            };
            
            setMessages(prev => [...prev, newMessage]);
          }
          
          setIsTyping(false);
        }, messageDelay);
      }
    }, randomDelay);
    
    return () => {
      clearTimeout(typingTimeout);
    };
  }, [messages, user?.id]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: messageText,
      senderId: user?.id || 1,
      sentAt: new Date().toISOString(),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday, " + format(date, "h:mm a");
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const toggleAutoTranslate = () => {
    setAutoTranslate(!autoTranslate);
    toast({
      title: autoTranslate ? "Auto-translate disabled" : "Auto-translate enabled",
      description: autoTranslate 
        ? "Messages will no longer be automatically translated" 
        : "Messages will be automatically translated to your preferred language",
    });
  };

  const translateMessage = (messageId: number) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          // If already translated, revert to original
          if (msg.originalText) {
            return {
              ...msg,
              text: msg.originalText,
              originalText: undefined,
              translateFrom: undefined,
              translateTo: undefined
            };
          } else {
            // Otherwise translate the message
            // For demo purposes, we'll just add a simple translation marker
            // In a real app, this would call a translation API
            const isEnglish = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(msg.text);
            const originalText = msg.text;
            let translatedText = '';
            
            if (isEnglish) {
              // Convert English to French-like text
              translatedText = msg.text
                .replace(/th/g, "z")
                .replace(/w/g, "v")
                .replace(/tion/g, "sion")
                .replace(/ing/g, "ant") + " 🇫🇷";
            } else {
              // Convert French to English-like text
              translatedText = msg.text
                .replace(/ou/g, "u")
                .replace(/eau/g, "o")
                .replace(/é/g, "e")
                .replace(/è/g, "e") + " 🇬🇧";
            }
            
            return {
              ...msg,
              text: translatedText,
              originalText: originalText,
              translateFrom: isEnglish ? "en" : "fr",
              translateTo: isEnglish ? "fr" : "en"
            };
          }
        }
        return msg;
      })
    );
    
    // Clear selected message after operation
    setSelectedMessage(null);
  };

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== user?.id) return null;
    
    return message.isRead ? (
      <CheckCheck className="h-4 w-4 text-primary" />
    ) : (
      <Check className="h-4 w-4 text-gray-400" />
    );
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-white z-10 flex flex-col"
    >
      <div className="bg-primary text-white p-3 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="mr-2 text-white hover:bg-primary/80"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mr-2">
            <span className="font-medium text-sm">{conversation.participantInitials}</span>
          </div>
          <div>
            <p className="font-medium">{conversation.participantName}</p>
            <p className="text-xs text-white/80">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoTranslate}
            className={`text-white hover:bg-primary/80 ${autoTranslate ? 'bg-white/10' : ''}`}
            title={autoTranslate ? "Disable auto-translate" : "Enable auto-translate"}
          >
            <Languages className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary/80"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleAutoTranslate}>
                {autoTranslate ? "Disable" : "Enable"} Auto-Translate
              </DropdownMenuItem>
              <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat History</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {/* Message History */}
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            
            return isOwnMessage ? (
              <div key={message.id} className="flex items-end justify-end space-x-2 group">
                <div 
                  className={`bg-primary/10 p-3 rounded-lg rounded-br-none shadow-sm max-w-[75%] relative ${selectedMessage === message.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  {message.originalText && (
                    <div className="mb-1 px-2 py-0.5 bg-primary/5 rounded text-xs text-primary inline-block">
                      Translated: {message.translateFrom} → {message.translateTo}
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">{formatMessageTime(message.sentAt)}</p>
                    {getMessageStatusIcon(message)}
                  </div>
                  
                  {selectedMessage === message.id && (
                    <div className="absolute -top-10 right-0 bg-white shadow-md rounded-lg flex overflow-hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => translateMessage(message.id)}
                      >
                        <Languages className="h-4 w-4 mr-1" />
                        <span className="text-xs">
                          {message.originalText ? "Original" : "Translate"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          setSelectedMessage(null);
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex items-end space-x-2 group">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                  <span className="font-medium text-xs">{conversation.participantInitials}</span>
                </div>
                <div 
                  className={`bg-white p-3 rounded-lg rounded-bl-none shadow-sm max-w-[75%] relative ${selectedMessage === message.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  {message.originalText && (
                    <div className="mb-1 px-2 py-0.5 bg-primary/5 rounded text-xs text-primary inline-block">
                      Translated: {message.translateFrom} → {message.translateTo}
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatMessageTime(message.sentAt)}</p>
                  
                  {selectedMessage === message.id && (
                    <div className="absolute -top-10 left-0 bg-white shadow-md rounded-lg flex overflow-hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => translateMessage(message.id)}
                      >
                        <Languages className="h-4 w-4 mr-1" />
                        <span className="text-xs">
                          {message.originalText ? "Original" : "Translate"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          setSelectedMessage(null);
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-end space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                  <span className="font-medium text-xs">{conversation.participantInitials}</span>
                </div>
                <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="resize-none min-h-[40px] max-h-[120px] pr-14 border-gray-300 focus:border-primary rounded-2xl"
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-primary rounded-full"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-primary rounded-full"
              >
                <Image className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Button
            className="ml-2 bg-primary hover:bg-primary/90 rounded-full h-12 w-12 p-0 flex items-center justify-center"
            disabled={!messageText.trim()}
            onClick={handleSendMessage}
          >
            {messageText.trim() ? (
              <Send className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
