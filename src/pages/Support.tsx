import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../contexts/OrganizationContext';
import { SupportTicket, CreateTicketData, CreateMessageData } from '../types/tickets';
import {
  MessageSquare, Plus, Clock, CheckCircle, AlertCircle, XCircle, Send, Eye, Calendar, User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useLanguage } from '../contexts/LanguageContext';

interface TicketWithMessages extends SupportTicket {
  messages?: any[];
}

export function Support() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { language } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMessages | null>(null);
  const [newTicket, setNewTicket] = useState<CreateTicketData>({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const { data: ticketsData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    try {
      if (!user || !currentOrganization) {
        alert(language === 'tr' ? 'Kullanıcı veya organizasyon bilgisi bulunamadı.' : 'User or organization information not found.');
        return;
      }

      if (!newTicket.title.trim() || !newTicket.description.trim()) {
        alert(language === 'tr' ? 'Başlık ve açıklama gereklidir.' : 'Title and description are required.');
        return;
      }

      const ticketData = {
        ...newTicket,
        user_id: user.id,
        organization_id: currentOrganization.id
      };

      const { error } = await supabase
        .from('support_tickets')
        .insert(ticketData);

      if (error) throw error;

      // Reset form
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium'
      });
      setIsCreateDialogOpen(false);

      // Reload tickets
      await loadTickets();

      alert(language === 'tr' ? 'Destek talebiniz başarıyla oluşturuldu!' : 'Your support ticket was created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(language === 'tr' ? 'Talep oluşturulurken hata oluştu.' : 'Error occurred while creating ticket.');
    }
  };

  const viewTicket = async (ticket: SupportTicket) => {
    try {
      // Load messages for this ticket
      const { data: messagesData, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          sender:auth.users(id, email, user_metadata)
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setSelectedTicket({
        ...ticket,
        messages: messagesData || []
      });
      setNewMessage('');
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error loading ticket messages:', error);
    }
  };

  const sendMessage = async () => {
    try {
      if (!selectedTicket || !newMessage.trim()) return;

      const messageData: CreateMessageData = {
        ticket_id: selectedTicket.id,
        message: newMessage.trim(),
        sender_type: 'user'
      };

      const { error } = await supabase
        .from('ticket_messages')
        .insert(messageData);

      if (error) throw error;

      // Reload the ticket with updated messages
      await viewTicket(selectedTicket);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'tr' ? 'Destek' : 'Support'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {language === 'tr' 
                ? 'Destek talebinde bulunun ve mevcut taleplerinizi takip edin.'
                : 'Create support requests and track your existing tickets.'}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'tr' ? 'Yeni Talep' : 'New Ticket'}
              </Button>
            </DialogTrigger>
            <DialogContent className="support-dialog-content">
              <DialogHeader>
                <DialogTitle>
                  {language === 'tr' ? 'Yeni Destek Talebi' : 'New Support Ticket'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'tr' 
                    ? 'Yardıma ihtiyacınız olan konuyu detaylı olarak açıklayın.'
                    : 'Describe the issue you need help with in detail.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'tr' ? 'Başlık' : 'Title'}
                  </label>
                  <Input
                    placeholder={language === 'tr' ? 'Sorununuzu kısaca özetleyin' : 'Briefly summarize your issue'}
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    className="support-input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'tr' ? 'Açıklama' : 'Description'}
                  </label>
                  <Textarea
                    placeholder={language === 'tr' ? 'Sorununuzu detaylı olarak açıklayın...' : 'Describe your issue in detail...'}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="support-input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'tr' ? 'Öncelik' : 'Priority'}
                  </label>
                  <Select 
                    value={newTicket.priority} 
                    onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger className="support-input-field">
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
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'tr' ? 'İptal' : 'Cancel'}
                  </Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" onClick={createTicket}>
                    {language === 'tr' ? 'Talep Oluştur' : 'Create Ticket'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="support-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Toplam Talep' : 'Total Tickets'}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="support-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Açık' : 'Open'}
              </CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
            </CardContent>
          </Card>
          
          <Card className="support-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'İşlemde' : 'In Progress'}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_progress}</div>
            </CardContent>
          </Card>
          
          <Card className="support-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'tr' ? 'Çözüldü' : 'Resolved'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="support-panel-card">
          <CardHeader>
            <CardTitle>{language === 'tr' ? 'Destek Talepleriniz' : 'Your Support Tickets'}</CardTitle>
            <CardDescription>
              {language === 'tr' 
                ? 'Oluşturduğunuz destek taleplerini görüntüleyin ve takip edin.'
                : 'View and track your submitted support tickets.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{language === 'tr' ? 'Henüz destek talebiniz bulunmuyor.' : 'You don\'t have any support tickets yet.'}</p>
                <p className="text-sm mt-2">
                  {language === 'tr' 
                    ? 'Yardıma ihtiyacınız olduğunda "Yeni Talep" butonunu kullanabilirsiniz.'
                    : 'Use the "New Ticket" button when you need help.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="support-table-row border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => viewTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(ticket.status)}
                          <h3 className="font-medium">{ticket.title}</h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="support-view-button">
                        <Eye className="h-4 w-4 mr-1" />
                        {language === 'tr' ? 'Görüntüle' : 'View'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="support-dialog-content max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {selectedTicket?.title}
              </DialogTitle>
              <DialogDescription>
                {language === 'tr' ? 'Talep detayları ve mesaj geçmişi' : 'Ticket details and message history'}
              </DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="text-sm font-medium">{language === 'tr' ? 'Durum' : 'Status'}:</label>
                    <div>{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{language === 'tr' ? 'Öncelik' : 'Priority'}:</label>
                    <div>{getPriorityBadge(selectedTicket.priority)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{language === 'tr' ? 'Oluşturulma' : 'Created'}:</label>
                    <p className="text-sm text-gray-600">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{language === 'tr' ? 'Son Güncelleme' : 'Last Updated'}:</label>
                    <p className="text-sm text-gray-600">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Original Description */}
                <div>
                  <h4 className="font-medium mb-2">{language === 'tr' ? 'Açıklama' : 'Description'}</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Admin Response */}
                {selectedTicket.admin_response && (
                  <div>
                    <h4 className="font-medium mb-2">{language === 'tr' ? 'Admin Yanıtı' : 'Admin Response'}</h4>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">{selectedTicket.admin_response}</p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{language === 'tr' ? 'Mesaj Geçmişi' : 'Message History'}</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedTicket.messages.map((message: any) => (
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
                                : (language === 'tr' ? 'Siz' : 'You')
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
                )}

                {/* Add Message (only for open/in_progress tickets) */}
                {['open', 'in_progress'].includes(selectedTicket.status) && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === 'tr' ? 'Mesaj Ekle' : 'Add Message'}
                    </label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={language === 'tr' ? 'Mesajınızı yazın...' : 'Write your message...'}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                        className="support-input-field flex-1"
                      />
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Support;