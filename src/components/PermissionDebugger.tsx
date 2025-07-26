import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const PermissionDebugger: React.FC = () => {
  const { user, profile, permissions, hasPermission } = useAuth();
  const { canCreateProducts, canCreateOrders } = usePermissions();

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 rounded-lg p-4 max-w-md shadow-lg z-50">
      <h3 className="font-bold text-red-600 mb-2">Permission Debug</h3>
      
      <div className="text-xs space-y-1">
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>Profile Role:</strong> {profile?.role || 'None'}</div>
        <div><strong>Profile ID:</strong> {profile?.id || 'None'}</div>
        <div><strong>Tenant ID:</strong> {profile?.tenant_id || 'None'}</div>
        
        <hr className="my-2" />
        
        <div><strong>Total Permissions:</strong> {permissions.length}</div>
        <div><strong>Products Create:</strong> {hasPermission('products', 'create') ? '✅' : '❌'}</div>
        <div><strong>Orders Create:</strong> {hasPermission('orders', 'create') ? '✅' : '❌'}</div>
        <div><strong>Can Create Products Hook:</strong> {canCreateProducts ? '✅' : '❌'}</div>
        <div><strong>Can Create Orders Hook:</strong> {canCreateOrders ? '✅' : '❌'}</div>
        
        <hr className="my-2" />
        
        <div><strong>All Permissions:</strong></div>
        {permissions.length > 0 ? (
          <div className="max-h-20 overflow-y-auto text-xs">
            {permissions.map((p, i) => (
              <div key={i}>
                {p.resource}:{p.action} = {p.granted ? '✅' : '❌'}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-red-500">No permissions loaded!</div>
        )}
      </div>
    </div>
  );
};

export default PermissionDebugger;
