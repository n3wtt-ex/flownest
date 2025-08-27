export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SenderType = 'user' | 'admin';

export interface SupportTicket {
  id: string;
  user_id: string;
  organization_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  admin_response?: string;
  responded_by?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // Relations
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  organization?: {
    id: string;
    name: string;
    subscription_plan: string;
  };
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  sender_type: SenderType;
  created_at: string;
  // Relations
  sender?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: TicketPriority;
}

export interface CreateMessageData {
  ticket_id: string;
  message: string;
  sender_type: SenderType;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
  admin_response?: string;
  responded_by?: string;
  resolved_at?: string;
}

export interface TicketWithMessages extends SupportTicket {
  messages: TicketMessage[];
}