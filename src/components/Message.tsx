
import React from "react";
import { ChatMessage, Reference } from "@/types";
import { cn } from "@/lib/utils";
import { User, Bot, BookOpen } from "lucide-react";

interface MessageProps {
  message: ChatMessage;
  references?: Reference[];
  onShowReferences?: () => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  references, 
  onShowReferences 
}) => {
  const isUser = message.role === "user";
  const hasReferences = references && references.length > 0;

  return (
    <div className={cn(
      "flex w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 mr-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
            <Bot className="h-5 w-5 text-primary" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={isUser ? "chat-bubble-user" : "chat-bubble-ai"}>
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        
        {hasReferences && !isUser && (
          <button 
            onClick={onShowReferences}
            className="text-xs text-primary mt-2 hover:text-primary/80 hover:underline flex items-center"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            View {references.length} reference{references.length > 1 ? 's' : ''}
          </button>
        )}
        
        <span className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
