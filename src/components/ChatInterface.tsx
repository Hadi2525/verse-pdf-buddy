
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import Message from "./Message";
import ReferenceList from "./ReferenceList";
import { ChatMessage, Reference, FileInfo } from "@/types";
import { api } from "@/services/api";

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-medium text-pdf-primary">PDF Chat</h2>
        <p className="text-sm text-gray-500">
          {hasIndexedFiles 
            ? `Chatting with ${indexedFiles.length} indexed file${indexedFiles.length > 1 ? 's' : ''}`
            : "Upload a PDF to start chatting"}
        </p>
      </div>
      
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="flex-1 relative">
          {references.length > 0 && showReferences && (
            <div className="absolute right-0 top-0 z-10 p-2">
              <ReferenceList 
                references={references}
                isVisible={showReferences}
                onClose={() => setShowReferences(false)}
              />
            </div>
          )}
          
          <ScrollArea className="h-full">
            <div className="space-y-4 px-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500">
                  <div className="rounded-full bg-pdf-primary/10 p-3 mb-4">
                    <svg
                      className="h-6 w-6 text-pdf-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Start a conversation</h3>
                  <p className="text-sm max-w-md mt-2">
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                hasIndexedFiles
                  ? "Type your question here..."
                  : "Upload a PDF to start chatting"
              }
              disabled={isLoading || !hasIndexedFiles}
              className="resize-none"
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !hasIndexedFiles || inputValue.trim() === ""}
            className="bg-pdf-primary hover:bg-pdf-primary/90"
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
