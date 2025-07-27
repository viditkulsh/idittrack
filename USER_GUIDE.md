# 📋 IditTrack Complete User & Developer Guide

## 🎯 **Overview**
This comprehensive guide covers everything you need to know about using and managing your IditTrack inventory management system.

---

## 🚀 **Quick Start**

### **System Requirements**
- Node.js 18+ 
- Supabase account
- Modern web browser

### **Running the Application**
```bash
npm install
npm run dev
```
Your app will be available at `http://localhost:5174`

---

## 🛍️ **Product Management**

### **Add New Products**
1. Navigate to **Products** page
2. Click **"Add Product"** (Admin/Manager only)
3. Fill in product details:
   - SKU, Name, Description
   - Category, Pricing, Weight
   - Initial stock quantity and reorder point
4. Click **"Add Product"**

### **Manage Existing Products**
- **Search**: Use the search bar to find products by name or SKU
- **Filter**: Filter by category using the dropdown
- **Edit**: Click the "Edit" button on any product card
- **Delete**: Click the "Delete" button (Admin/Manager only)

### **Stock Level Indicators**
- 🟢 **Green**: Good stock (>10 units)
- 🟡 **Yellow**: Low stock (1-10 units)  
- 🔴 **Red**: Out of stock (0 units)

---

## 📋 **Order Management**

### **Create New Orders**
1. Navigate to **Orders** page
2. Click **"Create Order"** (Admin/Manager only)
3. Select order type (Sale, Purchase, Transfer, Return)
4. Add products and quantities
5. Review totals and submit

### **Order Status Workflow**
1. **🟡 Pending**: Order created, awaiting processing
2. **🔵 Processing**: Order being prepared
3. **🟣 Shipped**: Order dispatched
4. **🟢 Delivered**: Order completed
5. **🔴 Cancelled**: Order cancelled

### **Track Orders**
- Search by order number
- Filter by status
- Click on any order to view details
- Update status as needed (Admin/Manager only)

---

## 📦 **Inventory Management**

### **View Inventory**
- Navigate to **Inventory** page
- See real-time stock levels across all locations
- View low stock alerts
- Track inventory movements

### **Inventory Operations**
- **Add Inventory**: Create new inventory items
- **Adjust Stock**: Modify quantities with reason tracking
- **Transfer Stock**: Move inventory between locations
- **View History**: Complete audit trail of all movements

### **Multi-Location Support**
- Track inventory across warehouses, stores, etc.
- Transfer stock between locations
- Location-specific reporting

---

## 🏢 **Location Management**

### **Manage Locations**
1. Navigate to **Inventory → Locations**
2. Add warehouses, stores, distribution centers
3. Include address and contact information
4. Assign inventory to specific locations

---

## 🔐 **User Roles & Permissions**

### **👑 Admin Users**
- **Full Access**: All features and operations
- **User Management**: Add/edit/delete users
- **System Settings**: Configure categories, locations
- **Analytics**: View all reports and data

### **👔 Manager Users**  
- **Inventory Control**: Full CRUD on products and inventory
- **Order Management**: Create, update, view orders
- **Team Oversight**: View team member activities
- **Limited Admin**: Some user management functions

### **👤 Standard Users**
- **View Access**: Read-only access to inventory and orders
- **Order Creation**: Place new orders (if permitted)
- **Personal Profile**: Edit own profile and settings

---

## 🔧 **Troubleshooting**

### **Missing Add/Create Buttons**

**Problem**: Admin/Manager users can't see "Add Product" or "Create Order" buttons

**Solution**: The system includes fallback logic for admin/manager users. If buttons still don't appear:

1. **Check your user role**:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@domain.com';
   ```

2. **Verify permissions** (optional - run the database permission script):
   - Use `database/quick_permission_fix.sql` for complete RBAC setup
   - Or use `database/safe_permission_assignment.sql` for minimal setup

3. **Clear browser cache** and refresh the page

### **Permission Errors**
- Ensure your user has the correct role assigned
- Contact an admin to verify your permissions
- Check that you're logged in with the correct account

### **Database Setup**
If you need to set up permissions from scratch:
1. Run `database/enhanced_rbac_system.sql` first
2. Then run `database/safe_permission_assignment.sql`
3. Update user roles as needed

---

## 💡 **Best Practices**

### **Product Management**
- Use unique, meaningful SKUs
- Keep product descriptions detailed and current
- Set appropriate reorder levels to avoid stockouts
- Regularly audit and update pricing

### **Order Management**
- Use clear, sequential order numbering
- Keep order status updated for customer communication
- Review order pipeline regularly
- Document any special handling requirements

### **Inventory Control**
- Perform regular cycle counts
- Set realistic reorder points based on demand
- Use the movement history for auditing
- Monitor low stock alerts daily

### **Security**
- Use strong passwords
- Log out when finished
- Don't share user accounts
- Report any suspicious activity

---

## 📊 **Key Features Summary**

### **✅ What IditTrack Provides**
- **Complete Product Management**: Full CRUD with inventory integration
- **Order Lifecycle Management**: From creation to delivery
- **Multi-Location Inventory**: Track stock across multiple sites
- **Role-Based Security**: Granular permission control
- **Real-Time Updates**: Live inventory and order status
- **Audit Trails**: Complete history of all changes
- **Low Stock Alerts**: Automated inventory warnings
- **Responsive Design**: Works on desktop, tablet, mobile

### **🎯 Business Benefits**
- **Reduced Stockouts**: Automated reorder alerts
- **Improved Accuracy**: Real-time inventory tracking
- **Better Security**: Role-based access control
- **Enhanced Efficiency**: Streamlined workflows
- **Complete Visibility**: Full audit trails
- **Scalable Solution**: Grows with your business

---

## 🆘 **Getting Help**

### **Common Questions**
- **Q: Can I change my role?** A: Contact an admin user
- **Q: How do I reset my password?** A: Use the login page "Forgot Password" link
- **Q: Why can't I see certain features?** A: Check your user role and permissions
- **Q: How do I add a new location?** A: Admin/Manager users can add locations in Inventory section

### **Technical Support**
- Check the browser console for any error messages
- Try refreshing the page or clearing cache
- Contact your system administrator
- Report bugs with specific steps to reproduce

---

## 🎉 **Success!**

Your IditTrack system is now ready for production use with:
- ✅ Complete inventory management
- ✅ Full order processing capabilities  
- ✅ Secure role-based access
- ✅ Real-time tracking and alerts
- ✅ Professional user interface

**Happy tracking! 🚀**
