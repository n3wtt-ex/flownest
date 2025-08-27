import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
      setLoading(true);

      // Load all tickets with user and organization info
      const { data: ticketsData, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:auth.users(id, email, user_metadata),
          organization:organizations(id, name, subscription_plan)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(ticketsData || []);

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
      const { data: messagesData, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          sender:auth.users(id, email, user_metadata)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTicketMessages(messagesData || []);
    } catch (error) {
      console.error('Error loading ticket messages:', error);
    }
  };

  const openTicketDialog = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
    setResponseMessage('');
    await loadTicketMessages(ticket.id);
    setIsTicketDialogOpen(true);
  };

  const updateTicket = async () => {
    if (!selectedTicket) return;

    try {
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

      // Reload tickets and messages
      await loadTickets();
      await loadTicketMessages(selectedTicket.id);

      setResponseMessage('');
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      in_progress: 'default',
      resolved: 'default',
      closed: 'secondary'
    };

    const labels = {
      open: language === 'tr' ? 'Açık' : 'Open',
      in_progress: language === 'tr' ? 'İşlemde' : 'In Progress',
      resolved: language === 'tr' ? 'Çözüldü' : 'Resolved',
      closed: language === 'tr' ? 'Kapalı' : 'Closed'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      urgent: 'destructive'
    };

    const labels = {
      low: language === 'tr' ? 'Düşük' : 'Low',
      medium: language === 'tr' ? 'Orta' : 'Medium',
      high: language === 'tr' ? 'Yüksek' : 'High',
      urgent: language === 'tr' ? 'Acil' : 'Urgent'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants] as any}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        <Card className="admin-stats-card">
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
        
        <Card className="admin-stats-card">
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
        
        <Card className="admin-stats-card">
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
        
        <Card className="admin-stats-card">
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
                            <div className="text-xs text-gray-500">{ticket.user?.email}</div>
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
                  <p className="text-sm text-gray-600">{selectedTicket.user?.user_metadata?.full_name || selectedTicket.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{language === 'tr' ? 'Organizasyon' : 'Organization'}:</label>
                  <p className="text-sm text-gray-600">{selectedTicket.organization?.name}</p>
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
                            : (message.sender?.user_metadata?.full_name || message.sender?.email)
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