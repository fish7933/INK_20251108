import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxxdrwwqdjkynbuyzrpz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGRyd3dxZGpreW5idXl6cnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAwNjYsImV4cCI6MjA3Nzc5NjA2Nn0._KflDSzupmXetTBSCPgQGoC1QUOQDU2gEL_D8XlM5hA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced Storage utility that works in iframe context with multiple fallback strategies
class StorageManager {
  private useSessionStorage: boolean = false;
  private memoryStorage: Record<string, string> = {};
  private storageAvailable: boolean = true;

  constructor() {
    this.detectStorageAvailability();
  }

  private detectStorageAvailability(): void {
    // Test localStorage
    try {
      const testKey = '_storage_test_' + Date.now();
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      this.useSessionStorage = false;
      this.storageAvailable = true;
      console.log('[StorageManager] localStorage available');
      return;
    } catch (e) {
      console.warn('[StorageManager] localStorage not available:', e);
    }

    // Test sessionStorage
    try {
      const testKey = '_storage_test_' + Date.now();
      sessionStorage.setItem(testKey, '1');
      sessionStorage.removeItem(testKey);
      this.useSessionStorage = true;
      this.storageAvailable = true;
      console.log('[StorageManager] sessionStorage available (fallback)');
      return;
    } catch (e) {
      console.warn('[StorageManager] sessionStorage not available:', e);
    }

    // Use memory storage as last resort
    this.storageAvailable = false;
    console.warn('[StorageManager] Using memory storage (data will be lost on page reload)');
  }

  setItem(key: string, value: string): void {
    try {
      if (!this.storageAvailable) {
        this.memoryStorage[key] = value;
        console.log(`[StorageManager] Stored in memory: ${key}`);
        return;
      }

      if (this.useSessionStorage) {
        sessionStorage.setItem(key, value);
        console.log(`[StorageManager] Stored in sessionStorage: ${key}`);
      } else {
        localStorage.setItem(key, value);
        console.log(`[StorageManager] Stored in localStorage: ${key}`);
      }
    } catch (e) {
      console.error('[StorageManager] setItem failed, using memory fallback:', e);
      this.memoryStorage[key] = value;
    }
  }

  getItem(key: string): string | null {
    try {
      if (!this.storageAvailable) {
        const value = this.memoryStorage[key] || null;
        console.log(`[StorageManager] Retrieved from memory: ${key} = ${value ? 'found' : 'not found'}`);
        return value;
      }

      if (this.useSessionStorage) {
        const value = sessionStorage.getItem(key);
        console.log(`[StorageManager] Retrieved from sessionStorage: ${key} = ${value ? 'found' : 'not found'}`);
        return value;
      } else {
        const value = localStorage.getItem(key);
        console.log(`[StorageManager] Retrieved from localStorage: ${key} = ${value ? 'found' : 'not found'}`);
        return value;
      }
    } catch (e) {
      console.error('[StorageManager] getItem failed, checking memory fallback:', e);
      return this.memoryStorage[key] || null;
    }
  }

  removeItem(key: string): void {
    try {
      if (!this.storageAvailable) {
        delete this.memoryStorage[key];
        console.log(`[StorageManager] Removed from memory: ${key}`);
        return;
      }

      if (this.useSessionStorage) {
        sessionStorage.removeItem(key);
        console.log(`[StorageManager] Removed from sessionStorage: ${key}`);
      } else {
        localStorage.removeItem(key);
        console.log(`[StorageManager] Removed from localStorage: ${key}`);
      }
    } catch (e) {
      console.error('[StorageManager] removeItem failed, removing from memory:', e);
      delete this.memoryStorage[key];
    }
  }

  isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  getStorageType(): string {
    if (!this.storageAvailable) return 'memory';
    return this.useSessionStorage ? 'sessionStorage' : 'localStorage';
  }
}

const storage = new StorageManager();

// Types
export interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  nationality: string | null;
  job_title: string;
  experience_years: number | null;
  expected_salary: number | null;
  salary_currency: string | null;
  certificates: string | null;
  previous_vessels: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  resume_filename: string | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  submitted_date: string;
  email_sent: boolean;
  email_sent_at: string | null;
  email_recipients: string[];
  resume_attached: boolean;
  agency_id: string | null;
}

export interface JobPosting {
  id: string;
  title: string;
  position: string;
  vessel_type: string;
  location: string;
  salary_range: string;
  requirements: string[];
  responsibilities: string[];
  status: 'active' | 'closed';
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash?: string;
  role: 'super_admin' | 'admin' | 'viewer';
  is_approved: boolean;
  permissions: {
    applications: { view: boolean; edit: boolean; delete: boolean };
    jobs: { view: boolean; edit: boolean; delete: boolean };
    admins: { view: boolean; edit: boolean; delete: boolean };
    settings: { view: boolean; edit: boolean; delete: boolean };
  };
  created_at: string;
}

export interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  nationality: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Agency {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PositionOption {
  id: string;
  name: string;
  created_at: string;
}

export interface VesselTypeOption {
  id: string;
  name: string;
  created_at: string;
}

export interface LocationOption {
  id: string;
  name: string;
  created_at: string;
}

export interface SalaryRangeOption {
  id: string;
  name: string;
  created_at: string;
}

export interface NationalityOption {
  id: string;
  name: string;
  created_at: string;
}

// Applications API
export const applicationsAPI = {
  async getAll(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_applications')
      .select('*')
      .order('submitted_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(application: Omit<Application, 'id' | 'submitted_date' | 'status' | 'email_sent' | 'email_sent_at' | 'email_recipients' | 'resume_attached'>, resumeFile?: File): Promise<Application> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_applications')
      .insert([{
        ...application,
        status: 'pending',
        submitted_date: new Date().toISOString(),
        email_sent: false,
        email_sent_at: null,
        email_recipients: [],
        resume_attached: false
      }])
      .select()
      .single();

    if (error) throw error;

    // Upload resume if provided
    if (resumeFile && data) {
      try {
        const { url } = await storageAPI.uploadResume(resumeFile, data.id);
        
        // Update application with resume URL
        const { error: updateError } = await supabase
          .from('app_7c39e793e3_applications')
          .update({ resume_url: url })
          .eq('id', data.id);

        if (updateError) throw updateError;
        
        data.resume_url = url;
      } catch (uploadError) {
        console.error('Error uploading resume:', uploadError);
      }
    }

    // Automatically send email notification after application is created
    try {
      await sendApplicationEmail(data.id);
    } catch (emailError) {
      console.error('Error sending application email:', emailError);
      // Don't throw error here - application was created successfully
      // Email sending failure shouldn't prevent application submission
    }

    return data;
  },

  async updateStatus(id: string, status: Application['status']): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_applications')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteMultiple(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_applications')
      .delete()
      .in('id', ids);

    if (error) throw error;
  }
};

// Job Postings API
export const jobPostingsAPI = {
  async getAll(): Promise<JobPosting[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_job_postings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<JobPosting[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_job_postings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<JobPosting | null> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job posting:', error);
      return null;
    }
    return data;
  },

  async create(job: Omit<JobPosting, 'id' | 'created_at'>): Promise<JobPosting> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_job_postings')
      .insert([{ ...job, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, job: Partial<Omit<JobPosting, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_job_postings')
      .update(job)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_applications')
      .delete()
      .eq('job_title', id);

    if (error) console.error('Error deleting related applications:', error);

    const { error: jobError } = await supabase
      .from('app_7c39e793e3_job_postings')
      .delete()
      .eq('id', id);

    if (jobError) throw jobError;
  },

  async deleteMultiple(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_job_postings')
      .delete()
      .in('id', ids);

    if (error) throw error;
  }
};

// Admin Authentication
export const adminAuth = {
  async login(username: string, password: string): Promise<AdminUser | null> {
    try {
      console.log('[AdminAuth] Login attempt for username:', username);
      console.log('[AdminAuth] Storage type:', storage.getStorageType());
      console.log('[AdminAuth] Is in iframe:', storage.isInIframe());

      const { data, error } = await supabase
        .from('app_7c39e793e3_admin_users')
        .select('*')
        .eq('username', username)
        .eq('is_approved', true)
        .single();

      if (error) {
        console.error('[AdminAuth] Database query error:', error);
        return null;
      }

      if (!data) {
        console.error('[AdminAuth] User not found or not approved');
        return null;
      }

      console.log('[AdminAuth] User found, verifying password...');

      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex === data.password_hash) {
        const { password_hash, ...userWithoutPassword } = data;
        console.log('[AdminAuth] Login successful for user:', username);
        return userWithoutPassword;
      }

      console.error('[AdminAuth] Invalid password');
      return null;
    } catch (error) {
      console.error('[AdminAuth] Login error:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    const hasUser = !!storage.getItem('admin_user');
    console.log('[AdminAuth] isAuthenticated:', hasUser);
    return hasUser;
  },

  getCurrentUser(): AdminUser | null {
    try {
      const userStr = storage.getItem('admin_user');
      if (!userStr) {
        console.log('[AdminAuth] No user found in storage');
        return null;
      }
      const user = JSON.parse(userStr);
      console.log('[AdminAuth] Current user:', user.username);
      return user;
    } catch (error) {
      console.error('[AdminAuth] Error getting current user:', error);
      return null;
    }
  },

  setCurrentUser(user: AdminUser): void {
    try {
      const userStr = JSON.stringify(user);
      storage.setItem('admin_user', userStr);
      console.log('[AdminAuth] User session saved:', user.username);
    } catch (error) {
      console.error('[AdminAuth] Error setting current user:', error);
      throw error;
    }
  },

  logout(): void {
    try {
      storage.removeItem('admin_user');
      console.log('[AdminAuth] User logged out');
    } catch (error) {
      console.error('[AdminAuth] Error during logout:', error);
    }
  }
};

// Admin Users API
export const adminUsersAPI = {
  async getAll(): Promise<Omit<AdminUser, 'password_hash'>[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .select('id, username, role, is_approved, permissions, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(username: string, password: string, role: AdminUser['role']): Promise<Omit<AdminUser, 'password_hash'>> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const defaultPermissions = {
      applications: { view: false, edit: false, delete: false },
      jobs: { view: false, edit: false, delete: false },
      admins: { view: false, edit: false, delete: false },
      settings: { view: false, edit: false, delete: false }
    };

    if (role === 'super_admin') {
      defaultPermissions.applications = { view: true, edit: true, delete: true };
      defaultPermissions.jobs = { view: true, edit: true, delete: true };
      defaultPermissions.admins = { view: true, edit: true, delete: true };
      defaultPermissions.settings = { view: true, edit: true, delete: true };
    } else if (role === 'admin') {
      defaultPermissions.applications = { view: true, edit: true, delete: true };
      defaultPermissions.jobs = { view: true, edit: true, delete: true };
      defaultPermissions.settings = { view: true, edit: false, delete: false };
    } else if (role === 'viewer') {
      defaultPermissions.applications = { view: true, edit: false, delete: false };
      defaultPermissions.jobs = { view: true, edit: false, delete: false };
    }

    const { data, error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .insert([{
        username,
        password_hash: passwordHash,
        role,
        is_approved: false,
        permissions: defaultPermissions,
        created_at: new Date().toISOString()
      }])
      .select('id, username, role, is_approved, permissions, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  async approve(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) throw error;
  },

  async reject(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(newPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .update({ password_hash: passwordHash })
      .eq('id', id);

    if (error) throw error;
  },

  async updatePermissions(id: string, permissions: AdminUser['permissions']): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .update({ permissions })
      .eq('id', id);

    if (error) throw error;
  },

  async updateRole(id: string, role: AdminUser['role']): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_admin_users')
      .update({ role })
      .eq('id', id);

    if (error) throw error;
  }
};

// Email Recipients API
export const emailRecipientsAPI = {
  async getAll(): Promise<EmailRecipient[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(recipient: Omit<EmailRecipient, 'id' | 'created_at'>): Promise<EmailRecipient> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .insert([{ ...recipient, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, recipient: Partial<Omit<EmailRecipient, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .update(recipient)
      .eq('id', id);

    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Agencies API
export const agenciesAPI = {
  async getAll(): Promise<Agency[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_agencies')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Agency[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_agencies')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(agency: Omit<Agency, 'id' | 'created_at'>): Promise<Agency> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_agencies')
      .insert([{ ...agency, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, agency: Partial<Omit<Agency, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_agencies')
      .update(agency)
      .eq('id', id);

    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_agencies')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_agencies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Position Options API
export const positionOptionsAPI = {
  async getAll(): Promise<PositionOption[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_position_options')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(name: string): Promise<PositionOption> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_position_options')
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_position_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Vessel Type Options API
export const vesselTypeOptionsAPI = {
  async getAll(): Promise<VesselTypeOption[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessel_type_options')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(name: string): Promise<VesselTypeOption> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_vessel_type_options')
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_vessel_type_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Location Options API
export const locationOptionsAPI = {
  async getAll(): Promise<LocationOption[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_location_options')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(name: string): Promise<LocationOption> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_location_options')
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_location_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Salary Range Options API
export const salaryRangeOptionsAPI = {
  async getAll(): Promise<SalaryRangeOption[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_salary_range_options')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(name: string): Promise<SalaryRangeOption> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_salary_range_options')
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_salary_range_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Nationality Options API
export const nationalityOptionsAPI = {
  async getAll(): Promise<NationalityOption[]> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_nationality_options')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(name: string): Promise<NationalityOption> {
    const { data, error } = await supabase
      .from('app_7c39e793e3_nationality_options')
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_7c39e793e3_nationality_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Storage API
export const storageAPI = {
  async uploadResume(file: File, applicationId: string): Promise<{ url: string; filename: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationId}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('app_7c39e793e3_resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('app_7c39e793e3_resumes')
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      filename: file.name
    };
  },

  async downloadResume(url: string, filename: string): Promise<void> {
    const path = url.split('/').pop();
    if (!path) throw new Error('Invalid file path');

    const { data, error } = await supabase.storage
      .from('app_7c39e793e3_resumes')
      .download(path);

    if (error) throw error;

    const blob = new Blob([data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
};

// Send Application Email
export async function sendApplicationEmail(applicationId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('app_7c39e793e3_send_application_email', {
    body: { applicationId }
  });

  if (error) throw error;
  return data;
}