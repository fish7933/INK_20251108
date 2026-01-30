import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxxdrwwqdjkynbuyzrpz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGRyd3dxZGpreW5idXl6cnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAwNjYsImV4cCI6MjA3Nzc5NjA2Nn0._KflDSzupmXetTBSCPgQGoC1QUOQDU2gEL_D8XlM5hA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Vessel types
export interface Vessel {
  id: string;
  vessel_name: string;
  vessel_type: string;
  tonnage?: number;
  route?: string;
  flag?: string;
  built_year?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  vessel_id: string;
  position_name: string;
  rank: string;
  vacancies: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  contract_duration?: string;
  requirements?: string;
  responsibilities?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  vessel_id: string;
  position_id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality?: string;
  date_of_birth?: string;
  experience_years?: number;
  certificates?: string;
  previous_vessels?: string;
  expected_salary?: number;
  salary_currency: string;
  cover_letter?: string;
  resume_url?: string;
  resume_filename?: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  email_sent: boolean;
  email_sent_at?: string;
  email_recipients?: string[];
  resume_attached: boolean;
  submitted_date: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithRelations extends Application {
  vessel?: Vessel;
  position?: Position;
}

export interface PositionWithVessel extends Position {
  vessel?: Vessel;
}

// Vessels API
export const vesselsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Vessel[];
  },

  getActive: async () => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessels')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Vessel[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Vessel;
  },

  create: async (vessel: Omit<Vessel, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessels')
      .insert([vessel])
      .select()
      .single();
    
    if (error) throw error;
    return data as Vessel;
  },

  update: async (id: string, updates: Partial<Vessel>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessels')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Vessel;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('app_7c39e793e3_vessels')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Positions API
export const positionsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_positions')
      .select('*, vessel:app_7c39e793e3_vessels(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as PositionWithVessel[];
  },

  getByVessel: async (vesselId: string) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_positions')
      .select('*')
      .eq('vessel_id', vesselId)
      .eq('is_active', true)
      .order('rank', { ascending: true });
    
    if (error) throw error;
    return data as Position[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_positions')
      .select('*, vessel:app_7c39e793e3_vessels(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as PositionWithVessel;
  },

  create: async (position: Omit<Position, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_positions')
      .insert([position])
      .select()
      .single();
    
    if (error) throw error;
    return data as Position;
  },

  update: async (id: string, updates: Partial<Position>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_positions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Position;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('app_7c39e793e3_positions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Applications API
export const applicationsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_applications')
      .select('*, vessel:app_7c39e793e3_vessels(*), position:app_7c39e793e3_positions(*)')
      .order('submitted_date', { ascending: false });
    
    if (error) throw error;
    return data as ApplicationWithRelations[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_applications')
      .select('*, vessel:app_7c39e793e3_vessels(*), position:app_7c39e793e3_positions(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ApplicationWithRelations;
  },

  create: async (application: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'submitted_date' | 'email_sent' | 'email_sent_at' | 'email_recipients' | 'resume_attached' | 'status'>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_applications')
      .insert([application])
      .select()
      .single();
    
    if (error) throw error;

    // Send emails (admin + applicant confirmation)
    try {
      await sendApplicationEmail(data.id);
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
    }

    return data as Application;
  },

  update: async (id: string, updates: Partial<Application>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Application;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('app_7c39e793e3_applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Email Recipients API
export interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  nationality?: string;
  is_active: boolean;
  created_at: string;
}

export const emailRecipientsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as EmailRecipient[];
  },

  create: async (recipient: Omit<EmailRecipient, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .insert([recipient])
      .select()
      .single();
    
    if (error) throw error;
    return data as EmailRecipient;
  },

  update: async (id: string, updates: Partial<EmailRecipient>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmailRecipient;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Admin Users API
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const adminUsersAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as AdminUser[];
  },

  create: async (user: Omit<AdminUser, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data as AdminUser;
  },

  update: async (id: string, updates: Partial<AdminUser>) => {
    const { data, error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as AdminUser;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Email sending function
export const sendApplicationEmail = async (applicationId: string) => {
  const { data, error } = await supabase.functions.invoke('app_7c39e793e3_send_application_email', {
    body: { applicationId },
  });

  if (error) throw error;
  return data;
};

// Storage functions
export const uploadResume = async (file: File, applicationId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${applicationId}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('app_7c39e793e3_resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('app_7c39e793e3_resumes')
    .getPublicUrl(filePath);

  return {
    url: filePath,
    publicUrl: urlData.publicUrl,
    filename: file.name,
  };
};