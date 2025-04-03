
import React from "react";
import { Reference } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";

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
    <Card className="w-full max-w-md animate-fade-in bg-[#2A2F3C] border-gray-700 text-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center text-pdf-primary">
          <BookOpen className="h-4 w-4 mr-2" />
          References
        </CardTitle>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </CardHeader>
      <Separator className="bg-gray-700" />
      <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
        <ul className="space-y-3">
          {references.map((ref, index) => (
            <li key={index} className="bg-[#222632] rounded-lg p-3 border border-gray-700">
              <div className="reference-tag mb-2">
                {ref.reference}
              </div>
              <p className="text-sm text-gray-300">{ref.content}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ReferenceList;
