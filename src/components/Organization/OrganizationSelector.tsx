import React from 'react';
import { ChevronDown, Building2, Settings, Users, Plus } from 'lucide-react';
import { useOrganization } from '../../contexts/OrganizationContext';

export function OrganizationSelector() {
  const { currentOrganization, userOrganizations, switchOrganization, loading } = useOrganization();
  const [isOpen, setIsOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        <Building2 className="w-4 h-4" />
        <span className="text-sm">No Organization</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full min-w-48"
      >
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <Building2 className="w-3 h-3 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentOrganization.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {currentOrganization.subscription_plan}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                Your Organizations
              </div>
              
              {userOrganizations.map((userOrg) => (
                <button
                  key={userOrg.organization_id}
                  onClick={() => {
                    if (userOrg.organization_id !== currentOrganization.id) {
                      switchOrganization(userOrg.organization_id);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left transition-colors ${
                    userOrg.organization_id === currentOrganization.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                    <Building2 className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {userOrg.organization?.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userOrg.role} • {userOrg.organization?.subscription_plan}
                    </div>
                  </div>
                  {userOrg.organization_id === currentOrganization.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <button className="w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create Organization</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Organization Settings</span>
                </button>
                
                <button className="w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Manage Members</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}