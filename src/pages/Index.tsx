
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileInfo } from "@/types";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { File, CheckCircle, AlertCircle, Loader } from "lucide-react";

const Index = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const handleFileUploaded = (newFile: FileInfo) => {
    // Check if the file is already in the list (for status updates)
    const existingFileIndex = files.findIndex(f => f.id === newFile.id);
    
    if (existingFileIndex !== -1) {
      // Update the existing file
      const updatedFiles = [...files];
      updatedFiles[existingFileIndex] = newFile;
      setFiles(updatedFiles);
    } else {
      // Add the new file
      setFiles(prev => [...prev, newFile]);
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
        return "bg-blue-100 text-blue-800";
      case "indexing":
        return "bg-yellow-100 text-yellow-800";
      case "indexed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-pdf-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-pdf-primary mb-2">PDF Buddy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your PDFs and chat with an AI that can reference specific content from your documents
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="files">
                  Files
                  {files.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {files.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-4">
                <FileUpload onFileUploaded={handleFileUploaded} />
              </TabsContent>
              
              <TabsContent value="files" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-pdf-primary">Your Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {files.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p>No files uploaded yet</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {files.map((file) => (
                          <li key={file.id} className="border rounded-lg p-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <File className="h-5 w-5 text-pdf-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <span>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                  {file.pages && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{file.pages} pages</span>
                                    </>
                                  )}
                                  {file.startPage && file.endPage && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>
                                        Pages {file.startPage}-{file.endPage}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                                  {getStatusIcon(file.status)}
                                  <span className="ml-1">{getStatusText(file.status)}</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:col-span-2">
            <ChatInterface files={files} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
