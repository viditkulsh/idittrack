# File Upload Setup Instructions

## Database Setup

To enable file uploads in your application, you need to run the database migration to create the required tables and storage bucket.

### 1. Run the Migration

Execute the following SQL in your Supabase SQL editor:

```sql
-- You can copy and paste from: database/migrations/create_file_uploads_table.sql
```

### 2. Configure Storage

The migration will automatically:
- Create a `file-uploads` storage bucket
- Set up Row Level Security (RLS) policies
- Configure user permissions for file access

### 3. Environment Variables

Make sure your `.env` file has the required Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Implemented

### ✅ Template Download
- Click "Download Template" to get a comprehensive CSV template
- Includes sample data and detailed instructions
- Template includes all required fields for product import

### ✅ User-Specific Uploads
- Each user sees only their own uploaded files
- Admins and managers can view all team uploads
- Real-time updates when files are uploaded/deleted

### ✅ Real-Time Updates
- Files appear instantly when uploaded by any team member
- Status updates show in real-time (uploading → completed)
- Live file list updates without page refresh

### ✅ File Management
- Upload multiple files via drag & drop or file picker
- Support for Excel (.xlsx), CSV, images, and ZIP files
- View, download, and delete uploaded files
- File metadata tracking (who uploaded, when, file size)

## How to Use

### For Regular Users:
1. **Download Template**: Click the "Download Template" button to get the CSV format
2. **Fill Template**: Add your product data following the provided examples
3. **Upload File**: Drag & drop your completed file or click to browse
4. **Monitor Progress**: Watch real-time upload status and completion
5. **Manage Files**: View, download, or delete your uploaded files

### For Admins/Managers:
- See all team uploads in the Recent Uploads section
- Monitor team file upload activity
- Manage any uploaded files across the organization

## File Format Requirements

### Product Import CSV Format:
- **SKU**: Unique product identifier
- **Product Name**: Full product name
- **Category**: Product category
- **Brand**: Manufacturer/brand name
- **Selling Price**: Retail price (decimal format)
- **Cost Price**: Your cost (decimal format)
- **Weight (kg)**: Product weight in kilograms
- **Description**: Product description
- **Stock Quantity**: Current inventory count
- **Reorder Level**: Minimum stock before reorder alert
- **Status**: active, inactive, or discontinued

### Supported File Types:
- **Spreadsheets**: .xlsx, .xls, .csv
- **Images**: .jpg, .jpeg, .png
- **Archives**: .zip
- **Documents**: .pdf
- **Maximum size**: 50MB per file

## Troubleshooting

### Common Issues:

1. **Upload fails**: Check file size (must be under 50MB)
2. **Permission denied**: Ensure you're logged in and have proper role
3. **Template not downloading**: Check browser popup blockers
4. **Files not appearing**: Refresh the page or check your internet connection

### Database Issues:

If uploads aren't working, verify:
1. Migration has been run successfully
2. Storage bucket exists and is public
3. RLS policies are properly configured
4. User has valid authentication token

## Security Notes

- Files are stored securely in Supabase Storage
- Users can only access their own files (unless admin/manager)
- All uploads are tracked with user metadata
- File paths are organized by user ID for isolation
- RLS policies prevent unauthorized access

## Next Steps

After setting up file uploads, you can:
1. Implement file processing for CSV imports
2. Add image optimization for product photos
3. Create automated workflows for file processing
4. Set up email notifications for upload completion
