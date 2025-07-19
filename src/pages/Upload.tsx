import React, { useState, useCallback } from 'react';
import { 
  Upload as UploadIcon, 
  File, 
  Image, 
  FileText, 
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Cloud,
  Plus,
  MoreVertical
} from 'lucide-react';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'product-catalog.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 2.4,
      uploadDate: '2024-01-15',
      status: 'completed',
      url: '#'
    },
    {
      id: 2,
      name: 'inventory-photos.zip',
      type: 'application/zip',
      size: 15.7,
      uploadDate: '2024-01-14',
      status: 'completed',
      url: '#'
    },
    {
      id: 3,
      name: 'product-image-001.jpg',
      type: 'image/jpeg',
      size: 0.8,
      uploadDate: '2024-01-13',
      status: 'completed',
      url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 4,
      name: 'supplier-data.csv',
      type: 'text/csv',
      size: 1.2,
      uploadDate: '2024-01-12',
      status: 'processing',
      url: '#'
    }
  ]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: parseFloat((file.size / (1024 * 1024)).toFixed(1)),
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'uploading' as const,
        url: '#'
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);
      
      // Simulate upload progress
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === newFile.id ? { ...f, status: 'completed' as const } : f)
        );
      }, 2000);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-green-500" />;
    } else if (type.includes('spreadsheet') || type.includes('excel')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else if (type.includes('csv')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('zip')) {
      return <File className="h-5 w-5 text-purple-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <div className="loading-spinner w-4 h-4"></div>;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="loading-spinner w-4 h-4"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const deleteFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">File Upload</h1>
              <p className="text-gray-600">Upload and manage your inventory files</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Cloud className="h-4 w-4" />
                <span>Cloud Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="card p-8 mb-8 animate-slide-up">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".xlsx,.xls,.csv,.jpg,.jpeg,.png,.zip,.pdf"
            />
            
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                <UploadIcon className="h-8 w-8 text-primary-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-gray-600 mb-4">
                  Support for Excel, CSV, images, and ZIP files up to 50MB
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">Excel (.xlsx, .xls)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">CSV (.csv)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Images (.jpg, .png)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Archive (.zip)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Guidelines */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Upload Excel or CSV files to import multiple products at once. 
              Download our template for the correct format.
            </p>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Image className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Upload high-quality product images. Images will be automatically 
              resized and optimized for web display.
            </p>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cloud className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cloud Storage</h3>
            </div>
            <p className="text-gray-600 text-sm">
              All uploaded files are securely stored in the cloud with 
              automatic backups and version control.
            </p>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{uploadedFiles.length} files</span>
              <span>•</span>
              <span>{uploadedFiles.reduce((total, file) => total + file.size, 0).toFixed(1)} MB</span>
            </div>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
              <p className="text-gray-600">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {getStatusIcon(file.status)}
                          <span className="ml-1 capitalize">{file.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{file.size} MB</span>
                        <span>•</span>
                        <span>{file.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                          <Download className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Processing Status */}
        {uploadedFiles.some(file => file.status === 'processing') && (
          <div className="card p-4 mt-6 bg-yellow-50 border-yellow-200 animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="loading-spinner w-5 h-5"></div>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Processing files...
                </p>
                <p className="text-xs text-yellow-700">
                  This may take a few minutes for large files.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;