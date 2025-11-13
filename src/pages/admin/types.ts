// Common types for admin dashboard
export interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  nationality: string;
  experience_years: number;
  expected_salary: number | null;
  certificates: string | null;
  previous_vessels: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  resume_filename: string | null;
  job_title: string;
  agency_id: string | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  submitted_date: string;
  email_sent: boolean;
  email_sent_at: string | null;
  email_recipients: string[] | null;
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
    admins: { view: boolean; edit: boolean };
    settings: { view: boolean; edit: boolean };
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
}

export interface VesselTypeOption {
  id: string;
  name: string;
}

export interface LocationOption {
  id: string;
  name: string;
}

export interface SalaryRangeOption {
  id: string;
  name: string;
}

export interface NationalityOption {
  id: string;
  name: string;
}