import React, { useState } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  MapPin,
  History,
  Settings
} from 'lucide-react'
import useInventoryManagement, { InventoryItem } from '../hooks/useInventoryManagement'
import { useLocations } from '../hooks/useDatabase'
import { useProducts } from '../hooks/useProducts'
import { useAuth } from '../contexts/AuthContext'
import { PermissionGate, RoleGate } from '../components/PermissionGate'

const InventoryManagement = () => {
  const { user } = useAuth()

  const {
    inventory,
    movements,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    transferStock,
    getLowStockItems
  } = useInventoryManagement()

  const { locations } = useLocations()
  const { products } = useProducts()

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showMovementsModal, setShowMovementsModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [view, setView] = useState<'grid' | 'table'>('table')

  // Form states
  const [addForm, setAddForm] = useState({
    product_id: '',
    location_id: '',
    quantity: '',
    reorder_level: ''
  })

  const [editForm, setEditForm] = useState({
    quantity: '',
    reorder_level: '',
    location_id: ''
  })

  const [adjustForm, setAdjustForm] = useState({
    newQuantity: '',
    reason: '',
    movementType: 'adjustment' as 'in' | 'out' | 'adjustment'
  })

  const [transferForm, setTransferForm] = useState({
    toLocationId: '',
    quantity: '',
    reason: ''
  })

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.products?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locations?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = !selectedLocation || item.location_id === selectedLocation

    const matchesLowStock = !filterLowStock || 
      (item.quantity - item.reserved_quantity) <= item.reorder_level

    return matchesSearch && matchesLocation && matchesLowStock
  })

  // Statistics
  const lowStockItems = getLowStockItems()
  const totalItems = inventory.length
  const totalProducts = new Set(inventory.map(item => item.product_id)).size
  const totalLocations = new Set(inventory.map(item => item.location_id)).size

  // Reset forms
  const resetForms = () => {
    setAddForm({ product_id: '', location_id: '', quantity: '', reorder_level: '' })
    setEditForm({ quantity: '', reorder_level: '', location_id: '' })
    setAdjustForm({ newQuantity: '', reason: '', movementType: 'adjustment' })
    setTransferForm({ toLocationId: '', quantity: '', reason: '' })
  }

  // Handle add inventory
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await addInventoryItem({
      product_id: addForm.product_id,
      location_id: addForm.location_id || null,
      quantity: parseInt(addForm.quantity),
      reorder_level: parseInt(addForm.reorder_level)
    })

    if (!error) {
      setShowAddModal(false)
      resetForms()
    } else {
      alert('Error adding inventory: ' + error)
    }
  }

  // Handle edit inventory
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    const { error } = await updateInventoryItem(selectedItem.id, {
      quantity: parseInt(editForm.quantity),
      reorder_level: parseInt(editForm.reorder_level),
      location_id: editForm.location_id || null
    })

    if (!error) {
      setShowEditModal(false)
      resetForms()
      setSelectedItem(null)
    } else {
      alert('Error updating inventory: ' + error)
    }
  }

  // Handle adjust stock
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    const { error } = await adjustStock(
      selectedItem.id,
      parseInt(adjustForm.newQuantity),
      adjustForm.reason
    )

    if (!error) {
      setShowAdjustModal(false)
      resetForms()
      setSelectedItem(null)
    } else {
      alert('Error adjusting stock: ' + error)
    }
  }

  // Handle transfer stock
  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    const { error } = await transferStock(
      selectedItem.id,
      transferForm.toLocationId,
      parseInt(transferForm.quantity),
      transferForm.reason
    )

    if (!error) {
      setShowTransferModal(false)
      resetForms()
      setSelectedItem(null)
    } else {
      alert('Error transferring stock: ' + error)
    }
  }

  // Handle delete
  const handleDelete = async (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete this inventory record for ${item.products?.name}?`)) {
      const { error } = await deleteInventoryItem(item.id)
      if (error) {
        alert('Error deleting inventory: ' + error)
      }
    }
  }

  // Open edit modal
  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setEditForm({
      quantity: item.quantity.toString(),
      reorder_level: item.reorder_level.toString(),
      location_id: item.location_id || ''
    })
    setShowEditModal(true)
  }

  // Open adjust modal
  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustForm({
      newQuantity: item.quantity.toString(),
      reason: '',
      movementType: 'adjustment'
    })
    setShowAdjustModal(true)
  }

  // Open transfer modal
  const openTransferModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setTransferForm({
      toLocationId: '',
      quantity: '',
      reason: ''
    })
    setShowTransferModal(true)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to manage inventory</h2>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading inventory...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your product inventory across all locations</p>
        </div>
        <div className="flex space-x-3">
          <RoleGate roles={['admin', 'manager']}>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Inventory
            </button>
          </RoleGate>
          <button
            onClick={() => setShowMovementsModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <History className="h-5 w-5 mr-2" />
            Movements
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900">{totalLocations}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, SKUs, or locations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="lowStock" className="text-sm text-gray-700">
              Low Stock Only
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 rounded-lg ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Table
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 rounded-lg ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {view === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const availableQuantity = item.quantity - item.reserved_quantity
                  const isLowStock = availableQuantity <= item.reorder_level
                  
                  return (
                    <tr key={item.id} className={isLowStock ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.products?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.products?.sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {item.locations?.name || 'No Location'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {item.reserved_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          availableQuantity > item.reorder_level 
                            ? 'text-green-600' 
                            : availableQuantity > 0 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {availableQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {item.reorder_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <PermissionGate resource="inventory" action="update">
                            <button
                              onClick={() => openEditModal(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate resource="inventory" action="update">
                            <button
                              onClick={() => openAdjustModal(item)}
                              className="text-green-600 hover:text-green-900"
                              title="Adjust Stock"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate resource="inventory" action="update">
                            <button
                              onClick={() => openTransferModal(item)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Transfer Stock"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                          <PermissionGate resource="inventory" action="delete">
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedLocation || filterLowStock
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first inventory item'}
              </p>
              <PermissionGate resource="inventory" action="create">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Inventory Item
                </button>
              </PermissionGate>
            </div>
          )}
        </div>
      )}

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Inventory Item</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={addForm.product_id}
                    onChange={(e) => setAddForm({ ...addForm, product_id: e.target.value })}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={addForm.location_id}
                    onChange={(e) => setAddForm({ ...addForm, location_id: e.target.value })}
                  >
                    <option value="">No Specific Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={addForm.reorder_level}
                    onChange={(e) => setAddForm({ ...addForm, reorder_level: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      resetForms()
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Inventory - {selectedItem.products?.name}
              </h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.reorder_level}
                    onChange={(e) => setEditForm({ ...editForm, reorder_level: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={editForm.location_id}
                    onChange={(e) => setEditForm({ ...editForm, location_id: e.target.value })}
                  >
                    <option value="">No Specific Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      resetForms()
                      setSelectedItem(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Adjust Stock - {selectedItem.products?.name}
              </h3>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Current Stock: <span className="font-medium">{selectedItem.quantity}</span>
                </p>
              </div>
              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={adjustForm.newQuantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, newQuantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Movement Type *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={adjustForm.movementType}
                    onChange={(e) => setAdjustForm({ ...adjustForm, movementType: e.target.value as 'in' | 'out' | 'adjustment' })}
                  >
                    <option value="adjustment">Stock Adjustment</option>
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    placeholder="Enter reason for stock adjustment..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adjust Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustModal(false)
                      resetForms()
                      setSelectedItem(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {showTransferModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transfer Stock - {selectedItem.products?.name}
              </h3>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  From: <span className="font-medium">{selectedItem.locations?.name || 'No Location'}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Available: <span className="font-medium">{selectedItem.quantity - selectedItem.reserved_quantity}</span>
                </p>
              </div>
              <form onSubmit={handleTransferStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Location *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={transferForm.toLocationId}
                    onChange={(e) => setTransferForm({ ...transferForm, toLocationId: e.target.value })}
                  >
                    <option value="">Select Destination</option>
                    {locations
                      .filter(location => location.id !== selectedItem.location_id)
                      .map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Transfer *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedItem.quantity - selectedItem.reserved_quantity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                    placeholder="Enter reason for transfer..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Transfer Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferModal(false)
                      resetForms()
                      setSelectedItem(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Movements Modal */}
      {showMovementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Stock Movements</h3>
                <button
                  onClick={() => setShowMovementsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {movement.inventory?.products?.name}
                          <br />
                          <span className="text-xs text-gray-500">
                            {movement.inventory?.products?.sku}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {movement.inventory?.locations?.name || 'No Location'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movement.type === 'purchase' || movement.type === 'return'
                              ? 'bg-green-100 text-green-800'
                            : movement.type === 'sale' || movement.type === 'damage'
                                ? 'bg-red-100 text-red-800'
                              : movement.type === 'transfer'
                                  ? 'bg-blue-100 text-blue-800'
                                : movement.type === 'adjustment'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(movement.type === 'purchase' || movement.type === 'return') && <TrendingUp className="h-3 w-3 mr-1" />}
                            {(movement.type === 'sale' || movement.type === 'damage') && <TrendingDown className="h-3 w-3 mr-1" />}
                            {movement.type === 'transfer' && <ArrowUpDown className="h-3 w-3 mr-1" />}
                            {movement.type === 'adjustment' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {movement.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {movement.reason || 'No reason provided'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {movements.length === 0 && (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No stock movements found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManagement
