import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Conversation, Message, InsertMessage } from "@shared/schema";

export function useMessages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const getMessages = (conversationId: number) => {
    return useQuery<Message[]>({
      queryKey: ["/api/conversations", conversationId, "messages"],
      enabled: !!conversationId,
    });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, text }: { conversationId: number; text: string }) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { text });
      return await res.json() as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", variables.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const res = await apiRequest("POST", "/api/conversations", { participantId });
      return await res.json() as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "New conversation created",
        description: "You can now start messaging",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const readMessagesMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/read`, {});
      return await res.json();
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  return {
    conversations,
    isLoadingConversations,
    getMessages,
    sendMessageMutation,
    createConversationMutation,
    readMessagesMutation,
  };
}
