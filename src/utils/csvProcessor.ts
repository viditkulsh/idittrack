import Papa from 'papaparse';
import { supabase } from '../lib/supabase';

export interface CSVProcessingResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  csvType?: string;
  data?: any[];
}

export interface ProductCSVRow {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  selling_price: string;
  cost_price: string;
  weight_kg?: string;
  status?: string;
}

export interface InventoryCSVRow {
  sku: string;
  location?: string;
  quantity: string;
  reorder_level?: string;
}

export interface OrderCSVRow {
  customer_name: string;
  customer_email: string;
  product_sku: string;
  quantity: string;
  unit_price?: string;
  status?: string;
  notes?: string;
}

// Utility function to parse CSV content
export function parseCSV<T>(csvContent: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data as T[]);
        }
      },
      error: (error: any) => reject(error)
    });
  });
}

// Process Products CSV
export async function processProductsCSV(csvContent: string): Promise<CSVProcessingResult> {
  try {
    const rows = await parseCSV<ProductCSVRow>(csvContent);
    const errors: string[] = [];
    const validRows: any[] = [];
    
    // Get existing categories for validation
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');
    
    const categoryMap = new Map(categories?.map(cat => [cat.name.toLowerCase(), cat.id]) || []);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because of header and 0-based index

      // Validate required fields
      if (!row.sku?.trim()) {
        errors.push(`Row ${rowNum}: SKU is required`);
        continue;
      }
      
      if (!row.name?.trim()) {
        errors.push(`Row ${rowNum}: Product name is required`);
        continue;
      }

      const sellingPrice = parseFloat(row.selling_price);
      const costPrice = parseFloat(row.cost_price);

      if (isNaN(sellingPrice) || sellingPrice < 0) {
        errors.push(`Row ${rowNum}: Invalid selling price`);
        continue;
      }

      if (isNaN(costPrice) || costPrice < 0) {
        errors.push(`Row ${rowNum}: Invalid cost price`);
        continue;
      }

      // Find category ID
      let categoryId = null;
      if (row.category?.trim()) {
        categoryId = categoryMap.get(row.category.toLowerCase().trim());
        if (!categoryId) {
          errors.push(`Row ${rowNum}: Category "${row.category}" not found`);
          continue;
        }
      }

      const productData = {
        sku: row.sku.trim().toUpperCase(),
        name: row.name.trim(),
        description: row.description?.trim() || null,
        category_id: categoryId,
        selling_price: sellingPrice,
        cost_price: costPrice,
        weight_kg: row.weight_kg ? parseFloat(row.weight_kg) : null,
        status: row.status?.trim().toLowerCase() || 'active'
      };

      validRows.push(productData);
    }

    if (validRows.length === 0) {
      return {
        success: false,
        totalRows: rows.length,
        successfulRows: 0,
        failedRows: rows.length,
        errors: errors.length > 0 ? errors : ['No valid rows found']
      };
    }

    // Insert products in batches
    const batchSize = 100;
    let successfulRows = 0;
    const insertErrors: string[] = [];

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .insert(batch)
          .select();

        if (error) {
          if (error.message.includes('duplicate key')) {
            insertErrors.push(`Batch ${Math.floor(i/batchSize) + 1}: Some SKUs already exist`);
          } else {
            insertErrors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
          }
        } else {
          successfulRows += data?.length || 0;
        }
      } catch (err: any) {
        insertErrors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${err.message}`);
      }
    }

    return {
      success: successfulRows > 0,
      totalRows: rows.length,
      successfulRows,
      failedRows: rows.length - successfulRows,
      errors: [...errors, ...insertErrors],
      csvType: 'products',
      data: validRows
    };

  } catch (error: any) {
    return {
      success: false,
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      errors: [`Processing error: ${error.message}`]
    };
  }
}

// Process Inventory CSV
export async function processInventoryCSV(csvContent: string): Promise<CSVProcessingResult> {
  try {
    const rows = await parseCSV<InventoryCSVRow>(csvContent);
    const errors: string[] = [];
    const validRows: any[] = [];

    // Get existing products and locations
    const [productsResult, locationsResult] = await Promise.all([
      supabase.from('products').select('id, sku'),
      supabase.from('locations').select('id, name')
    ]);

    const productMap = new Map(productsResult.data?.map(p => [p.sku.toLowerCase(), p.id]) || []);
    const locationMap = new Map(locationsResult.data?.map(l => [l.name.toLowerCase(), l.id]) || []);

    // Get default location if no locations specified
    const defaultLocation = locationsResult.data?.[0];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      if (!row.sku?.trim()) {
        errors.push(`Row ${rowNum}: SKU is required`);
        continue;
      }

      const productId = productMap.get(row.sku.toLowerCase().trim());
      if (!productId) {
        errors.push(`Row ${rowNum}: Product with SKU "${row.sku}" not found`);
        continue;
      }

      const quantity = parseInt(row.quantity);
      if (isNaN(quantity) || quantity < 0) {
        errors.push(`Row ${rowNum}: Invalid quantity`);
        continue;
      }

      let locationId = defaultLocation?.id;
      if (row.location?.trim()) {
        locationId = locationMap.get(row.location.toLowerCase().trim());
        if (!locationId) {
          errors.push(`Row ${rowNum}: Location "${row.location}" not found`);
          continue;
        }
      }

      const inventoryData = {
        product_id: productId,
        location_id: locationId,
        quantity: quantity,
        reorder_level: row.reorder_level ? parseInt(row.reorder_level) : null
      };

      validRows.push(inventoryData);
    }

    if (validRows.length === 0) {
      return {
        success: false,
        totalRows: rows.length,
        successfulRows: 0,
        failedRows: rows.length,
        errors: errors.length > 0 ? errors : ['No valid rows found']
      };
    }

    // Upsert inventory records
    const { data, error } = await supabase
      .from('inventory')
      .upsert(validRows, { 
        onConflict: 'product_id,location_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      return {
        success: false,
        totalRows: rows.length,
        successfulRows: 0,
        failedRows: rows.length,
        errors: [...errors, `Database error: ${error.message}`]
      };
    }

    return {
      success: true,
      totalRows: rows.length,
      successfulRows: data?.length || 0,
      failedRows: rows.length - (data?.length || 0),
      errors: errors,
      data: validRows
    };

  } catch (error: any) {
    return {
      success: false,
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      errors: [`Processing error: ${error.message}`]
    };
  }
}

// Process Orders CSV
export async function processOrdersCSV(csvContent: string, userId: string): Promise<CSVProcessingResult> {
  try {
    const rows = await parseCSV<OrderCSVRow>(csvContent);
    const errors: string[] = [];
    const processedOrders: any[] = [];

    // Get existing products
    const { data: products } = await supabase
      .from('products')
      .select('id, sku, selling_price');

    const productMap = new Map(products?.map(p => [p.sku.toLowerCase(), p]) || []);

    // Group rows by customer to create consolidated orders
    const orderGroups = new Map<string, any[]>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      if (!row.customer_name?.trim()) {
        errors.push(`Row ${rowNum}: Customer name is required`);
        continue;
      }

      if (!row.customer_email?.trim()) {
        errors.push(`Row ${rowNum}: Customer email is required`);
        continue;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.customer_email.trim())) {
        errors.push(`Row ${rowNum}: Invalid email format`);
        continue;
      }

      if (!row.product_sku?.trim()) {
        errors.push(`Row ${rowNum}: Product SKU is required`);
        continue;
      }

      const product = productMap.get(row.product_sku.toLowerCase().trim());
      if (!product) {
        errors.push(`Row ${rowNum}: Product with SKU "${row.product_sku}" not found`);
        continue;
      }

      const quantity = parseInt(row.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Row ${rowNum}: Invalid quantity`);
        continue;
      }

      const unitPrice = row.unit_price ? parseFloat(row.unit_price) : product.selling_price;
      if (isNaN(unitPrice) || unitPrice < 0) {
        errors.push(`Row ${rowNum}: Invalid unit price`);
        continue;
      }

      const customerKey = `${row.customer_name.trim()}_${row.customer_email.trim()}`;
      if (!orderGroups.has(customerKey)) {
        orderGroups.set(customerKey, []);
      }

      orderGroups.get(customerKey)!.push({
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
        notes: row.notes?.trim() || null,
        customer_name: row.customer_name.trim(),
        customer_email: row.customer_email.trim(),
        status: row.status?.trim().toLowerCase() || 'pending'
      });
    }

    // Create orders for each customer group
    for (const [, items] of orderGroups.entries()) {
      try {
        const firstItem = items[0];
        const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);
        
        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Create order record
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_details: {
              name: firstItem.customer_name,
              email: firstItem.customer_email
            },
            status: firstItem.status,
            subtotal: totalAmount,
            total_amount: totalAmount,
            notes: firstItem.notes,
            source: 'csv_import',
            created_by: userId
          })
          .select()
          .single();

        if (orderError) {
          errors.push(`Error creating order for ${firstItem.customer_name}: ${orderError.message}`);
          continue;
        }

        // Create order items
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          notes: item.notes
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          errors.push(`Error creating order items for ${firstItem.customer_name}: ${itemsError.message}`);
          continue;
        }

        processedOrders.push({
          order_number: orderNumber,
          customer: firstItem.customer_name,
          items_count: items.length,
          total_amount: totalAmount
        });

      } catch (error: any) {
        errors.push(`Error processing order for ${items[0]?.customer_name}: ${error.message}`);
      }
    }

    if (processedOrders.length === 0) {
      return {
        success: false,
        totalRows: rows.length,
        successfulRows: 0,
        failedRows: rows.length,
        errors: errors.length > 0 ? errors : ['No valid orders could be created']
      };
    }

    return {
      success: true,
      totalRows: rows.length,
      successfulRows: processedOrders.length,
      failedRows: rows.length - processedOrders.length,
      errors: errors,
      data: processedOrders
    };

  } catch (error: any) {
    return {
      success: false,
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      errors: [`Processing error: ${error.message}`]
    };
  }
}

// Detect CSV type based on headers
export function detectCSVType(csvContent: string): 'products' | 'inventory' | 'orders' | 'unknown' {
  const lines = csvContent.split('\n');
  if (lines.length === 0) return 'unknown';
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  // Check for product headers
  if (headers.includes('sku') && headers.includes('name') && headers.includes('selling_price')) {
    return 'products';
  }
  
  // Check for inventory headers
  if (headers.includes('sku') && headers.includes('quantity') && !headers.includes('customer_name')) {
    return 'inventory';
  }
  
  // Check for order headers
  if (headers.includes('customer_name') && headers.includes('customer_email') && headers.includes('product_sku')) {
    return 'orders';
  }
  
  return 'unknown';
}
