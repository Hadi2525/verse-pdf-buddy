
import React from "react";
import { ChatMessage, Reference } from "@/types";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

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
      "flex w-full my-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 mr-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-pdf-primary/10">
            <Bot className="h-5 w-5 text-pdf-primary" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={isUser ? "chat-bubble-user" : "chat-bubble-ai"}>
          {message.content.split('\n').map((text, i) => (
            <React.Fragment key={i}>
              {text}
              {i !== message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        
        {hasReferences && !isUser && (
          <button 
            onClick={onShowReferences}
            className="text-xs text-pdf-primary mt-1 hover:underline flex items-center"
          >
            <span className="i-lucide-book-open mr-1 h-3 w-3" />
            View {references.length} reference{references.length > 1 ? 's' : ''}
          </button>
        )}
        
        <span className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-pdf-primary">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
