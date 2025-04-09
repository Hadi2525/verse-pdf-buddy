import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileInfo } from "@/types";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { File, Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  onFileUploaded: (file: FileInfo) => void;
  activeFile?: FileInfo | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, activeFile }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tempFileIdRef = useRef<string>("");

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeFile?.status === "uploading") {
      setIsUploading(true);
      setUploadProgress(activeFile.progress || 50);
    }
  }, [activeFile]);

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

  const updateProgress = (progress: number) => {
    setUploadProgress(progress);
    
    if (tempFileIdRef.current) {
      const tempFileInfo: FileInfo = {
        id: tempFileIdRef.current,
        name: selectedFile?.name || "",
        size: selectedFile?.size || 0,
        status: progress < 100 ? "uploading" : "indexing",
        progress: progress
      };
      
      onFileUploaded(tempFileInfo);
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

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const tempId = crypto.randomUUID();
      tempFileIdRef.current = tempId;
      
      const tempFileInfo: FileInfo = {
        id: tempId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "uploading",
        progress: 0
      };
      
      onFileUploaded(tempFileInfo);
      
      let currentProgress = 0;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = setInterval(() => {
        currentProgress += 5;
        if (currentProgress > 90) {
          clearInterval(progressIntervalRef.current!);
          currentProgress = 90;
        }
        
        updateProgress(currentProgress);
      }, 300);

      const result = await api.uploadPdf(selectedFile);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      updateProgress(100);
      
      const indexingFileInfo: FileInfo = {
        id: tempId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "indexing",
        progress: 0
      };
      onFileUploaded(indexingFileInfo);
      
      currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 100) {
          clearInterval(progressIntervalRef.current!);
          
          const indexedFileInfo: FileInfo = {
            id: tempId,
            name: selectedFile.name,
            size: selectedFile.size,
            status: "indexed",
            pages: result.page_count,
            progress: 100,
            file_id: result.file_id || result.file_details?.id
          };
          
          onFileUploaded(indexedFileInfo);
          
          toast({
            title: "Upload complete",
            description: "Your PDF has been successfully indexed",
          });
          
          setTimeout(() => {
            setIsUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }, 1000);
          
          return;
        }
        
        const indexingUpdate: FileInfo = {
          id: tempId,
          name: selectedFile.name,
          size: selectedFile.size,
          status: "indexing",
          progress: currentProgress
        };
        
        onFileUploaded(indexingUpdate);
      }, 200);
      
    } catch (error: any) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      const errorTempId = tempFileIdRef.current || crypto.randomUUID();
      
      setUploadProgress(0);
      setIsUploading(false);
      
      const errorFileInfo: FileInfo = {
        id: errorTempId,
        name: selectedFile.name,
        size: selectedFile.size,
        status: "error",
        error: error.message || "Failed to upload file",
        progress: 0
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

  const activeUploadingFile = activeFile?.status === "uploading" || activeFile?.status === "indexing";

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
          {activeUploadingFile ? activeFile?.name : selectedFile ? selectedFile.name : "Upload a PDF"}
        </p>
        <p className="text-sm text-muted-foreground">
          {activeUploadingFile ? "Processing..." : "Click to browse your files"}
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading || activeUploadingFile}
        />
      </div>

      {(selectedFile || activeUploadingFile) && (
        <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-border flex items-center">
          <FileText className="h-5 w-5 text-primary mr-3" />
          <span className="text-sm truncate flex-1">{activeUploadingFile ? activeFile?.name : selectedFile?.name}</span>
          {!activeUploadingFile && (
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
          )}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {(isUploading || activeUploadingFile) && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{activeFile?.status === "indexing" ? "Indexing..." : "Uploading..."}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button 
          className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          onClick={handleUpload}
          disabled={(!selectedFile && !activeUploadingFile) || isUploading || activeUploadingFile}
        >
          {isUploading || activeUploadingFile ? "Processing..." : "Upload and Index"}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
