import React, { useState } from 'react'
import { MapPin, Plus, Edit, Building, Search, AlertCircle, Trash2 } from 'lucide-react'
import { useLocations } from '../hooks/useDatabase'
import { useAuth } from '../contexts/AuthContext'
import { PermissionGate } from '../components/PermissionGate'

interface Location {
  id: string
  name: string
  type: string
  address: any
  contact_info: any
  is_active: boolean
  created_at: string
}

const LocationManagement = () => {
  const { user } = useAuth()
  const { locations, loading, error, addLocation, updateLocation, deleteLocation } = useLocations()

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'warehouse',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    contact_info: {
      phone: '',
      email: '',
      manager: ''
    }
  })

  const locationTypes = [
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'store', label: 'Store' },
    { value: 'distribution_center', label: 'Distribution Center' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'customer', label: 'Customer' },
    { value: 'other', label: 'Other' }
  ]

  const filteredLocations = locations.filter((location: Location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'warehouse',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      contact_info: {
        phone: '',
        email: '',
        manager: ''
      }
    })
  }

  const handleAdd = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEdit = (location: Location) => {
    setSelectedLocation(location)
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      contact_info: location.contact_info || {
        phone: '',
        email: '',
        manager: ''
      }
    })
    setShowEditModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let result
      if (showEditModal && selectedLocation) {
        // Update existing location
        result = await updateLocation(selectedLocation.id, {
          ...formData,
          is_active: true
        })
      } else {
        // Add new location
        result = await addLocation({
          ...formData,
          is_active: true
        })
      }

      if (result.error) {
        alert('Error saving location: ' + result.error)
      } else {
        setShowAddModal(false)
        setShowEditModal(false)
        resetForm()
        setSelectedLocation(null)
      }
    } catch (error) {
      console.error('Error saving location:', error)
    }
  }

  const handleDelete = async (location: Location) => {
    if (window.confirm(`Are you sure you want to deactivate "${location.name}"? You can reactivate it later from the location list.`)) {
      try {
        const result = await deleteLocation(location.id)
        if (result.error) {
          alert('Error deleting location: ' + result.error)
        }
      } catch (error) {
        console.error('Error deleting location:', error)
      }
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to manage locations</h2>
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
            <MapPin className="h-8 w-8 text-blue-600 mr-3" />
            Location Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your warehouses, stores, and other locations</p>
        </div>
        <PermissionGate resource="locations" action="create">
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Location
          </button>
        </PermissionGate>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading locations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location: Location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Building className="h-6 w-6 text-blue-600 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      <span className="text-sm text-gray-600 capitalize">
                        {location.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    location.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {location.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {location.address && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Address:</p>
                    <p className="text-sm text-gray-900">
                      {location.address.street && `${location.address.street}, `}
                      {location.address.city && `${location.address.city}, `}
                      {location.address.state && `${location.address.state} `}
                      {location.address.zipCode}
                    </p>
                  </div>
                )}

                {location.contact_info && (
                  <div className="mb-4">
                    {location.contact_info.phone && (
                      <p className="text-sm text-gray-600">
                        Phone: <span className="text-gray-900">{location.contact_info.phone}</span>
                      </p>
                    )}
                    {location.contact_info.email && (
                      <p className="text-sm text-gray-600">
                        Email: <span className="text-gray-900">{location.contact_info.email}</span>
                      </p>
                    )}
                    {location.contact_info.manager && (
                      <p className="text-sm text-gray-600">
                        Manager: <span className="text-gray-900">{location.contact_info.manager}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <PermissionGate resource="locations" action="update">
                    <button
                      onClick={() => handleEdit(location)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </PermissionGate>
                  <PermissionGate resource="locations" action="delete">
                    <button
                      onClick={() => handleDelete(location)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </PermissionGate>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Start by adding your first location'}
          </p>
          <PermissionGate resource="locations" action="create">
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Location
            </button>
          </PermissionGate>
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showAddModal ? 'Add New Location' : `Edit ${selectedLocation?.name}`}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {locationTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.address.street}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, street: e.target.value }
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.address.city}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, city: e.target.value }
                          })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.address.state}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, state: e.target.value }
                          })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.address.zipCode}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            address: { ...formData.address, zipCode: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.contact_info.phone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact_info: { ...formData.contact_info, phone: e.target.value }
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.contact_info.email}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact_info: { ...formData.contact_info, email: e.target.value }
                        })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.contact_info.manager}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          contact_info: { ...formData.contact_info, manager: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showAddModal ? 'Add Location' : 'Update Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      resetForm()
                      setSelectedLocation(null)
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
    </div>
  )
}

export default LocationManagement
