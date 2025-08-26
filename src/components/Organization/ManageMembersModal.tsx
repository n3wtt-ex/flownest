import React, { useState, useEffect } from 'react';
import { X, Users, Mail, UserPlus, Loader2, Crown, Shield, User, Trash2 } from 'lucide-react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { supabase } from '../../lib/supabase';
import { OrganizationMember, InviteUserData } from '../../types/organizations';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageMembersModal({ isOpen, onClose }: ManageMembersModalProps) {
  const { currentOrganization, inviteUser, removeUser, updateUserRole } = useOrganization();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState<InviteUserData>({
    email: '',
    role: 'member'
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentOrganization) {
      loadMembers();
    }
  }, [isOpen, currentOrganization]);

  const loadMembers = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          id,
          user_id,
          role,
          is_active,
          joined_at
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // For now, we'll use user_id as email placeholder
      // In a real app, you'd need a proper way to get user emails
      const membersData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        email: `user-${item.user_id.slice(0, 8)}@example.com`, // Placeholder
        role: item.role,
        is_active: item.is_active,
        joined_at: item.joined_at
      })) || [];

      setMembers(membersData);
    } catch (err) {
      console.error('Error loading members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await inviteUser(inviteData);
      setInviteData({ email: '', role: 'member' });
      setShowInviteForm(false);
      await loadMembers();
    } catch (err) {
      console.error('Error inviting user:', err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this member from the organization?')) {
      try {
        await removeUser(userId);
        await loadMembers();
      } catch (err) {
        console.error('Error removing user:', err);
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'owner' | 'admin' | 'member') => {
    try {
      await updateUserRole(userId, newRole);
      await loadMembers();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (!isOpen || !currentOrganization) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Members
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Invite User Section */}
          <div className="mb-6">
            {!showInviteForm ? (
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            ) : (
              <form onSubmit={handleInviteUser} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 mb-3">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Invite New Member</span>
                </div>
                
                <div>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteData({ email: '', role: 'member' });
                    }}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                    disabled={inviteLoading || !inviteData.email.trim()}
                  >
                    {inviteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{inviteLoading ? 'Sending...' : 'Send Invite'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Current Members ({members.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No members found.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                      
                      {member.role !== 'owner' && (
                        <div className="flex items-center space-x-1">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user_id, e.target.value as 'owner' | 'admin' | 'member')}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                          
                          <button
                            onClick={() => handleRemoveUser(member.user_id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}