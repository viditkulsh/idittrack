# Quick Setup Guide for File Uploads

## ✅ Current Status
Your file upload system is now ready! The **template download works immediately** - no database setup required.

## 🚀 To Enable Full File Upload Functionality

### Step 1: Run Database Migration
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run these files **in order**:

```sql
-- File 1: database/migrations/step1_create_table.sql
-- Copy and paste the contents, then execute

-- File 2: database/migrations/step2_add_policies.sql  
-- Copy and paste the contents, then execute

-- File 3: database/migrations/step3_advanced_features.sql
-- Copy and paste the contents, then execute

-- File 4: database/migrations/step4_storage_setup.sql
-- Copy and paste the contents, then execute
```

### Step 2: Test the Setup
1. Refresh your upload page
2. The yellow warning should disappear
3. You can now upload files and see real-time updates

## 🎯 What Works Right Now (Without Database)
- ✅ **Download Template** - Get a comprehensive CSV template
- ✅ **Template Instructions** - Detailed field explanations  
- ✅ **User Interface** - Complete upload interface
- ✅ **Error Handling** - Clear setup instructions

## 🎯 What Works After Database Setup
- ✅ **File Uploads** - Drag & drop or click to upload
- ✅ **Real-time Updates** - See files appear instantly
- ✅ **User-specific Files** - Each user sees their own uploads
- ✅ **Admin View** - Admins/managers see all team uploads
- ✅ **File Management** - View, download, delete files
- ✅ **Secure Storage** - Files stored with proper permissions

## 📝 Template Features
The downloadable template includes:
- **Sample Data** - 3 realistic product examples
- **Field Instructions** - Comments explaining each field
- **Validation Rules** - Proper format requirements
- **Date-stamped Filename** - Organized downloads

### 📂 Category Information
The template includes these **exact categories** that match your database:

| **Category** | **Used in Template** | **Database Match** |
|--------------|---------------------|-------------------|
| Electronics | ✅ Sample Product 1 | ✅ Available |
| Clothing | ✅ Sample Product 2 | ✅ Available |
| Home & Garden | ✅ Sample Product 3 | ✅ Available |
| Books | ⚪ Not in template | ✅ Available |

**Important:** Use these **exact category names** in your CSV:
- `Electronics` (for electronic devices and accessories)
- `Clothing` (for apparel and fashion items)  
- `Home & Garden` (for home improvement and gardening supplies)
- `Books` (for books and publications)

### 📋 Complete Field Reference
| **Field** | **Required** | **Format** | **Example** |
|-----------|-------------|------------|-------------|
| SKU | ✅ Yes | Text, unique | `PROD-001` |
| Product Name | ✅ Yes | Text | `Premium Laptop` |
| Category | ✅ Yes | **Exact match** | `Electronics` |
| Brand | ✅ Yes | Text | `TechBrand` |
| Selling Price | ✅ Yes | Decimal | `299.99` |
| Cost Price | ✅ Yes | Decimal | `199.99` |
| Weight (kg) | ✅ Yes | Decimal | `1.5` |
| Description | ⚪ Optional | Text | `High-quality device...` |
| Stock Quantity | ✅ Yes | Whole number | `100` |
| Reorder Level | ✅ Yes | Whole number | `20` |
| Status | ✅ Yes | `active`, `inactive`, `discontinued` | `active` |

### ⚠️ Category Validation
- **Case Sensitive**: Use exact capitalization (`Electronics`, not `electronics`)
- **No Variations**: Don't use `Electronic`, `Home&Garden`, etc.
- **Database Match**: Categories must exist in your database first
- **Custom Categories**: Add new categories through the admin panel before importing

## 🔒 Security Features
- Row Level Security (RLS) policies
- User-specific file access
- Role-based permissions
- Secure file storage in Supabase Storage

## 🛠️ Troubleshooting

### General Issues
- **Template not downloading?** Check browser popup blockers
- **Yellow warning persists?** Verify all migration files were run
- **Upload not working?** Check file size (max 50MB) and format

### 🚨 Row-Level Security (RLS) Errors
**Error:** `new row violates row-level security policy`

**Quick Fix:**
1. **Run the troubleshooting script:**
   - Go to Supabase SQL Editor
   - Run `database/migrations/troubleshoot_rls.sql`
   - This will check and fix RLS policies

2. **Check your authentication:**
   - ✅ Ensure you're logged in to the application
   - ✅ Verify your user profile exists in database
   - ✅ Try logging out and back in

3. **Verify database setup:**
   - ✅ All 4 migration files were run successfully
   - ✅ `file_uploads` table exists
   - ✅ RLS policies are properly created

**Advanced Fix (if above doesn't work):**
```sql
-- Temporarily disable RLS for testing (run in Supabase SQL Editor)
ALTER TABLE public.file_uploads DISABLE ROW LEVEL SECURITY;

-- Test file upload, then re-enable RLS:
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
```

### Category-Specific Issues
- **"Category not found" error?** 
  - ✅ Use exact spelling: `Electronics`, `Clothing`, `Home & Garden`, `Books`
  - ✅ Check capitalization (case-sensitive)
  - ✅ No extra spaces before/after category name
  - ✅ Don't use variations like `Electronic` or `Cloths`

- **Product import fails?**
  - ✅ Ensure categories exist in database before importing
  - ✅ Download fresh template to get latest category format
  - ✅ Verify CSV encoding (UTF-8 recommended)

- **Custom categories needed?**
  - ✅ Add categories through admin panel first
  - ✅ Use exact names when importing products
  - ✅ Contact admin to add new categories

### Storage Issues
- **"Storage permission denied"?**
  - ✅ Run `database/migrations/step4_storage_setup.sql` again
  - ✅ Check if storage bucket `file-uploads` exists
  - ✅ Verify storage policies in Supabase dashboard

## 📞 Need Help?
The upload page will show clear instructions if the database isn't set up yet. The template download works immediately for testing!
