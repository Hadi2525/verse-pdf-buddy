
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare } from "lucide-react";
import Message from "./Message";
import ReferenceList from "./ReferenceList";
import { ChatMessage, Reference, FileInfo } from "@/types";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatInterfaceProps {
  files: FileInfo[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ files }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);
  const [showReferences, setShowReferences] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const indexedFiles = files.filter(file => file.status === "indexed");
  const hasIndexedFiles = indexedFiles.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isLoading) return;
    
    if (!hasIndexedFiles) {
      toast({
        title: "No indexed files",
        description: "Please upload and index at least one PDF file first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const messageHistory = [
        ...messages,
        userMessage
      ].map(({ role, content }) => ({ role, content }));

      const response = await api.generateResponse({
        messages: messageHistory,
        top_searches: 5,
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (response.retrievedVerses && response.retrievedVerses.length > 0) {
        setReferences(response.retrievedVerses);
      } else {
        setReferences([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate response",
        variant: "destructive",
      });
      
      // Add an error message to the chat
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again later.",
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[600px] overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-primary flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary/70" />
            PDF Chat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {hasIndexedFiles 
              ? `Chatting with ${indexedFiles.length} indexed file${indexedFiles.length > 1 ? 's' : ''}`
              : "Upload a PDF to start chatting"}
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="relative flex-1">
          {references.length > 0 && showReferences && (
            <div className="absolute right-0 top-0 z-10 p-2">
              <ReferenceList 
                references={references}
                isVisible={showReferences}
                onClose={() => setShowReferences(false)}
              />
            </div>
          )}
          
          <ScrollArea className="h-full pr-2">
            <div className="space-y-6 px-2 pb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {hasIndexedFiles
                      ? "Ask questions about your PDF documents and I'll provide answers with references."
                      : "Upload and index a PDF first to start chatting."}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                    references={
                      message.role === "assistant" ? references : undefined
                    }
                    onShowReferences={
                      message.role === "assistant" && references.length > 0
                        ? () => setShowReferences(true)
                        : undefined
                    }
                  />
                ))
              )}
              
              {/* Loading indicator for waiting response */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    </div>
                  </div>
                  <div>
                    <div className="chat-bubble-ai">
                      <div className="flex flex-col space-y-3">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-4 w-[250px]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                hasIndexedFiles
                  ? "Type your question here..."
                  : "Upload a PDF to start chatting"
              }
              disabled={isLoading || !hasIndexedFiles}
              className="pr-10 py-6 bg-muted/50 border-muted"
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !hasIndexedFiles || inputValue.trim() === ""}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
