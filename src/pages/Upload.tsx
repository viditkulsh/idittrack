import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Database,
  Package,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';
import { useUploads } from '../hooks/useUploads';
import { useAuth } from '../contexts/AuthContext';
import CSVImportResults from '../components/CSVImportResults';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [csvType, setCsvType] = useState<string>('');
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const { user, profile } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false);
      }
    };

    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadDropdown]);

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
      const result = await uploadFile(file, {
        uploadedBy: user?.email,
        userRole: profile?.role
      });

      // Show import results for CSV files
      if (result?.processingResult && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
        const processingResult = {
          ...result.processingResult,
          csvType: result.processingResult.csvType || 'CSV'
        };
        setImportResults(processingResult);
        setCsvType(processingResult.csvType);
        setShowImportResults(true);
      }
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

  const downloadInventoryTemplate = () => {
    const csvContent = [
      '# INVENTORY IMPORT TEMPLATE',
      '# Fill in your inventory data and save as CSV',
      '# SKU must match existing products in your system',
      '',
      'sku,location,quantity,reorder_level',
      'PROD001,,50,15',
      'PROD002,,25,10',
      'PROD003,,75,25'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-template-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadOrdersTemplate = () => {
    const csvContent = [
      '# ORDERS IMPORT TEMPLATE',
      '# Fill in your order data and save as CSV',
      '# Product SKU must match existing products in your system',
      '',
      'customer_name,customer_email,product_sku,quantity,unit_price,status,notes',
      'John Doe,john.doe@email.com,PROD001,2,99.99,pending,Customer notes here',
      'Jane Smith,jane.smith@email.com,PROD002,1,299.99,completed,Order completed',
      'Bob Johnson,bob.johnson@email.com,PROD003,3,24.99,processing,Processing order'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-template-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV Data Import</h1>
              <p className="text-gray-600">Upload CSV files for automatic processing and data import</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="relative inline-block group" ref={dropdownRef}>
                <button
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 border border-blue-500"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-white/10 rounded-lg">
                      <Download className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-white">Download Templates</span>
                    <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${showDownloadDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                </button>

                {/* Custom Dropdown Menu */}
                {showDownloadDropdown && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                        Choose Template Type
                      </div>

                      <button
                        onClick={() => {
                          handleDownloadTemplate();
                          setShowDownloadDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                      >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Products Template</div>
                          <div className="text-sm text-gray-500">SKU, Name, Price, Categories</div>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </button>

                      <button
                        onClick={() => {
                          downloadInventoryTemplate();
                          setShowDownloadDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Inventory Template</div>
                          <div className="text-sm text-gray-500">SKU, Quantity, Stock Levels</div>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </button>

                      <button
                        onClick={() => {
                          downloadOrdersTemplate();
                          setShowDownloadDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <ShoppingCart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Orders Template</div>
                          <div className="text-sm text-gray-500">Customer, Products, Quantities</div>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                    </div>

                    <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 border-t">
                      💡 Templates include sample data to guide your imports
                    </div>
                  </div>
                )}
              </div>
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
        <div className="card p-6 mb-8 animate-slide-up">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
              ? 'border-blue-400 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
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
              accept=".csv"
              disabled={isDatabaseSetupError || isRLSError}
            />
            
            <div className="space-y-6">
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-lg">
                <UploadIcon className={`h-10 w-10 transition-colors duration-300 ${dragActive ? 'text-blue-700' : 'text-blue-600'}`} />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {isDatabaseSetupError
                    ? 'Database Setup Required'
                    : isRLSError
                      ? 'Permission Issue - Check RLS Policies'
                      : dragActive
                        ? 'Drop your CSV files here!'
                        : 'Upload Your CSV Data'
                  }
                </h3>

                {!(isDatabaseSetupError || isRLSError) && (
                  <>
                    <p className="text-gray-600 mb-4 text-lg">
                      Drag & drop CSV files here or <span className="text-blue-600 font-semibold">click to browse</span>
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">✨ Auto-Detection Feature</h4>
                      <p className="text-sm text-blue-700">
                        CSV files are automatically processed! Just upload and we'll detect if it's products, inventory, or orders data.
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Maximum file size: 50MB per file
                    </p>
                  </>
                )}

                {isDatabaseSetupError && (
                  <p className="text-amber-600 mb-4">
                    Run the database migration to enable file uploads
                  </p>
                )}

                {isRLSError && (
                  <p className="text-red-600 mb-4">
                    Fix row-level security policies to enable uploads
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Feature Guidelines */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 animate-slide-up border-l-4 border-l-blue-500" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Auto CSV Import</h3>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Smart Detection</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Upload CSV files and let our smart system automatically detect the data type and import everything for you.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span><strong>Products:</strong> SKU, Name, Price required</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span><strong>Inventory:</strong> SKU, Quantity required</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span><strong>Orders:</strong> Customer info, Product SKU required</span>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-slide-up border-l-4 border-l-green-500" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Data Validation</h3>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Error Checking</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Advanced validation ensures data integrity with detailed error reporting and success metrics.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Required field validation</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>Data format checking</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span>Real-time import feedback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <File className="h-5 w-5 mr-2 text-gray-600" />
                File Management
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {(profile?.role === 'admin' || profile?.role === 'manager') && !isDatabaseSetupError
                  ? 'Manage all team uploads and downloads'
                  : 'View and manage your uploaded files'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm">
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-blue-700 font-medium">{uploadedFiles.length}</span>
                  <span className="text-blue-600 ml-1">files</span>
                </div>
                <div className="bg-green-50 px-3 py-1 rounded-full">
                  <span className="text-green-700 font-medium">{uploadedFiles.reduce((total, file) => total + file.size, 0).toFixed(1)}</span>
                  <span className="text-green-600 ml-1">MB</span>
                </div>
              </div>
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
              <div className="text-center py-16">
                <div className="mx-auto flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <File className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
                <p className="text-gray-600 mb-4">Start by uploading your first file or CSV data</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      input?.click();
                    }}
                    className="btn-primary text-sm"
                  >
                    Choose Files
                  </button>
                  <select
                    onChange={(e) => {
                      if (e.target.value === 'products') handleDownloadTemplate();
                      if (e.target.value === 'inventory') downloadInventoryTemplate();
                      if (e.target.value === 'orders') downloadOrdersTemplate();
                      e.target.value = '';
                    }}
                    className="btn-secondary text-sm pr-8 appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Get Template</option>
                    <option value="products">Products CSV</option>
                    <option value="inventory">Inventory CSV</option>
                    <option value="orders">Orders CSV</option>
                  </select>
                </div>
            </div>
          ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                      className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {getStatusIcon(file.status)}
                              <span className="ml-1.5 capitalize">{file.status}</span>
                        </span>
                      </div>

                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="font-medium">{formatFileSize(file.size)}</span>
                        <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                            {file.metadata?.uploadedBy && (
                              <>
                                <span>•</span>
                                <span>by {file.metadata.uploadedBy}</span>
                              </>
                            )}
                      </div>

                          {file.metadata?.processingResult && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                              <Database className="h-3 w-3 mr-1" />
                              <span className="font-medium">
                                {file.metadata.processingResult.csvType} CSV
                              </span>
                              <span className="ml-1">
                                - {file.metadata.processingResult.successfulRows}/{file.metadata.processingResult.totalRows} imported
                              </span>
                            </div>
                          )}
                    </div>
                  </div>

                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {file.status === 'completed' && file.url && (
                      <>
                            <button
                              onClick={() => window.open(file.url!, '_blank')}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Preview file"
                            >
                          <Eye className="h-4 w-4" />
                        </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                              title="Download file"
                            >
                          <Download className="h-4 w-4" />
                            </a>
                      </>
                    )}
                    <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete file"
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

        {/* CSV Import Results Modal */}
        {showImportResults && (
          <CSVImportResults
            result={importResults}
            csvType={csvType}
            onClose={() => {
              setShowImportResults(false);
              setImportResults(null);
              setCsvType('');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Upload;