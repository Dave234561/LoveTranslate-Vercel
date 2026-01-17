import { useState, useEffect } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ConversationView from "./conversation-view";
import { 
  PlusIcon, 
  Loader2, 
  Search, 
  MessageSquare, 
  Languages, 
  ArrowDownUp,
  X,
  User
} from "lucide-react";
import { 
  format, 
  isToday, 
  isYesterday, 
  isThisWeek, 
  formatDistanceToNow 
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ConversationWithDetails {
  id: number;
  participantName: string;
  participantInitials: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  languageIcon?: string;
  lastActive?: string;
}

interface Contact {
  id: number;
  name: string;
  initials: string;
  lastSeen?: string;
  language?: string;
}

export default function MessagesTab() {
  const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [sortByRecent, setSortByRecent] = useState(true);
  const { conversations, isLoadingConversations } = useMessages();
  const { user } = useAuth();

  // Only two contacts - one French and one English
  const contacts: Contact[] = [
    { id: 1, name: "Marie Dupont", initials: "MD", lastSeen: "Just now", language: "fr" },
    { id: 2, name: "John Smith", initials: "JS", lastSeen: "5m ago", language: "en" },
  ];

  // Only two conversations - one with a French speaker and one with an English speaker
  const conversationsWithDetails: ConversationWithDetails[] = [
    {
      id: 1,
      participantName: "Marie Dupont",
      participantInitials: "MD",
      lastMessage: "Bonjour! Comment allez-vous aujourd'hui?",
      time: "2:34 PM",
      unreadCount: 3,
      languageIcon: "🇫🇷",
      lastActive: "Online"
    },
    {
      id: 2,
      participantName: "John Smith",
      participantInitials: "JS",
      lastMessage: "Can you help me translate this document?",
      time: "Yesterday",
      unreadCount: 0,
      languageIcon: "🇬🇧",
      lastActive: "5m ago"
    }
  ];

  const filteredConversations = conversationsWithDetails.filter(
    convo => convo.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (sortByRecent) {
      // Sort by unread first, then by time
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      
      // Compare timestamps (for demo, we're using string comparison)
      // In a real app, you'd compare actual timestamps
      return a.time > b.time ? -1 : 1;
    } else {
      // Sort alphabetically by name
      return a.participantName.localeCompare(b.participantName);
    }
  });

  // Clear any modals when conversation is opened
  useEffect(() => {
    if (activeConversation) {
      setShowNewChatModal(false);
    }
  }, [activeConversation]);

  const handleOpenConversation = (conversation: ConversationWithDetails) => {
    // Create a copy and reset unread count
    const updatedConversation = { ...conversation, unreadCount: 0 };
    setActiveConversation(updatedConversation);
  };

  const handleCloseConversation = () => {
    setActiveConversation(null);
  };

  const handleNewChatWithContact = (contact: Contact) => {
    const newConversation = {
      id: Date.now(),
      participantName: contact.name,
      participantInitials: contact.initials,
      lastMessage: "Start a new conversation",
      time: "Now",
      unreadCount: 0,
      languageIcon: contact.language === "fr" ? "🇫🇷" : "🇬🇧",
      lastActive: contact.lastSeen
    };
    setActiveConversation(newConversation);
    setShowNewChatModal(false);
  };

  const formatTime = (timeString: string) => {
    // Handle relative time strings like "Yesterday", "2 days ago", etc.
    if (timeString === "Now" || 
        timeString === "Just now" || 
        timeString === "Yesterday" || 
        timeString.includes("ago") || 
        timeString.includes("days")) {
      return timeString;
    }
    
    // Otherwise, assume it's a time like "2:34 PM"
    return timeString;
  };

  return (
    <section className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold font-heading flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Messages
        </h2>
        
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:text-primary hover:bg-primary/5"
            onClick={() => setSortByRecent(!sortByRecent)}
            title={sortByRecent ? "Sort by name" : "Sort by recent"}
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowNewChatModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search messages..."
          className="pl-9 bg-gray-50 border-gray-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Message List */}
      <Card className="overflow-hidden">
        {isLoadingConversations ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedConversations.length > 0 ? (
          <div>
            {sortedConversations.map((convo) => (
              <div 
                key={convo.id}
                className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center cursor-pointer"
                onClick={() => handleOpenConversation(convo)}
              >
                <div className="relative mr-3">
                  <Avatar className="h-10 w-10 bg-secondary text-white">
                    <AvatarFallback>{convo.participantInitials}</AvatarFallback>
                  </Avatar>
                  {convo.languageIcon && (
                    <div className="absolute -bottom-1 -right-1 text-xs">
                      {convo.languageIcon}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{convo.participantName}</p>
                    <p className="text-xs text-gray-500">{formatTime(convo.time)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 truncate max-w-[70%]">{convo.lastMessage}</p>
                    {convo.unreadCount > 0 ? (
                      <span className="inline-block bg-primary text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                        {convo.unreadCount}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">{convo.lastActive}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            {searchQuery ? (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-md font-medium mb-2">No matching conversations</h3>
                <p className="text-sm text-gray-500 mb-4">Try a different search term</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-md font-medium mb-2">No messages yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start a conversation to practice your language skills</p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setShowNewChatModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Start a Conversation
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4"
            onClick={() => setShowNewChatModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold">New Conversation</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setShowNewChatModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative px-4 py-2 border-b border-gray-200">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-9 bg-gray-50 border-gray-200"
                />
              </div>
              
              <div className="overflow-y-auto flex-1">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center cursor-pointer"
                    onClick={() => handleNewChatWithContact(contact)}
                  >
                    <div className="relative mr-3">
                      <Avatar className="h-10 w-10 bg-secondary text-white">
                        <AvatarFallback>{contact.initials}</AvatarFallback>
                      </Avatar>
                      {contact.language && (
                        <div className="absolute -bottom-1 -right-1 text-xs">
                          {contact.language === "fr" ? "🇫🇷" : "🇬🇧"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500">{contact.lastSeen}</p>
                        {contact.language && (
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {contact.language === "fr" ? "French" : "English"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Conversation View (conditionally rendered) */}
      <AnimatePresence>
        {activeConversation && (
          <ConversationView 
            conversation={activeConversation} 
            onClose={handleCloseConversation} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
