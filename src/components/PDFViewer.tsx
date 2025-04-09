
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileInfo } from "@/types";
import { Loader } from "lucide-react";
import { api } from "@/services/api";

interface PDFViewerProps {
  file: FileInfo | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, isOpen, onOpenChange }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  // Construct the PDF URL using the file_id from the MongoDB and the API base URL
  const pdfUrl = file?.file_id ? `${api.getBaseUrl()}/preview-pdf/${file.file_id}` : "";
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  React.useEffect(() => {
    // Reset loading state when the file changes
    if (isOpen) {
      setIsLoading(true);
    }
  }, [file, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium flex items-center">
            {file?.name || "PDF Preview"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 h-full mt-4 rounded-md border overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {file && (
            <iframe 
              src={pdfUrl}
              className="w-full h-full"
              onLoad={handleLoad}
              title={`PDF preview: ${file.name}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
