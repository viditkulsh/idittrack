# CSV Import Feature - User Guide

## Overview
The CSV Import feature allows you to bulk import products, inventory, and orders into your Idittrack system. The system automatically detects the type of CSV file and processes the data accordingly.

## Supported CSV Types

### 1. Products CSV
**Required Headers:** `sku`, `name`, `selling_price`, `cost_price`  
**Optional Headers:** `description`, `category`, `weight_kg`, `status`

**Example:**
```csv
sku,name,description,category,selling_price,cost_price,weight_kg,status
PROD001,Wireless Headphones,"Bluetooth headphones",Electronics,99.99,65.00,0.45,active
PROD002,Office Chair,"Ergonomic chair",Furniture,299.99,180.00,15.50,active
```

### 2. Inventory CSV
**Required Headers:** `sku`, `quantity`  
**Optional Headers:** `location`, `minimum_stock`, `maximum_stock`, `reorder_level`

**Example:**
```csv
sku,location,quantity,minimum_stock,maximum_stock,reorder_level
PROD001,,50,10,100,15
PROD002,,25,5,50,10
```

### 3. Orders CSV
**Required Headers:** `customer_name`, `customer_email`, `product_sku`, `quantity`  
**Optional Headers:** `unit_price`, `status`, `notes`

**Example:**
```csv
customer_name,customer_email,product_sku,quantity,unit_price,status,notes
John Doe,john@email.com,PROD001,2,99.99,pending,Express shipping
Jane Smith,jane@email.com,PROD002,1,299.99,completed,Paid by card
```

## How to Use

1. **Download Templates**: Use the dropdown in the Upload section to download CSV templates
2. **Fill Your Data**: Replace sample data with your actual product/inventory/order information
3. **Upload CSV File**: Drag and drop or click to upload your CSV file
4. **View Results**: The system will show import results with success/failure counts

## Import Rules

### Products
- SKU must be unique
- Selling price and cost price are required (numbers only)
- Category must exist in your system (case-sensitive)
- Status options: `active`, `inactive`, `discontinued`

### Inventory
- Product SKU must exist in your system
- Quantity must be a whole number (0 or positive)
- If no location specified, uses default location
- Stock levels are optional but must be whole numbers

### Orders
- Customer name and email are required
- Product SKU must exist in your system
- Quantity must be a positive whole number
- Unit price defaults to product's selling price if not specified
- Status options: `pending`, `processing`, `completed`, `cancelled`

## Error Handling

The system provides detailed error messages for:
- Missing required fields
- Invalid data formats
- Non-existent products/categories
- Duplicate SKUs
- Database connection issues

## Tips for Success

1. **Use Templates**: Always start with downloaded templates
2. **Check Data**: Ensure products/categories exist before importing inventory/orders
3. **Format Numbers**: Use decimal format for prices (e.g., 29.99)
4. **Avoid Special Characters**: Remove extra spaces and special characters
5. **Test Small Batches**: Import a few records first to verify format

## Troubleshooting

**Common Issues:**
- **Category not found**: Ensure category exists and spelling matches exactly
- **Product not found**: Verify SKU exists in products table
- **Invalid price**: Check for non-numeric characters in price fields
- **Duplicate SKU**: Each product SKU must be unique

**Database Setup:**
If you see "Database Setup Required" error, run the migration files in your Supabase dashboard as instructed in the UI.

## File Limits

- Maximum file size: 50MB
- Supported formats: CSV (.csv)
- Encoding: UTF-8 recommended

## Processing Status

- **Uploading**: File is being uploaded to storage
- **Processing**: CSV data is being parsed and imported
- **Completed**: Import finished successfully
- **Failed**: Import encountered errors (check error details)
