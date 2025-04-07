
import React from "react";
import { Reference } from "@/types";
import { Separator } from "@/components/ui/separator";
import { BookOpen, X } from "lucide-react";

interface ReferenceListProps {
  references: Reference[];
  isVisible: boolean;
  onClose: () => void;
}

const ReferenceList: React.FC<ReferenceListProps> = ({ 
  references, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible || references.length === 0) {
    return null;
  }

  return (
    <div className="glass-card w-full max-w-md animate-fade-in shadow-xl border border-primary/20">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center text-primary space-x-2">
          <BookOpen className="h-4 w-4" />
          <h3 className="text-md font-medium">References</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors rounded-full w-6 h-6 flex items-center justify-center hover:bg-muted"
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <Separator className="bg-border" />
      
      <div className="p-4 max-h-[300px] overflow-y-auto">
        <ul className="space-y-3">
          {references.map((ref, index) => (
            <li key={index} className="bg-muted/60 rounded-lg p-3 border border-border shadow-sm">
              <div className="reference-tag mb-2">
                {ref.reference}
              </div>
              <p className="text-sm text-foreground/80">{ref.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReferenceList;
