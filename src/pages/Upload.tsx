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
  Cloud
} from 'lucide-react';
import { useUploads } from '../hooks/useUploads';
import { useAuth } from '../contexts/AuthContext';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const { user, profile } = useAuth();

  // Try to use the uploads hook, but handle database errors gracefully
  let uploadsHookResult;
  try {
    uploadsHookResult = useUploads();
  } catch (err: any) {
    uploadsHookResult = { error: err?.message || 'Database connection error' };
  }

  const {
    uploadedFiles = [],
    loading = false,
    error,
    uploadFile,
    deleteFile,
    downloadTemplate
  } = uploadsHookResult || {};

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && uploadFile) {
      handleFiles(e.dataTransfer.files);
    }
  }, [uploadFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0] && uploadFile) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!uploadFile) return;

    for (const file of Array.from(files)) {
      await uploadFile(file, {
        uploadedBy: user?.email,
        userRole: profile?.role
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!deleteFile) return;

    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteFile(fileId);
    }
  };

  // Fallback template download function in case hook fails
  const handleDownloadTemplate = () => {
    if (downloadTemplate) {
      downloadTemplate();
    } else {
      // Fallback template data
      const templateData = [
        {
          'SKU': 'PROD-001',
          'Product Name': 'Sample Electronics Product',
          'Category': 'Electronics',
          'Brand': 'TechBrand',
          'Selling Price': '299.99',
          'Cost Price': '199.99',
          'Weight (kg)': '1.5',
          'Description': 'High-quality electronic device with advanced features',
          'Stock Quantity': '100',
          'Reorder Level': '20',
          'Status': 'active'
        }
      ];

      const headers = Object.keys(templateData[0]);
      const csvContent = [
        '# PRODUCT IMPORT TEMPLATE',
        '# Fill in your product data and save as CSV',
        '',
        headers.join(','),
        ...templateData.map(row =>
          headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `product-template-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
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

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading uploads...</p>
        </div>
      </div>
    );
  }

  // Check if there's a database setup error
  const isDatabaseSetupError = error && (
    error.includes('relation "public.file_uploads" does not exist') ||
    error.includes('Database connection error')
  );

  const isRLSError = error && (
    error.includes('row-level security policy') ||
    error.includes('Permission denied') ||
    error.includes('RLS')
  );

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
              <button
                onClick={handleDownloadTemplate}
                className="btn-secondary flex items-center space-x-2"
              >
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

        {/* Database Setup Notice */}
        {isDatabaseSetupError && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Database Setup Required</h3>
                <p className="text-amber-700 mb-4">
                  The file upload feature requires database setup. Please run the migration files in your Supabase dashboard:
                </p>
                <div className="bg-amber-100 p-3 rounded border text-sm text-amber-800 mb-4">
                  <p className="font-semibold mb-2">Files to run in Supabase SQL Editor:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li><code>database/migrations/step1_create_table.sql</code></li>
                    <li><code>database/migrations/step2_add_policies.sql</code></li>
                    <li><code>database/migrations/step3_advanced_features.sql</code></li>
                    <li><code>database/migrations/step4_storage_setup.sql</code></li>
                  </ol>
                </div>
                <p className="text-sm text-amber-600">
                  💡 The template download will still work without database setup!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RLS Permission Error Notice */}
        {isRLSError && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Permission Error - Row Level Security</h3>
                <p className="text-red-700 mb-4">
                  You don't have permission to upload files. This is usually a database policy issue.
                </p>
                <div className="bg-red-100 p-3 rounded border text-sm text-red-800 mb-4">
                  <p className="font-semibold mb-2">Quick Fix - Run this in Supabase SQL Editor:</p>
                  <p><code>database/migrations/quick_fix_rls.sql</code></p>
                </div>
                <div className="text-sm text-red-600 space-y-1">
                  <p>• ✅ Ensure you're logged in to the application</p>
                  <p>• ✅ Check if your user profile exists in the database</p>
                  <p>• ✅ Verify all migration files were run successfully</p>
                  <p>• ✅ Contact admin if the problem persists</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="card p-8 mb-8 animate-slide-up">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
              } ${(isDatabaseSetupError || isRLSError) ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={!(isDatabaseSetupError || isRLSError) ? handleDrag : undefined}
            onDragLeave={!(isDatabaseSetupError || isRLSError) ? handleDrag : undefined}
            onDragOver={!(isDatabaseSetupError || isRLSError) ? handleDrag : undefined}
            onDrop={!(isDatabaseSetupError || isRLSError) ? handleDrop : undefined}
          >
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".xlsx,.xls,.csv,.jpg,.jpeg,.png,.zip,.pdf"
              disabled={isDatabaseSetupError || isRLSError}
            />
            
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                <UploadIcon className="h-8 w-8 text-primary-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDatabaseSetupError
                    ? 'Database Setup Required'
                    : isRLSError
                      ? 'Permission Issue - Check RLS Policies'
                      : 'Drop files here or click to upload'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {isDatabaseSetupError
                    ? 'Run the database migration to enable file uploads'
                    : isRLSError
                      ? 'Fix row-level security policies to enable uploads'
                      : 'Support for Excel, CSV, images, and ZIP files up to 50MB'
                  }
                </p>
                
                {!(isDatabaseSetupError || isRLSError) && (
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">Excel (.xlsx, .xls)</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">CSV (.csv)</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">Images (.jpg, .png)</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">Archive (.zip)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>        {/* Upload Guidelines */}
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
              {(profile?.role === 'admin' || profile?.role === 'manager') && !isDatabaseSetupError && (
                <p className="text-sm text-gray-600">Showing all team uploads</p>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{uploadedFiles.length} files</span>
              <span>•</span>
              <span>{uploadedFiles.reduce((total, file) => total + file.size, 0).toFixed(1)} MB</span>
            </div>
          </div>

          {error && !isDatabaseSetupError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isDatabaseSetupError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Database Setup Required</h3>
              <p className="text-gray-600">Complete the database migration to see uploaded files</p>
            </div>
          ) : uploadedFiles.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
              <p className="text-gray-600">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
                  {uploadedFiles.map((file) => (
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
                            <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                            {file.metadata?.uploadedBy && (
                              <>
                                <span>•</span>
                                <span>by {file.metadata.uploadedBy}</span>
                              </>
                            )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                        {file.status === 'completed' && file.url && (
                      <>
                            <button
                              onClick={() => window.open(file.url!, '_blank')}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                          <Eye className="h-4 w-4" />
                        </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                          <Download className="h-4 w-4" />
                            </a>
                      </>
                    )}
                    <button 
                          onClick={() => handleDeleteFile(file.id)}
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