
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileInfo } from "@/types";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { File, Upload, X, CheckCircle, AlertCircle } from "lucide-react";

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
      
      // Simulate progress for better UX since the actual API doesn't report progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);

      // Create a temporary file info to show in the UI
      const tempFileInfo: FileInfo = {
        id: crypto.randomUUID(),
        name: selectedFile.name,
        size: selectedFile.size,
        status: "uploading",
        startPage,
        endPage
      };
      
      onFileUploaded(tempFileInfo);

      // Call the API to upload and index the PDF
      // Comment out for now as the backend isn't fully implemented
      /*
      const fileInfo = await api.uploadPdf(selectedFile, startPage, endPage);
      onFileUploaded(fileInfo);
      */
      
      // Simulate successful upload for testing UI
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Update the file status to indexed after "processing"
        const indexedFileInfo: FileInfo = {
          ...tempFileInfo,
          status: "indexed",
          pages: Math.max(30, endPage) // Simulate page count
        };
        
        onFileUploaded(indexedFileInfo);
        
        setIsUploading(false);
        setSelectedFile(null);
        setStartPage(1);
        setEndPage(1);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        toast({
          title: "Upload complete",
          description: "Your PDF has been successfully indexed",
        });
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the PDF",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-pdf-primary">Upload PDF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-pdf-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {selectedFile ? selectedFile.name : "Click to select a PDF file"}
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
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div className="flex items-center">
              <File className="h-5 w-5 text-pdf-primary mr-2" />
              <span className="text-sm truncate max-w-[150px]">{selectedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={isUploading}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startPage" className="text-sm font-medium">
              Start Page
            </label>
            <Input
              id="startPage"
              type="number"
              min={1}
              value={startPage}
              onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endPage" className="text-sm font-medium">
              End Page
            </label>
            <Input
              id="endPage"
              type="number"
              min={1}
              value={endPage}
              onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
              disabled={isUploading}
            />
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-pdf-primary hover:bg-pdf-primary/90"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Processing..." : "Upload and Index"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
