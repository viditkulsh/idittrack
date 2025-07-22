import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  url: string | null
  uploaded_by: string
  file_path: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export const useUploads = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUploads()
      
      // Set up real-time subscription for file uploads
      const subscription = supabase
        .channel('file_uploads')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'file_uploads',
            filter: profile?.role === 'admin' || profile?.role === 'manager' 
              ? undefined 
              : `uploaded_by=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update:', payload)
            handleRealtimeUpdate(payload)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, profile])

  const fetchUploads = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('file_uploads')
        .select('*')
        .order('created_at', { ascending: false })

      // If user is not admin/manager, only show their uploads
      if (profile?.role !== 'admin' && profile?.role !== 'manager') {
        query = query.eq('uploaded_by', user?.id)
      }

      const { data, error } = await query

      if (error) throw error
      setUploadedFiles(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setUploadedFiles(prev => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev]
        case 'UPDATE':
          return prev.map(file => 
            file.id === newRecord.id ? newRecord : file
          )
        case 'DELETE':
          return prev.filter(file => file.id !== oldRecord.id)
        default:
          return prev
      }
    })
  }

  const uploadFile = async (file: File, metadata: any = {}) => {
    try {
      const fileId = crypto.randomUUID()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `uploads/${user?.id}/${fileName}`

      // Create file record first
      const fileRecord = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
        status: 'uploading' as const,
        uploaded_by: user?.id,
        file_path: filePath,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      }

      const { data: uploadRecord, error: dbError } = await supabase
        .from('file_uploads')
        .insert([fileRecord])
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        
        // Handle specific RLS error
        if (dbError.message?.includes('row-level security policy')) {
          throw new Error('Permission denied: Please ensure you are logged in and have proper access rights. Contact admin if issue persists.')
        }
        
        // Handle other common errors
        if (dbError.message?.includes('duplicate key')) {
          throw new Error('File with this name already exists. Please rename and try again.')
        }
        
        throw dbError
      }

      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('file-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) {
        console.error('Storage upload error:', storageError)
        // Update record to failed status
        await supabase
          .from('file_uploads')
          .update({ status: 'failed' })
          .eq('id', fileId)
        
        if (storageError.message?.includes('row-level security policy')) {
          throw new Error('Storage permission denied: Please contact admin to check storage policies.')
        }
        
        throw storageError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('file-uploads')
        .getPublicUrl(filePath)

      // Update record with success status and URL
      const { error: updateError } = await supabase
        .from('file_uploads')
        .update({ 
          status: 'completed',
          url: urlData.publicUrl,
          file_path: storageData.path
        })
        .eq('id', fileId)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      return { success: true, data: uploadRecord }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed')
      return { success: false, error: err.message || 'Upload failed' }
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      // Get file details first
      const { data: fileData, error: fetchError } = await supabase
        .from('file_uploads')
        .select('file_path')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage if file_path exists
      if (fileData.file_path) {
        const { error: storageError } = await supabase.storage
          .from('file-uploads')
          .remove([fileData.file_path])

        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError)
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const generateTemplate = () => {
    // Create a comprehensive Excel template data with all required fields
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
      },
      {
        'SKU': 'PROD-002',
        'Product Name': 'Premium Clothing Item',
        'Category': 'Clothing',
        'Brand': 'FashionCorp',
        'Selling Price': '79.99',
        'Cost Price': '45.00',
        'Weight (kg)': '0.3',
        'Description': 'Comfortable and stylish clothing for everyday wear',
        'Stock Quantity': '50',
        'Reorder Level': '10',
        'Status': 'active'
      },
      {
        'SKU': 'PROD-003',
        'Product Name': 'Home & Garden Tool',
        'Category': 'Home & Garden',
        'Brand': 'HomeTools',
        'Selling Price': '24.99',
        'Cost Price': '15.50',
        'Weight (kg)': '0.8',
        'Description': 'Essential tool for home and garden maintenance',
        'Stock Quantity': '75',
        'Reorder Level': '15',
        'Status': 'active'
      }
    ]

    return templateData
  }

  const downloadTemplate = () => {
    const templateData = generateTemplate()
    
    // Convert to CSV with detailed headers and instructions
    const headers = Object.keys(templateData[0])
    const instructions = [
      '# PRODUCT IMPORT TEMPLATE - IDITTRACK',
      '# IMPORTANT: Use EXACT category names as shown below',
      '#',
      '# CATEGORIES (case-sensitive, use exactly as written):',
      '# - Electronics (for electronic devices and accessories)',
      '# - Clothing (for apparel and fashion items)',
      '# - Home & Garden (for home improvement and gardening)',
      '# - Books (for books and publications)',
      '#',
      '# INSTRUCTIONS:',
      '# 1. Fill in your product data starting from row 13',
      '# 2. Required fields: SKU, Product Name, Category, Selling Price, Cost Price',
      '# 3. SKU must be unique for each product',
      '# 4. Prices should be in decimal format (e.g., 29.99)',
      '# 5. Weight should be in kilograms (decimal format)',
      '# 6. Status options: active, inactive, discontinued',
      '# 7. Stock Quantity and Reorder Level must be whole numbers',
      '# 8. Category MUST match exactly (case-sensitive)',
      '# 9. Save as CSV when uploading to the system',
      '#',
      '',
      headers.join(','),
      ...templateData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ]

    const csvContent = instructions.join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `product-import-template-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return {
    uploadedFiles,
    loading,
    error,
    uploadFile,
    deleteFile,
    downloadTemplate,
    generateTemplate,
    refetch: fetchUploads
  }
}
