
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileInfo } from "@/types";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { File, CheckCircle, AlertCircle, Loader, FileText, Upload as UploadIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFViewer from "@/components/PDFViewer";

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  
  // Find the currently uploading file (if any)
  const uploadingFile = files.find(file => file.status === "uploading");

  const handleFileUploaded = (newFile: FileInfo) => {
    // Check if the file is already in the list (for status updates)
    const existingFileIndex = files.findIndex(f => f.id === newFile.id);
    
    if (existingFileIndex !== -1) {
      // Update the existing file
      const updatedFiles = [...files];
      updatedFiles[existingFileIndex] = newFile;
      setFiles(updatedFiles);
      
      // If a file has completed uploading and we're on the upload tab,
      // switch to the files tab to show the result
      if (newFile.status === "indexed" && activeTab === "upload" && updatedFiles[existingFileIndex].status === "uploading") {
        setActiveTab("files");
      }
    } else {
      // Add the new file
      setFiles([...files, newFile]);
    }
  };

  const getStatusIcon = (status: FileInfo["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case "indexing":
        return <Loader className="h-4 w-4 animate-spin text-yellow-500" />;
      case "indexed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: FileInfo["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading";
      case "indexing":
        return "Indexing";
      case "indexed":
        return "Indexed";
      case "error":
        return "Error";
      default:
        return status;
    }
  };

  const getStatusColor = (status: FileInfo["status"]) => {
    switch (status) {
      case "uploading":
        return "bg-blue-500/20 text-blue-300";
      case "indexing":
        return "bg-yellow-500/20 text-yellow-300";
      case "indexed":
        return "bg-green-500/20 text-green-300";
      case "error":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const openPdfPreview = (file: FileInfo) => {
    setSelectedFile(file);
    setIsPdfDialogOpen(true);
  };

  const indexedFiles = files.filter(file => file.status === "indexed");

  // Switch to files tab automatically when a file starts uploading
  useEffect(() => {
    if (uploadingFile && activeTab === "upload") {
      setActiveTab("files");
    }
  }, [uploadingFile, activeTab]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="container max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-muted/40">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">PDF Buddy</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Upload your PDFs and chat with AI that references the content directly
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="glass-card p-1">
              <TabsList className="grid w-full grid-cols-2 bg-background/40 mb-3 p-1">
                <TabsTrigger value="upload" className="data-[state=active]:tab-active">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="files" className="data-[state=active]:tab-active">
                  <File className="h-4 w-4 mr-2" />
                  Files
                  {files.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary text-white">
                      {files.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-0 animate-fade-in">
                <FileUpload 
                  onFileUploaded={handleFileUploaded} 
                  activeFile={uploadingFile} 
                />
              </TabsContent>
              
              <TabsContent value="files" className="mt-0 animate-fade-in">
                <div className="p-6">
                  <h3 className="text-xl font-medium text-primary mb-4">Your Files</h3>
                  {files.length === 0 ? (
                    <div className="text-center py-12 rounded-lg bg-muted/40 border border-border">
                      <File className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-muted-foreground">No files uploaded yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Upload PDFs to start chatting with your documents
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {files.map((file) => (
                        <li key={file.id} className="file-item p-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <div className="p-2 rounded-md bg-muted/50">
                                <File className="h-5 w-5 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                                <span>
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                {file.pages && (
                                  <>
                                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                                    <span>{file.pages} pages</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2 flex items-center gap-2">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                                {getStatusIcon(file.status)}
                                <span className="ml-1">{getStatusText(file.status)}</span>
                              </div>
                              
                              {file.status === "indexed" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => openPdfPreview(file)}
                                  className="h-7 w-7 rounded-full hover:bg-muted"
                                  title="Preview PDF"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {file.error && (
                            <div className="mt-2 text-xs text-red-300 bg-red-500/10 p-2 rounded-md">
                              Error: {file.error}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-8">
            <ChatInterface files={files} />
          </div>
        </div>
      </div>
      
      {/* PDF Viewer Dialog */}
      <PDFViewer 
        file={selectedFile} 
        isOpen={isPdfDialogOpen} 
        onOpenChange={setIsPdfDialogOpen} 
      />
    </div>
  );
};

export default Index;
