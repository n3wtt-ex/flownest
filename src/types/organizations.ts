// Multi-tenant organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings: Record<string, any>;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  joined_at: string;
  organization?: Organization;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  joined_at: string;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  domain?: string;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationData {
  name?: string;
  domain?: string;
  settings?: Record<string, any>;
  subscription_plan?: 'starter' | 'professional' | 'enterprise';
  is_active?: boolean;
}

export interface InviteUserData {
  email: string;
  role: 'admin' | 'member';
}

export interface OrganizationContext {
  currentOrganization: Organization | null;
  userOrganizations: UserOrganization[];
  loading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  updateOrganization: (data: UpdateOrganizationData) => Promise<void>;
  inviteUser: (data: InviteUserData) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'owner' | 'admin' | 'member') => Promise<void>;
}

// Extended types for existing entities with organization support
export interface OrganizationAwareContact {
  id: string;
  organization_id: string;
  email?: string;
  full_name?: string;
  title?: string;
  company_id?: string;
  owner_id?: string;
  lifecycle_stage?: string;
  reply_status?: string;
  reply_summary?: string;
  phone?: string;
  linkedin_url?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationAwareCompany {
  id: string;
  organization_id: string;
  name: string;
  domain?: string;
  website?: string;
  linkedin?: string;
  location?: string;
  size?: string;
  industry?: string;
  description?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationAwareDeal {
  id: string;
  organization_id: string;
  title: string;
  contact_id?: string;
  company_id?: string;
  pipeline_id: string;
  stage_id: string;
  amount?: number;
  currency?: string;
  close_date?: string;
  status?: 'open' | 'won' | 'lost';
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationAwareCampaign {
  id: string;
  organization_id: string;
  name: string;
  status: string;
  progress?: number;
  sent?: number;
  clicks?: number;
  replied?: number;
  open_rate?: number;
  click_rate?: number;
  reply_rate?: number;
  positive_reply_rate?: number;
  opportunities?: number;
  conversions?: number;
  revenue?: number;
  webhook_campaign_id?: string;
  bounced_count?: number;
  created_at: string;
  updated_at: string;
}