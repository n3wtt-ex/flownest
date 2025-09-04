import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { SupportTicket, TicketMessage, CreateMessageData, UpdateTicketData } from '../../types/tickets';
import {
  MessageSquare, Clock, CheckCircle, AlertCircle, XCircle, Send, Eye, User, Building, Calendar, Reply
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';

// Add type for potential parser errors
type ParserError<T> = { error: true } & string;

interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
}

export function TicketManagement() {
  const { language } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total_tickets: 0, open_tickets: 0, in_progress_tickets: 0, resolved_tickets: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      console.log('Starting to load tickets...');
      setLoading(true);

      // Load all tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Tickets data fetched:', ticketsData);
      console.log('Tickets error:', ticketsError);

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        throw ticketsError;
      }

      // Extract user IDs and organization IDs
      const userIds = ticketsData?.map(ticket => ticket.user_id).filter(Boolean) || [];
      const orgIds = ticketsData?.map(ticket => ticket.organization_id).filter(Boolean) || [];

      console.log('Ticket user IDs:', userIds);
      console.log('Ticket organization IDs:', orgIds);

      // Get user details using our admin function
      let usersData: any[] = [];
      if (userIds.length > 0) {
        console.log(`Fetching data for ${userIds.length} users...`);
        // Get all users one by one (since our function takes a single user ID)
        for (let i = 0; i < userIds.length; i++) {
          console.log('Fetching user data for ID:', userIds[i]);
          const rpcResult = await supabaseAdmin
            .rpc('get_user_info_for_admin', { user_uuid: userIds[i] });
          
          console.log(`Full RPC result for user ${userIds[i]}:`, JSON.stringify(rpcResult, null, 2));
          
          if (rpcResult.error) {
            console.error('Error fetching user data:', rpcResult.error);
          } else if (rpcResult.data) {
            // Handle different possible response formats
            let userData = null;
            
            // If it's an array, take the first element
            if (Array.isArray(rpcResult.data)) {
              if (rpcResult.data.length > 0) {
                userData = rpcResult.data[0];
              }
            } else {
              // If it's a single object
              userData = rpcResult.data;
            }
            
            // Check if userData has the expected properties
            if (userData && userData.id) {
              console.log('Valid user data received:', userData);
              usersData.push({
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                raw_user_meta_data: userData.raw_user_meta_data
              });
            } else {
              console.log('Invalid or empty user data for ID:', userIds[i], 'Data:', userData);
            }
          } else {
            console.log('No user data returned for ID:', userIds[i]);
          }
        }
      }

      // Get organization details using our admin function
      let orgsData: any[] = [];
      if (orgIds.length > 0) {
        console.log(`Fetching data for ${orgIds.length} organizations...`);
        // Get all organizations one by one
        for (let i = 0; i < orgIds.length; i++) {
          console.log('Fetching organization data for ID:', orgIds[i]);
          const rpcResult = await supabaseAdmin
            .rpc('get_organization_info_for_admin', { org_uuid: orgIds[i] });
          
          console.log(`Full RPC result for organization ${orgIds[i]}:`, JSON.stringify(rpcResult, null, 2));
          
          if (rpcResult.error) {
            console.error('Error fetching organization data:', rpcResult.error);
          } else if (rpcResult.data) {
            // Handle different possible response formats
            let orgData = null;
            
            // If it's an array, take the first element
            if (Array.isArray(rpcResult.data)) {
              if (rpcResult.data.length > 0) {
                orgData = rpcResult.data[0];
              }
            } else {
              // If it's a single object
              orgData = rpcResult.data;
            }
            
            // Check if orgData has the expected properties
            if (orgData && orgData.id) {
              console.log('Valid organization data received:', orgData);
              orgsData.push({
                id: orgData.id,
                name: orgData.name,
                subscription_plan: orgData.subscription_plan
              });
            } else {
              console.log('Invalid or empty organization data for ID:', orgIds[i], 'Data:', orgData);
            }
          } else {
            console.log('No organization data returned for ID:', orgIds[i]);
          }
        }
      }

      console.log('Users data collected:', usersData);
      console.log('Organizations data collected:', orgsData);

      // Process tickets with user and organization data
      const processedTickets = ticketsData?.map(ticket => {
        const user = usersData.find(u => u.id === ticket.user_id);
        const org = orgsData.find(o => o.id === ticket.organization_id);
        console.log(`Processing ticket ${ticket.id}: user=${user?.email}, org=${org?.name}`);
        return {
          ...ticket,
          user: user ? {
            id: user.id,
            email: user.email,
            user_metadata: user.raw_user_meta_data
          } : undefined,
          organization: org ? {
            id: org.id,
            name: org.name,
            subscription_plan: org.subscription_plan
          } : undefined
        };
      }) || [];

      console.log('Processed tickets:', processedTickets);

      setTickets(processedTickets);

      // Calculate stats
      const totalTickets = ticketsData?.length || 0;
      const openTickets = ticketsData?.filter(t => t.status === 'open').length || 0;
      const inProgressTickets = ticketsData?.filter(t => t.status === 'in_progress').length || 0;
      const resolvedTickets = ticketsData?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

      setStats({
        total_tickets: totalTickets,
        open_tickets: openTickets,
        in_progress_tickets: inProgressTickets,
        resolved_tickets: resolvedTickets
      });
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      console.log('Loading messages for ticket ID:', ticketId);
      
      // First get the messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      console.log('Messages fetch result:', { data: messagesData, error: messagesError });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }
      console.log('Messages data fetched:', messagesData);

      // If we have messages, get the sender information for each message
      if (messagesData && Array.isArray(messagesData) && messagesData.length > 0) {
        // Get unique sender IDs
        const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))].filter(Boolean);
        console.log('Sender IDs found in messages:', senderIds);
        
        if (senderIds.length > 0) {
          // Get user details for all senders using our admin function
          const usersData: any[] = [];
          
          // Get all senders one by one
          for (let i = 0; i < senderIds.length; i++) {
            console.log('Fetching sender data for ID:', senderIds[i]);
            const rpcResult = await supabaseAdmin
              .rpc('get_user_info_for_admin', { user_uuid: senderIds[i] });
            
            console.log(`Full Sender RPC result for ${senderIds[i]}:`, JSON.stringify(rpcResult, null, 2));
            
            if (rpcResult.error) {
              console.error('Error fetching sender data:', rpcResult.error);
            } else if (rpcResult.data) {
              // Handle different possible response formats
              let userData = null;
              
              // If it's an array, take the first element
              if (Array.isArray(rpcResult.data)) {
                if (rpcResult.data.length > 0) {
                  userData = rpcResult.data[0];
                }
              } else {
                // If it's a single object
                userData = rpcResult.data;
              }
              
              // Check if userData has the expected properties
              if (userData && userData.id) {
                console.log('Valid sender data received:', userData);
                usersData.push({
                  id: userData.id,
                  email: userData.email,
                  user_metadata: userData.raw_user_meta_data
                });
              } else {
                console.log('Invalid or empty sender data for ID:', senderIds[i], 'Data:', userData);
              }
            } else {
              console.log('No sender data returned for ID:', senderIds[i]);
            }
          }

          console.log('All sender data collected:', usersData);

          // Map messages with sender information
          const messagesWithSenders = messagesData.map(message => {
            const sender = usersData?.find(user => user.id === message.sender_id);
            console.log(`Mapping message ${message.id}: sender=${sender?.email}`);
            return {
              ...message,
              sender: sender ? {
                id: sender.id,
                email: sender.email,
                user_metadata: sender.user_metadata
              } : undefined
            };
          });

          setTicketMessages(messagesWithSenders);
        } else {
          setTicketMessages(messagesData);
        }
      } else {
        console.log('No messages found for ticket ID:', ticketId);
        setTicketMessages([]);
      }
    } catch (error) {
      console.error('Error loading ticket messages:', error);
      setTicketMessages([]);
    }
  };

  const openTicketDialog = async (ticket: SupportTicket) => {
    try {
      console.log('Opening ticket dialog for ticket:', ticket);
      
      // Fetch fresh ticket data
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticket.id)
        .single();

      console.log('Ticket data fetch result:', { data: ticketData, error: ticketError });

      if (ticketError) {
        console.error('Error fetching ticket data:', ticketError);
        throw ticketError;
      }
      console.log('Ticket data fetched:', ticketData);

      // Get user details using our admin function
      let userData: any = null;
      if (ticketData.user_id) {
        console.log('Fetching user data for ticket user ID:', ticketData.user_id);
        const rpcResult = await supabaseAdmin
          .rpc('get_user_info_for_admin', { user_uuid: ticketData.user_id });
        
        console.log('Full User RPC result:', JSON.stringify(rpcResult, null, 2));
        
        if (rpcResult.error) {
          console.error('Error fetching user data:', rpcResult.error);
        } else if (rpcResult.data) {
          // Handle different possible response formats
          let userDataResult = null;
          
          // If it's an array, take the first element
          if (Array.isArray(rpcResult.data)) {
            if (rpcResult.data.length > 0) {
              userDataResult = rpcResult.data[0];
            }
          } else {
            // If it's a single object
            userDataResult = rpcResult.data;
          }
          
          // Check if userDataResult has the expected properties
          if (userDataResult && userDataResult.id) {
            console.log('Valid user data received:', userDataResult);
            userData = {
              id: userDataResult.id,
              email: userDataResult.email,
              user_metadata: userDataResult.raw_user_meta_data
            };
          } else {
            console.log('Invalid or empty user data for ticket user ID:', ticketData.user_id, 'Data:', userDataResult);
          }
        } else {
          console.log('No user data returned for ticket user ID:', ticketData.user_id);
        }
      }

      // Get organization details using our admin function
      let orgData: any = null;
      if (ticketData.organization_id) {
        console.log('Fetching organization data for ticket organization ID:', ticketData.organization_id);
        const rpcResult = await supabaseAdmin
          .rpc('get_organization_info_for_admin', { org_uuid: ticketData.organization_id });
        
        console.log('Full Organization RPC result:', JSON.stringify(rpcResult, null, 2));
        
        if (rpcResult.error) {
          console.error('Error fetching organization data:', rpcResult.error);
        } else if (rpcResult.data) {
          // Handle different possible response formats
          let orgDataResult = null;
          
          // If it's an array, take the first element
          if (Array.isArray(rpcResult.data)) {
            if (rpcResult.data.length > 0) {
              orgDataResult = rpcResult.data[0];
            }
          } else {
            // If it's a single object
            orgDataResult = rpcResult.data;
          }
          
          // Check if orgDataResult has the expected properties
          if (orgDataResult && orgDataResult.id) {
            console.log('Valid organization data received:', orgDataResult);
            orgData = {
              id: orgDataResult.id,
              name: orgDataResult.name,
              subscription_plan: orgDataResult.subscription_plan
            };
          } else {
            console.log('Invalid or empty organization data for ticket organization ID:', ticketData.organization_id, 'Data:', orgDataResult);
          }
        } else {
          console.log('No organization data returned for ticket organization ID:', ticketData.organization_id);
        }
      }

      // Create the complete ticket object with user and organization data
      const completeTicket: SupportTicket = {
        ...ticketData,
        user: userData || undefined,
        organization: orgData || undefined
      };

      console.log('Complete ticket object:', completeTicket);

      setSelectedTicket(completeTicket);
      setNewStatus(completeTicket.status);
      setNewPriority(completeTicket.priority);
      setResponseMessage('');
      await loadTicketMessages(ticket.id);
      setIsTicketDialogOpen(true);
    } catch (error) {
      console.error('Error opening ticket dialog:', error);
      // Fallback to original approach if there's an error
      setSelectedTicket(ticket);
      setNewStatus(ticket.status);
      setNewPriority(ticket.priority);
      setResponseMessage('');
      await loadTicketMessages(ticket.id);
      setIsTicketDialogOpen(true);
    }
  };

  const updateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true); // Show loading state during update
      
      const updates: UpdateTicketData = {};

      if (newStatus !== selectedTicket.status) {
        updates.status = newStatus as any;
        if (newStatus === 'resolved' || newStatus === 'closed') {
          updates.resolved_at = new Date().toISOString();
        }
      }

      if (newPriority !== selectedTicket.priority) {
        updates.priority = newPriority as any;
      }

      if (responseMessage.trim()) {
        updates.admin_response = responseMessage.trim();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      // Add admin message if response was provided
      if (responseMessage.trim()) {
        const messageData: CreateMessageData = {
          ticket_id: selectedTicket.id,
          message: responseMessage.trim(),
          sender_type: 'admin'
        };

        const { error: messageError } = await supabase
          .from('ticket_messages')
          .insert(messageData);

        if (messageError) throw messageError;
      }

      // Close dialog and reset form
      setIsTicketDialogOpen(false);
      setSelectedTicket(null);
      setResponseMessage('');
      setNewStatus('');
      setNewPriority('');
      
      // Reload tickets and messages
      await loadTickets();
      
      // Show success message
      alert(language === 'tr' ? 'Talep başarıyla güncellendi!' : 'Ticket updated successfully!');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert(language === 'tr' ? 'Talep güncellenirken hata oluştu!' : 'Error updating ticket!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive ticket-status-open',
      in_progress: 'default ticket-status-in-progress',
      resolved: 'default ticket-status-resolved',
      closed: 'secondary ticket-status-closed'
    };

    const labels = {
      open: language === 'tr' ? 'Açık' : 'Open',
      in_progress: language === 'tr' ? 'İşlemde' : 'In Progress',
      resolved: language === 'tr' ? 'Çözüldü' : 'Resolved',
      closed: language === 'tr' ? 'Kapalı' : 'Closed'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary priority-low',
      medium: 'default priority-medium',
      high: 'destructive priority-high',
      urgent: 'destructive priority-urgent'
    };

    const labels = {
      low: language === 'tr' ? 'Düşük' : 'Low',
      medium: language === 'tr' ? 'Orta' : 'Medium',
      high: language === 'tr' ? 'Yüksek' : 'High',
      urgent: language === 'tr' ? 'Acil' : 'Urgent'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] as any} className={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (ticket.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
  
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
  
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'tr' ? 'Destek Talepleri' : 'Support Tickets'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {language === 'tr' 
            ? 'Kullanıcı destek taleplerini yönetin ve yanıtlayın.'
            : 'Manage and respond to user support tickets.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="admin-stats-card admin-stats-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'tr' ? 'Toplam Talep' : 'Total Tickets'}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tickets}</div>
          </CardContent>
        </Card>
        
        <Card className="admin-stats-card admin-stats-active">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'tr' ? 'Açık Talepler' : 'Open Tickets'}
            </CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open_tickets}</div>
          </CardContent>
        </Card>
        
        <Card className="admin-stats-card admin-stats-in-progress">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'tr' ? 'İşlemde' : 'In Progress'}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress_tickets}</div>
          </CardContent>
        </Card>
        
        <Card className="admin-stats-card admin-stats-resolved">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'tr' ? 'Çözüldü' : 'Resolved'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved_tickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="admin-panel-card">
        <CardHeader>
          <CardTitle>{language === 'tr' ? 'Destek Talepleri' : 'Support Tickets'}</CardTitle>
          <CardDescription>
            {language === 'tr' 
              ? 'Tüm kullanıcı destek taleplerini görüntüleyin ve yönetin.'
              : 'View and manage all user support tickets.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder={language === 'tr' ? 'Talep ara...' : 'Search tickets...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input-field flex-1"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="admin-input-field w-48">
                <SelectValue placeholder={language === 'tr' ? 'Duruma göre filtrele' : 'Filter by status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'tr' ? 'Tüm Durumlar' : 'All Status'}</SelectItem>
                <SelectItem value="open">{language === 'tr' ? 'Açık' : 'Open'}</SelectItem>
                <SelectItem value="in_progress">{language === 'tr' ? 'İşlemde' : 'In Progress'}</SelectItem>
                <SelectItem value="resolved">{language === 'tr' ? 'Çözüldü' : 'Resolved'}</SelectItem>
                <SelectItem value="closed">{language === 'tr' ? 'Kapalı' : 'Closed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'tr' ? 'Başlık' : 'Title'}</TableHead>
                  <TableHead>{language === 'tr' ? 'Kullanıcı' : 'User'}</TableHead>
                  <TableHead>{language === 'tr' ? 'Organizasyon' : 'Organization'}</TableHead>
                  <TableHead>{language === 'tr' ? 'Durum' : 'Status'}</TableHead>
                  <TableHead>{language === 'tr' ? 'Öncelik' : 'Priority'}</TableHead>
                  <TableHead>{language === 'tr' ? 'Oluşturulma' : 'Created'}</TableHead>
                  <TableHead className="text-right">{language === 'tr' ? 'İşlemler' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {language === 'tr' ? 'Talep bulunamadı' : 'No tickets found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="admin-table-row">
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">{ticket.user?.user_metadata?.full_name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{ticket.user?.email || 'No email'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{ticket.organization?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="admin-action-button"
                          onClick={() => openTicketDialog(ticket)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {language === 'tr' ? 'Görüntüle' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="admin-dialog-content max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTicket?.title}
            </DialogTitle>
            <DialogDescription>
              {language === 'tr' ? 'Talep detayları ve yanıt' : 'Ticket details and response'}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="text-sm font-medium">{language === 'tr' ? 'Kullanıcı' : 'User'}:</label>
                  <p className="text-sm text-gray-600">{selectedTicket.user?.user_metadata?.full_name || selectedTicket.user?.email || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'tr' ? 'Organizasyon' : 'Organization'}:</label>
                  <p className="text-sm text-gray-600">{selectedTicket.organization?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'tr' ? 'Durum' : 'Status'}:</label>
                  <div>{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'tr' ? 'Öncelik' : 'Priority'}:</label>
                  <div>{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
              </div>

              {/* Original Description */}
              <div>
                <h4 className="font-medium mb-2">{language === 'tr' ? 'Açıklama' : 'Description'}</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Messages */}
              <div>
                <h4 className="font-medium mb-2">{language === 'tr' ? 'Mesaj Geçmişi' : 'Message History'}</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {ticketMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender_type === 'admin'
                          ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                          : 'bg-gray-50 dark:bg-gray-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {message.sender_type === 'admin' 
                            ? (language === 'tr' ? 'Admin' : 'Admin')
                            : (message.sender?.user_metadata?.full_name || message.sender?.email || 'Unknown User')
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'tr' ? 'Durum Güncelle' : 'Update Status'}
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="admin-input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">{language === 'tr' ? 'Açık' : 'Open'}</SelectItem>
                      <SelectItem value="in_progress">{language === 'tr' ? 'İşlemde' : 'In Progress'}</SelectItem>
                      <SelectItem value="resolved">{language === 'tr' ? 'Çözüldü' : 'Resolved'}</SelectItem>
                      <SelectItem value="closed">{language === 'tr' ? 'Kapalı' : 'Closed'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'tr' ? 'Öncelik Güncelle' : 'Update Priority'}
                  </label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger className="admin-input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{language === 'tr' ? 'Düşük' : 'Low'}</SelectItem>
                      <SelectItem value="medium">{language === 'tr' ? 'Orta' : 'Medium'}</SelectItem>
                      <SelectItem value="high">{language === 'tr' ? 'Yüksek' : 'High'}</SelectItem>
                      <SelectItem value="urgent">{language === 'tr' ? 'Acil' : 'Urgent'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Response */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === 'tr' ? 'Yanıt Yaz' : 'Write Response'}
                </label>
                <Textarea
                  placeholder={language === 'tr' ? 'Yanıtınızı yazın...' : 'Write your response...'}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={4}
                  className="admin-input-field"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </Button>
                <Button className="admin-action-button" onClick={updateTicket}>
                  <Reply className="h-4 w-4 mr-2" />
                  {language === 'tr' ? 'Güncelle ve Yanıtla' : 'Update & Reply'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}