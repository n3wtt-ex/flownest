import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../contexts/OrganizationContext';
import {
  Users, Settings, Shield, Ban, CheckCircle, Edit, Search, MoreHorizontal, Mail, Calendar, Building, MessageSquare, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';
import { TicketManagement } from '../components/Admin/TicketManagement';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: { full_name?: string; };
  organization?: { id: string; name: string; subscription_plan: string; is_active: boolean; };
  user_organization?: { role: string; joined_at: string; is_active: boolean; approval_status?: string; };
}

interface UserStats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  developer_users: number;
  pending_users: number;  // Add this line
}

export function AdminPanel() {
  const { user: currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const { language } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({ total_users: 0, active_users: 0, blocked_users: 0, developer_users: 0, pending_users: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newSubscriptionPlan, setNewSubscriptionPlan] = useState('');

  const isDeveloper = currentOrganization?.subscription_plan === 'developer';

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all users with their organization info using the admin function
      const { data: adminUsers, error } = await supabase
        .rpc('get_admin_users');
      
      if (error) throw error;
      
      // Transform the data to match our interface
      const usersWithOrgs = adminUsers?.map((adminUser: any) => {
        return {
          id: adminUser.user_id,
          email: adminUser.user_email || '',
          created_at: adminUser.user_created_at,
          user_metadata: adminUser.user_metadata || {},
          organization: {
            id: adminUser.organization_id,
            name: adminUser.organization_name,
            subscription_plan: adminUser.subscription_plan,
            is_active: adminUser.organization_is_active
          },
          user_organization: {
            role: adminUser.role,
            joined_at: adminUser.joined_at,
            is_active: adminUser.is_active,
            approval_status: adminUser.approval_status
          }
        };
      }) || [];
      
      setUsers(usersWithOrgs);
      
      // Calculate stats
      const totalUsers = usersWithOrgs.length;
      const activeUsers = usersWithOrgs.filter(u => u.user_organization?.is_active).length;
      const blockedUsers = usersWithOrgs.filter(u => !u.user_organization?.is_active).length;
      const developerUsers = usersWithOrgs.filter(u => u.organization?.subscription_plan === 'developer').length;
      const pendingUsers = usersWithOrgs.filter(u => u.user_organization?.approval_status === 'pending').length;
      
      setStats({ total_users: totalUsers, active_users: activeUsers, blocked_users: blockedUsers, developer_users: developerUsers, pending_users: pendingUsers });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDeveloper) {
      loadUsers();
    }
  }, [isDeveloper, loadUsers]);

  const handleUserAction = async (userId: string, action: 'block' | 'activate' | 'change_plan' | 'approve' | 'reject') => {
    try {
      if (action === 'block') {
        // Prevent self-blocking
        if (userId === currentUser?.id) {
          alert(language === 'tr' ? 'Kendinizi engelleyemezsiniz!' : 'You cannot block yourself!');
          return;
        }
        
        // Prevent developers from blocking other developers
        const targetUser = users.find(u => u.id === userId);
        if (targetUser?.organization?.subscription_plan === 'developer') {
          alert(language === 'tr' ? 'Developer kullanıcıları engelleyemezsiniz!' : 'You cannot block developer users!');
          return;
        }
        
        const { error } = await supabase
          .from('user_organizations')
          .update({ is_active: false })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else if (action === 'activate') {
        const { error } = await supabase
          .from('user_organizations')
          .update({ is_active: true })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else if (action === 'change_plan' && selectedUser && newSubscriptionPlan) {
        // Prevent making users developers (only super admin should do this)
        if (newSubscriptionPlan === 'developer') {
          alert(language === 'tr' ? 'Developer planı sadece süper admin tarafından atanabilir!' : 'Developer plan can only be assigned by super admin!');
          return;
        }
        
        // Use the database function for proper ENUM handling
        const { data, error } = await supabase
          .rpc('update_organization_subscription_plan', {
            org_id: selectedUser.organization?.id,
            new_plan: newSubscriptionPlan
          });
        
        if (error) {
          throw error;
        }
        
        setIsEditDialogOpen(false);
        setNewSubscriptionPlan('');
        setSelectedUser(null);
      } else if (action === 'approve') {
        // Approve the user
        const { error } = await supabase
          .rpc('approve_user', { user_uuid: userId });
        
        if (error) throw error;
      } else if (action === 'reject') {
        // Reject the user
        const { error } = await supabase
          .rpc('reject_user', { user_uuid: userId });
        
        if (error) throw error;
      }
      
      // Show success message
      alert(language === 'tr' ? 'İşlem başarıyla tamamlandı!' : 'Operation completed successfully!');
      
      // Reload users to update UI
      await loadUsers();
    } catch (error) {
      console.error('Error performing user action:', error);
      alert(language === 'tr' ? 'İşlem sırasında hata oluştu!' : 'An error occurred during the operation!');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlanFilter = 
      filterPlan === 'all' || 
      user.organization?.subscription_plan === filterPlan;
      
    const matchesApprovalFilter = 
      filterApproval === 'all' || 
      user.user_organization?.approval_status === filterApproval;
    
    return matchesSearch && matchesPlanFilter && matchesApprovalFilter;
  });

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              {language === 'tr' ? 'Erişim Reddedildi' : 'Access Denied'}
            </CardTitle>
            <CardDescription>
              {language === 'tr' 
                ? 'Bu sayfaya erişim için Developer planına sahip olmanız gerekiyor.' 
                : 'You need a Developer plan to access this page.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'tr' ? 'Admin Panel' : 'Admin Panel'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {language === 'tr' 
              ? 'Kullanıcı yönetimi ve sistem ayarları' 
              : 'User management and system settings'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="admin-stats-card admin-stats-total">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Toplam Kullanıcı' : 'Total Users'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          
          <Card className="admin-stats-card admin-stats-pending">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Kullanıcı Başvurusu' : 'User Applications'}
              </CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_users}</div>
            </CardContent>
          </Card>
          
          <Card className="admin-stats-card admin-stats-active">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Aktif Kullanıcı' : 'Active Users'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users}</div>
            </CardContent>
          </Card>
          
          <Card className="admin-stats-card admin-stats-blocked">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Engellenen' : 'Blocked'}
              </CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.blocked_users}</div>
            </CardContent>
          </Card>
          
          <Card className="admin-stats-card admin-stats-developer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Developer' : 'Developer'}
              </CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.developer_users}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="admin-panel-tabs grid w-full grid-cols-2">
            <TabsTrigger value="users" className="admin-panel-tab-trigger">
              <Users className="h-4 w-4 mr-2" />
              {language === 'tr' ? 'Kullanıcı Yönetimi' : 'User Management'}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="admin-panel-tab-trigger">
              <MessageSquare className="h-4 w-4 mr-2" />
              {language === 'tr' ? 'Destek Talepleri' : 'Support Tickets'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <Card className="admin-panel-user-management">
              <CardHeader>
                <CardTitle>{language === 'tr' ? 'Kullanıcı Yönetimi' : 'User Management'}</CardTitle>
                <CardDescription>
                  {language === 'tr' 
                    ? 'Tüm kullanıcıları yönetin, planlarını değiştirin ve hesapları kontrol edin.'
                    : 'Manage all users, change plans and control accounts.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={language === 'tr' ? 'Kullanıcı ara...' : 'Search users...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input-field pl-10"
                />
              </div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="admin-input-field w-48">
                  <SelectValue placeholder={language === 'tr' ? 'Plan filtresi' : 'Filter by plan'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'tr' ? 'Tüm Planlar' : 'All Plans'}</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterApproval} onValueChange={setFilterApproval}>
                <SelectTrigger className="admin-input-field w-48">
                  <SelectValue placeholder={language === 'tr' ? 'Onay durumu' : 'Approval status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'tr' ? 'Tüm Durumlar' : 'All Status'}</SelectItem>
                  <SelectItem value="pending">{language === 'tr' ? 'Beklemede' : 'Pending'}</SelectItem>
                  <SelectItem value="approved">{language === 'tr' ? 'Onaylandı' : 'Approved'}</SelectItem>
                  <SelectItem value="rejected">{language === 'tr' ? 'Reddedildi' : 'Rejected'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'tr' ? 'Kullanıcı' : 'User'}</TableHead>
                    <TableHead>{language === 'tr' ? 'Organizasyon' : 'Organization'}</TableHead>
                    <TableHead>{language === 'tr' ? 'Plan' : 'Plan'}</TableHead>
                    <TableHead>{language === 'tr' ? 'Durum' : 'Status'}</TableHead>
                    <TableHead>{language === 'tr' ? 'Kayıt Tarihi' : 'Joined'}</TableHead>
                    <TableHead className="text-right">{language === 'tr' ? 'İşlemler' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {language === 'tr' ? 'Kullanıcı bulunamadı' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="admin-table-row">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                                {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.user_metadata?.full_name || 'No Name'}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span>{user.organization?.name || 'No Organization'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.organization?.subscription_plan === 'developer' ? 'default' : 'secondary'}
                          >
                            {user.organization?.subscription_plan || 'starter'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={user.user_organization?.is_active ? 'default' : 'destructive'}
                            >
                              {user.user_organization?.is_active ? (
                                language === 'tr' ? 'Aktif' : 'Active'
                              ) : (
                                language === 'tr' ? 'Engelli' : 'Blocked'
                              )}
                            </Badge>
                            {user.user_organization?.approval_status === 'pending' && (
                              <Badge variant="secondary">
                                {language === 'tr' ? 'Beklemede' : 'Pending'}
                              </Badge>
                            )}
                            {user.user_organization?.approval_status === 'rejected' && (
                              <Badge variant="destructive">
                                {language === 'tr' ? 'Reddedildi' : 'Rejected'}
                              </Badge>
                            )}
                            {user.user_organization?.approval_status === 'approved' && (
                              <Badge variant="default">
                                {language === 'tr' ? 'Onaylandı' : 'Approved'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="admin-action-button h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {language === 'tr' ? 'İşlemler' : 'Actions'}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {/* Only show plan change if not trying to make someone developer */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewSubscriptionPlan(user.organization?.subscription_plan || 'starter');
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {language === 'tr' ? 'Planı Değiştir' : 'Change Plan'}
                              </DropdownMenuItem>
                              {/* Don't show block/activate for self or for developers */}
                              {user.id !== currentUser?.id && user.organization?.subscription_plan !== 'developer' && (
                                user.user_organization?.is_active ? (
                                  <DropdownMenuItem
                                    onClick={() => handleUserAction(user.id, 'block')}
                                    className="text-red-600"
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    {language === 'tr' ? 'Engelle' : 'Block'}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleUserAction(user.id, 'activate')}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {language === 'tr' ? 'Aktifleştir' : 'Activate'}
                                  </DropdownMenuItem>
                                )
                              )}
                              
                              {/* Show approve/reject options for pending users */}
                              {user.user_organization?.approval_status === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleUserAction(user.id, 'approve')}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {language === 'tr' ? 'Onayla' : 'Approve'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUserAction(user.id, 'reject')}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {language === 'tr' ? 'Reddet' : 'Reject'}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManagement />
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="admin-dialog-content">
            <DialogHeader>
              <DialogTitle>
                {language === 'tr' ? 'Abonelik Planını Değiştir' : 'Change Subscription Plan'}
              </DialogTitle>
              <DialogDescription>
                {language === 'tr' 
                  ? `${selectedUser?.user_metadata?.full_name || selectedUser?.email} için yeni plan seçin.`
                  : `Select a new plan for ${selectedUser?.user_metadata?.full_name || selectedUser?.email}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newSubscriptionPlan} onValueChange={setNewSubscriptionPlan}>
                <SelectTrigger className="admin-input-field">
                  <SelectValue placeholder={language === 'tr' ? 'Plan seçin' : 'Select plan'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  {/* Developer option removed - only super admin can assign this */}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </Button>
                <Button className="admin-action-button" onClick={() => handleUserAction(selectedUser!.id, 'change_plan')}>
                  {language === 'tr' ? 'Güncelle' : 'Update'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AdminPanel;