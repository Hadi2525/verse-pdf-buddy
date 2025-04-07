
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileInfo } from "@/types";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { File, Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  onFileUploaded: (file: FileInfo) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      });
      return;
    }

    if (startPage > endPage) {
      toast({
        title: "Invalid page range",
        description: "Start page cannot be greater than end page",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a unique ID for this upload
      const tempId = crypto.randomUUID();
      
      // Create a temporary file info to show in the UI
      const tempFileInfo: FileInfo = {
        id: tempId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "uploading",
        startPage,
        endPage
      };
      
      onFileUploaded(tempFileInfo);
      
      // Simulate initial progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      // Call the API to upload and index the PDF
      const result = await api.uploadPdf(selectedFile, startPage, endPage);
      
      // Clear the interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update with the completed info
      const indexedFileInfo: FileInfo = {
        id: tempId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "indexed",
        pages: result.page_count,
        startPage,
        endPage,
      };
      
      onFileUploaded(indexedFileInfo);
      
      toast({
        title: "Upload complete",
        description: "Your PDF has been successfully indexed",
      });
      
      // Reset the form
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        setStartPage(1);
        setEndPage(1);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);
      
    } catch (error: any) {
      // Store a reference to the tempId created in the try block
      // This ensures tempId is in scope even in the catch block
      const errorTempId = crypto.randomUUID(); // Create a new ID for error case
      
      // Handle API error
      setUploadProgress(0);
      setIsUploading(false);
      
      // Update file status to error
      const errorFileInfo: FileInfo = {
        id: errorTempId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "error",
        error: error.message || "Failed to upload file",
        startPage,
        endPage
      };
      
      onFileUploaded(errorFileInfo);
      
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the PDF",
        variant: "destructive",
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-6">
      <div 
        className="upload-zone flex flex-col items-center justify-center p-8 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary/70" />
        </div>
        <p className="text-foreground font-medium mb-1">
          {selectedFile ? selectedFile.name : "Upload a PDF"}
        </p>
        <p className="text-sm text-muted-foreground">
          Click to browse your files
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-border flex items-center">
          <FileText className="h-5 w-5 text-primary mr-3" />
          <span className="text-sm truncate flex-1">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            disabled={isUploading}
            className="h-7 w-7 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="text-sm font-medium mb-2">Page Range</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startPage" className="text-sm text-muted-foreground">
              Start Page
            </label>
            <Input
              id="startPage"
              type="number"
              min={1}
              value={startPage}
              onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
              disabled={isUploading}
              className="bg-muted/50 border-muted"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endPage" className="text-sm text-muted-foreground">
              End Page
            </label>
            <Input
              id="endPage"
              type="number"
              min={1}
              value={endPage}
              onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
              disabled={isUploading}
              className="bg-muted/50 border-muted"
            />
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button 
          className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Processing..." : "Upload and Index"}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
