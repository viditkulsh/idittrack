import React, { useState } from 'react';
import { 
  Folder, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle,
  FolderOpen,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { useCategories } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { RoleGate } from '../components/PermissionGate';

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  tenant_id: string | null;
  children?: Category[];
}

const CategoryManagement = () => {
  const { user, profile } = useAuth();
  const { categories, loading, error, addCategory, updateCategory, deleteCategory, refetch } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  // Build hierarchical category tree
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    
    // Initialize map with all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootCategories: Category[] = [];

    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  };

  const categoryTree = buildCategoryTree(categories);

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || ''
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (showEditModal && selectedCategory) {
        // Update category
        const { error } = await updateCategory(selectedCategory.id, formData);
        if (error) {
          alert('Error updating category: ' + error);
          return;
        }
      } else {
        // Add new category
        const { error } = await addCategory(formData);
        if (error) {
          alert('Error adding category: ' + error);
          return;
        }
      }

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedCategory(null);
      refetch();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also remove all subcategories.`)) {
      try {
        const { error } = await deleteCategory(category.id);
        if (error) {
          alert('Error deleting category: ' + error);
        } else {
          refetch();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (categories: Category[], level: number = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="mb-2">
        <div 
          className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors ${
            level > 0 ? 'ml-' + (level * 6) : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            {category.children && category.children.length > 0 && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight 
                  className={`h-4 w-4 transform transition-transform ${
                    expandedCategories.has(category.id) ? 'rotate-90' : ''
                  }`} 
                />
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              {category.children && category.children.length > 0 ? (
                expandedCategories.has(category.id) ? 
                  <FolderOpen className="h-5 w-5 text-blue-500" /> : 
                  <Folder className="h-5 w-5 text-blue-500" />
              ) : (
                <Folder className="h-5 w-5 text-gray-500" />
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-xs text-gray-500">{category.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RoleGate roles={['admin']}>
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="Edit Category"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Delete Category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </RoleGate>
          </div>
        </div>

        {category.children && 
         category.children.length > 0 && 
         expandedCategories.has(category.id) && 
         renderCategoryTree(category.children, level + 1)
        }
      </div>
    ));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to manage categories</h2>
        </div>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can manage categories</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
              <p className="text-gray-600">Organize your products with hierarchical categories</p>
            </div>
            <RoleGate roles={['admin']}>
              <button
                onClick={handleAdd}
                className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </button>
            </RoleGate>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Root Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => !cat.parent_id).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Folder className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subcategories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => cat.parent_id).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Display */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Categories</h3>
          </div>
          
          <div className="p-6">
            {searchTerm ? (
              // Flat list when searching
              <div className="space-y-3">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Folder className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RoleGate roles={['admin']}>
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </RoleGate>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Hierarchical tree view
              <div>
                {categoryTree.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                    <p className="text-gray-600">Create your first category to organize your products</p>
                    <RoleGate roles={['admin']}>
                      <button
                        onClick={handleAdd}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Category
                      </button>
                    </RoleGate>
                  </div>
                ) : (
                  renderCategoryTree(categoryTree)
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {showEditModal ? 'Edit Category' : 'Add New Category'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.parent_id}
                      onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    >
                      <option value="">None (Root Category)</option>
                      {categories
                        .filter(cat => showEditModal ? cat.id !== selectedCategory?.id : true)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {showEditModal ? 'Update' : 'Add'} Category
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        resetForm();
                        setSelectedCategory(null);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
