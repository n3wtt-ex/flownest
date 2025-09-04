import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Organization, 
  UserOrganization, 
  OrganizationContext as IOrganizationContext,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteUserData
} from '../types/organizations';

const OrganizationContext = createContext<IOrganizationContext | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's organizations on mount
  useEffect(() => {
    if (user) {
      loadUserOrganizations();
    } else {
      setCurrentOrganization(null);
      setUserOrganizations([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's organizations
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .eq('approval_status', 'approved') // Only load approved organizations
        .order('joined_at', { ascending: false });

      if (userOrgsError) throw userOrgsError;

      setUserOrganizations(userOrgs || []);

      // Set current organization (first one or from localStorage)
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      let selectedOrg = null;

      if (savedOrgId) {
        selectedOrg = userOrgs?.find(uo => uo.organization_id === savedOrgId)?.organization;
      }

      if (!selectedOrg && userOrgs && userOrgs.length > 0) {
        selectedOrg = userOrgs[0].organization;
      }

      setCurrentOrganization(selectedOrg || null);
      if (selectedOrg) {
        localStorage.setItem('currentOrganizationId', selectedOrg.id);
      }

    } catch (err) {
      console.error('Error loading organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (data: CreateOrganizationData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Create the organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          domain: data.domain || null,
          settings: data.settings || {}
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add the user as owner of the organization
      const { error: memberError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          organization_id: organization.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Reload organizations to get fresh data
      await loadUserOrganizations();
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      throw err;
    }
  };

  const switchOrganization = async (organizationId: string) => {
    try {
      const userOrg = userOrganizations.find(uo => uo.organization_id === organizationId);
      if (!userOrg?.organization) {
        throw new Error('Organization not found');
      }

      setCurrentOrganization(userOrg.organization);
      localStorage.setItem('currentOrganizationId', organizationId);
      
      // Reload the page to ensure all data is refreshed with new organization context
      window.location.reload();
    } catch (err) {
      console.error('Error switching organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
    }
  };

  const updateOrganization = async (data: UpdateOrganizationData) => {
    try {
      if (!currentOrganization) throw new Error('No current organization');

      const { error: updateError } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', currentOrganization.id);

      if (updateError) throw updateError;

      // Update local state
      setCurrentOrganization(prev => prev ? { ...prev, ...data } : null);
      
      // Reload organizations to get fresh data
      await loadUserOrganizations();
    } catch (err) {
      console.error('Error updating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to update organization');
      throw err;
    }
  };

  const inviteUser = async (data: InviteUserData) => {
    try {
      if (!currentOrganization) throw new Error('No current organization');

      // In a real app, this would send an invitation email
      // For now, we'll just show a message
      console.log('Invitation would be sent to:', data.email, 'with role:', data.role);
      
      // TODO: Implement invitation system with email sending
      alert(`Invitation functionality will be implemented. Would invite ${data.email} as ${data.role}`);
    } catch (err) {
      console.error('Error inviting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite user');
      throw err;
    }
  };

  const removeUser = async (userId: string) => {
    try {
      if (!currentOrganization) throw new Error('No current organization');

      const { error: removeError } = await supabase
        .from('user_organizations')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('organization_id', currentOrganization.id);

      if (removeError) throw removeError;

      // Reload organizations to get fresh data
      await loadUserOrganizations();
    } catch (err) {
      console.error('Error removing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove user');
      throw err;
    }
  };

  const updateUserRole = async (userId: string, role: 'owner' | 'admin' | 'member') => {
    try {
      if (!currentOrganization) throw new Error('No current organization');

      const { error: updateError } = await supabase
        .from('user_organizations')
        .update({ role })
        .eq('user_id', userId)
        .eq('organization_id', currentOrganization.id);

      if (updateError) throw updateError;

      // Reload organizations to get fresh data
      await loadUserOrganizations();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    }
  };

  const value: IOrganizationContext = {
    currentOrganization,
    userOrganizations,
    loading,
    error,
    switchOrganization,
    createOrganization,
    updateOrganization,
    inviteUser,
    removeUser,
    updateUserRole,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}