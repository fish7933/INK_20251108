import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Lock, Eye, Mail, Phone, Calendar, FileText, Ship, Loader2, Plus, Edit, Trash2, UserPlus, Check, X, Key, CheckCircle2, XCircle, Info, Download, DollarSign, Paperclip, Building2, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { 
  applicationsAPI, 
  jobPostingsAPI, 
  adminAuth,
  adminUsersAPI,
  emailRecipientsAPI,
  agenciesAPI,
  positionOptionsAPI, 
  vesselTypeOptionsAPI,
  locationOptionsAPI,
  salaryRangeOptionsAPI,
  nationalityOptionsAPI,
  storageAPI,
  Application, 
  JobPosting,
  AdminUser,
  EmailRecipient,
  Agency,
  PositionOption, 
  VesselTypeOption,
  LocationOption,
  SalaryRangeOption,
  NationalityOption
} from '@/lib/supabase';

export default function CareersAdmin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [adminUsers, setAdminUsers] = useState<Omit<AdminUser, 'password_hash'>[]>([]);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);
  const [vesselTypeOptions, setVesselTypeOptions] = useState<VesselTypeOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [salaryRangeOptions, setSalaryRangeOptions] = useState<SalaryRangeOption[]>([]);
  const [nationalityOptions, setNationalityOptions] = useState<NationalityOption[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Omit<AdminUser, 'password_hash'> | null>(null);
  const [selectedEmailRecipient, setSelectedEmailRecipient] = useState<EmailRecipient | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [showEmailRecipientForm, setShowEmailRecipientForm] = useState(false);
  const [showEmailRecipientDetail, setShowEmailRecipientDetail] = useState(false);
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [newPositionName, setNewPositionName] = useState('');
  const [newVesselTypeName, setNewVesselTypeName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newSalaryRangeName, setNewSalaryRangeName] = useState('');
  const [newNationalityName, setNewNationalityName] = useState('');
  const [openJobGroups, setOpenJobGroups] = useState<string[]>([]);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' as AdminUser['role']
  });
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [emailRecipientFormData, setEmailRecipientFormData] = useState({
    email: '',
    name: '',
    nationality: '',
    is_active: true
  });
  const [agencyFormData, setAgencyFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });
  const [jobFormData, setJobFormData] = useState({
    title: '',
    position: '',
    vessel_type: '',
    location: '',
    salary_range: '',
    requirements: '',
    responsibilities: '',
    status: 'active' as 'active' | 'closed'
  });

  useEffect(() => {
    console.log('[CareersAdmin] Component mounted, checking authentication...');
    const checkAuth = () => {
      const isAuth = adminAuth.isAuthenticated();
      console.log('[CareersAdmin] isAuthenticated:', isAuth);
      
      if (isAuth) {
        const user = adminAuth.getCurrentUser();
        console.log('[CareersAdmin] Current user:', user?.username);
        setCurrentUser(user);
        setIsAuthenticated(true);
        loadData();
      } else {
        console.log('[CareersAdmin] Not authenticated');
      }
    };
    
    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = adminAuth.getCurrentUser();
      
      // Load applications if user has permission
      if (user?.permissions.applications.view) {
        try {
          const appsData = await applicationsAPI.getAll();
          setApplications(appsData);
        } catch (error) {
          console.error('Error loading applications:', error);
          setApplications([]);
        }
      }
      
      // Load jobs if user has permission
      if (user?.permissions.jobs.view) {
        try {
          const jobsData = await jobPostingsAPI.getAll();
          setJobPostings(jobsData);
        } catch (error) {
          console.error('Error loading jobs:', error);
          setJobPostings([]);
        }
      }
      
      // Load admin users if user has permission
      if (user?.permissions.admins.view) {
        try {
          const adminsData = await adminUsersAPI.getAll();
          setAdminUsers(adminsData);
        } catch (error) {
          console.error('Error loading admin users:', error);
          setAdminUsers([]);
        }
      }
      
      // Load settings if user has permission
      if (user?.permissions.settings.view) {
        try {
          const emailRecipientsData = await emailRecipientsAPI.getAll();
          setEmailRecipients(emailRecipientsData);
        } catch (error) {
          console.error('Error loading email recipients:', error);
          setEmailRecipients([]);
        }

        try {
          const agenciesData = await agenciesAPI.getAll();
          setAgencies(agenciesData);
        } catch (error) {
          console.error('Error loading agencies:', error);
          setAgencies([]);
        }

        try {
          const positionsData = await positionOptionsAPI.getAll();
          setPositionOptions(positionsData);
        } catch (error) {
          console.error('Error loading positions:', error);
          setPositionOptions([]);
        }

        try {
          const vesselTypesData = await vesselTypeOptionsAPI.getAll();
          setVesselTypeOptions(vesselTypesData);
        } catch (error) {
          console.error('Error loading vessel types:', error);
          setVesselTypeOptions([]);
        }

        try {
          const locationsData = await locationOptionsAPI.getAll();
          setLocationOptions(locationsData);
        } catch (error) {
          console.error('Error loading locations:', error);
          setLocationOptions([]);
        }

        try {
          const salaryRangesData = await salaryRangeOptionsAPI.getAll();
          setSalaryRangeOptions(salaryRangesData);
        } catch (error) {
          console.error('Error loading salary ranges:', error);
          setSalaryRangeOptions([]);
        }

        try {
          const nationalitiesData = await nationalityOptionsAPI.getAll();
          setNationalityOptions(nationalitiesData);
        } catch (error) {
          console.error('Error loading nationalities:', error);
          setNationalityOptions([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (application: Application) => {
    if (!application.resume_url || !application.resume_filename) {
      toast.error('No resume file available');
      return;
    }

    try {
      setDownloadingResume(true);
      await storageAPI.downloadResume(application.resume_url, application.resume_filename);
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloadingResume(false);
    }
  };

  const formatSalary = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString('en-US')}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.username || !loginForm.password) {
      toast.error('Please enter username and password');
      return;
    }

    try {
      setUpdating(true);
      console.log('[CareersAdmin] Attempting login for:', loginForm.username);
      
      const user = await adminAuth.login(loginForm.username, loginForm.password);
      
      if (user) {
        console.log('[CareersAdmin] Login successful, setting user session...');
        
        // Save user session
        adminAuth.setCurrentUser(user);
        
        // Wait a bit for storage to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify session was saved
        const savedUser = adminAuth.getCurrentUser();
        console.log('[CareersAdmin] Verification - saved user:', savedUser?.username);
        
        if (!savedUser) {
          console.error('[CareersAdmin] Session was not saved properly!');
          toast.error('Session storage failed. Please try using the auto-generated domain instead of the forwarded domain.');
          return;
        }
        
        // Update state
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        console.log('[CareersAdmin] State updated, loading data...');
        toast.success('Login successful');
        
        // Load data
        await loadData();
      } else {
        console.error('[CareersAdmin] Login failed - invalid credentials');
        toast.error('Invalid username or password');
      }
    } catch (error) {
      console.error('[CareersAdmin] Login error:', error);
      toast.error('Login failed. Please check console for details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    adminAuth.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
    navigate('/careers');
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    if (!currentUser?.permissions.applications.edit) {
      toast.error('You do not have permission to edit applications');
      return;
    }

    try {
      setUpdating(true);
      await applicationsAPI.updateStatus(id, status);
      
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status } : app
      ));
      
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status });
      }
      
      toast.success('Application status updated');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!currentUser?.permissions.applications.delete) {
      toast.error('You do not have permission to delete applications');
      return;
    }

    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      setUpdating(true);
      await applicationsAPI.delete(id);
      setApplications(applications.filter(app => app.id !== id));
      
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
      
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSelectedApplications = async () => {
    if (!currentUser?.permissions.applications.delete) {
      toast.error('You do not have permission to delete applications');
      return;
    }

    if (selectedApplicationIds.length === 0) {
      toast.error('Please select applications to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedApplicationIds.length} application(s)?`)) {
      return;
    }

    try {
      setUpdating(true);
      await applicationsAPI.deleteMultiple(selectedApplicationIds);
      setApplications(applications.filter(app => !selectedApplicationIds.includes(app.id)));
      setSelectedApplicationIds([]);
      toast.success(`${selectedApplicationIds.length} application(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting applications:', error);
      toast.error('Failed to delete applications');
    } finally {
      setUpdating(false);
    }
  };

  const toggleApplicationSelection = (id: string) => {
    setSelectedApplicationIds(prev =>
      prev.includes(id) ? prev.filter(appId => appId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllApplications = (appList: Application[]) => {
    if (selectedApplicationIds.length === appList.length) {
      setSelectedApplicationIds([]);
    } else {
      setSelectedApplicationIds(appList.map(app => app.id));
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!currentUser?.permissions.jobs.delete) {
      toast.error('You do not have permission to delete job postings');
      return;
    }

    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      setUpdating(true);
      await jobPostingsAPI.delete(id);
      setJobPostings(jobPostings.filter(job => job.id !== id));
      toast.success('Job posting deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job posting');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSelectedJobs = async () => {
    if (!currentUser?.permissions.jobs.delete) {
      toast.error('You do not have permission to delete job postings');
      return;
    }

    if (selectedJobIds.length === 0) {
      toast.error('Please select job postings to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedJobIds.length} job posting(s)?`)) {
      return;
    }

    try {
      setUpdating(true);
      await jobPostingsAPI.deleteMultiple(selectedJobIds);
      setJobPostings(jobPostings.filter(job => !selectedJobIds.includes(job.id)));
      setSelectedJobIds([]);
      toast.success(`${selectedJobIds.length} job posting(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting job postings:', error);
      toast.error('Failed to delete job postings');
    } finally {
      setUpdating(false);
    }
  };

  const toggleJobSelection = (id: string) => {
    setSelectedJobIds(prev =>
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllJobs = () => {
    if (selectedJobIds.length === jobPostings.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(jobPostings.map(job => job.id));
    }
  };

  const toggleJobGroup = (jobTitle: string) => {
    setOpenJobGroups(prev =>
      prev.includes(jobTitle) ? prev.filter(t => t !== jobTitle) : [...prev, jobTitle]
    );
  };

  const handleCreateAgency = () => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setAgencyFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      is_active: true
    });
    setSelectedAgency(null);
    setShowAgencyForm(true);
  };

  const handleEditAgency = (agency: Agency) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setSelectedAgency(agency);
    setAgencyFormData({
      name: agency.name,
      contact_person: agency.contact_person || '',
      email: agency.email || '',
      phone: agency.phone || '',
      address: agency.address || '',
      is_active: agency.is_active
    });
    setShowAgencyForm(true);
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agencyFormData.name) {
      toast.error('Please enter agency name');
      return;
    }

    try {
      setUpdating(true);
      
      const agencyData = {
        name: agencyFormData.name,
        contact_person: agencyFormData.contact_person || null,
        email: agencyFormData.email || null,
        phone: agencyFormData.phone || null,
        address: agencyFormData.address || null,
        is_active: agencyFormData.is_active
      };

      if (selectedAgency) {
        await agenciesAPI.update(selectedAgency.id, agencyData);
        setAgencies(agencies.map(a =>
          a.id === selectedAgency.id ? { ...a, ...agencyData } : a
        ));
        toast.success('Agency updated successfully');
      } else {
        const newAgency = await agenciesAPI.create(agencyData);
        setAgencies([newAgency, ...agencies]);
        toast.success('Agency added successfully');
      }
      
      setShowAgencyForm(false);
      setSelectedAgency(null);
    } catch (error) {
      console.error('Error saving agency:', error);
      toast.error('Failed to save agency');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAgencyActive = async (id: string, isActive: boolean) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    try {
      setUpdating(true);
      await agenciesAPI.toggleActive(id, isActive);
      setAgencies(agencies.map(a =>
        a.id === id ? { ...a, is_active: isActive } : a
      ));
      toast.success(`Agency ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling agency:', error);
      toast.error('Failed to update agency');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAgency = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this agency?')) {
      return;
    }

    try {
      setUpdating(true);
      await agenciesAPI.delete(id);
      setAgencies(agencies.filter(a => a.id !== id));
      toast.success('Agency deleted successfully');
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast.error('Failed to delete agency');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newPositionName.trim()) {
      toast.error('Please enter a position name');
      return;
    }

    try {
      setUpdating(true);
      const newPosition = await positionOptionsAPI.create(newPositionName.trim());
      setPositionOptions([...positionOptions, newPosition].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPositionName('');
      toast.success('Position added successfully');
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Failed to add position');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this position?')) {
      return;
    }

    try {
      setUpdating(true);
      await positionOptionsAPI.delete(id);
      setPositionOptions(positionOptions.filter(pos => pos.id !== id));
      toast.success('Position deleted successfully');
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete position');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddVesselType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newVesselTypeName.trim()) {
      toast.error('Please enter a vessel type name');
      return;
    }

    try {
      setUpdating(true);
      const newVesselType = await vesselTypeOptionsAPI.create(newVesselTypeName.trim());
      setVesselTypeOptions([...vesselTypeOptions, newVesselType].sort((a, b) => a.name.localeCompare(b.name)));
      setNewVesselTypeName('');
      toast.success('Vessel type added successfully');
    } catch (error) {
      console.error('Error adding vessel type:', error);
      toast.error('Failed to add vessel type');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteVesselType = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this vessel type?')) {
      return;
    }

    try {
      setUpdating(true);
      await vesselTypeOptionsAPI.delete(id);
      setVesselTypeOptions(vesselTypeOptions.filter(vt => vt.id !== id));
      toast.success('Vessel type deleted successfully');
    } catch (error) {
      console.error('Error deleting vessel type:', error);
      toast.error('Failed to delete vessel type');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newLocationName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    try {
      setUpdating(true);
      const newLocation = await locationOptionsAPI.create(newLocationName.trim());
      setLocationOptions([...locationOptions, newLocation].sort((a, b) => a.name.localeCompare(b.name)));
      setNewLocationName('');
      toast.success('Location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      setUpdating(true);
      await locationOptionsAPI.delete(id);
      setLocationOptions(locationOptions.filter(loc => loc.id !== id));
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSalaryRange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newSalaryRangeName.trim()) {
      toast.error('Please enter a salary range');
      return;
    }

    try {
      setUpdating(true);
      const newSalaryRange = await salaryRangeOptionsAPI.create(newSalaryRangeName.trim());
      setSalaryRangeOptions([...salaryRangeOptions, newSalaryRange].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSalaryRangeName('');
      toast.success('Salary range added successfully');
    } catch (error) {
      console.error('Error adding salary range:', error);
      toast.error('Failed to add salary range');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSalaryRange = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this salary range?')) {
      return;
    }

    try {
      setUpdating(true);
      await salaryRangeOptionsAPI.delete(id);
      setSalaryRangeOptions(salaryRangeOptions.filter(sr => sr.id !== id));
      toast.success('Salary range deleted successfully');
    } catch (error) {
      console.error('Error deleting salary range:', error);
      toast.error('Failed to delete salary range');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNationality = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newNationalityName.trim()) {
      toast.error('Please enter a nationality');
      return;
    }

    try {
      setUpdating(true);
      const newNationality = await nationalityOptionsAPI.create(newNationalityName.trim());
      setNationalityOptions([...nationalityOptions, newNationality].sort((a, b) => a.name.localeCompare(b.name)));
      setNewNationalityName('');
      toast.success('Nationality added successfully');
    } catch (error) {
      console.error('Error adding nationality:', error);
      toast.error('Failed to add nationality');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteNationality = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this nationality?')) {
      return;
    }

    try {
      setUpdating(true);
      await nationalityOptionsAPI.delete(id);
      setNationalityOptions(nationalityOptions.filter(nat => nat.id !== id));
      toast.success('Nationality deleted successfully');
    } catch (error) {
      console.error('Error deleting nationality:', error);
      toast.error('Failed to delete nationality');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateEmailRecipient = () => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setEmailRecipientFormData({
      email: '',
      name: '',
      nationality: '',
      is_active: true
    });
    setSelectedEmailRecipient(null);
    setShowEmailRecipientForm(true);
  };

  const handleViewEmailRecipient = (recipient: EmailRecipient) => {
    setSelectedEmailRecipient(recipient);
    setShowEmailRecipientDetail(true);
  };

  const handleEditEmailRecipient = (recipient: EmailRecipient) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    // Close detail modal if open
    setShowEmailRecipientDetail(false);
    
    setSelectedEmailRecipient(recipient);
    setEmailRecipientFormData({
      email: recipient.email,
      name: recipient.name,
      nationality: recipient.nationality ?? '',
      is_active: recipient.is_active
    });
    setShowEmailRecipientForm(true);
  };

  const handleSaveEmailRecipient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRecipientFormData.email || !emailRecipientFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      
      const recipientData = {
        email: emailRecipientFormData.email,
        name: emailRecipientFormData.name,
        nationality: emailRecipientFormData.nationality || null,
        is_active: emailRecipientFormData.is_active
      };

      if (selectedEmailRecipient) {
        await emailRecipientsAPI.update(selectedEmailRecipient.id, recipientData);
        setEmailRecipients(emailRecipients.map(r =>
          r.id === selectedEmailRecipient.id ? { ...r, ...recipientData } : r
        ));
        toast.success('Email recipient updated successfully');
      } else {
        const newRecipient = await emailRecipientsAPI.create(recipientData);
        setEmailRecipients([newRecipient, ...emailRecipients]);
        toast.success('Email recipient added successfully');
      }
      
      setShowEmailRecipientForm(false);
      setSelectedEmailRecipient(null);
    } catch (error) {
      console.error('Error saving email recipient:', error);
      toast.error('Failed to save email recipient');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleEmailRecipientActive = async (id: string, isActive: boolean) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    try {
      setUpdating(true);
      await emailRecipientsAPI.toggleActive(id, isActive);
      setEmailRecipients(emailRecipients.map(r =>
        r.id === id ? { ...r, is_active: isActive } : r
      ));
      toast.success(`Email recipient ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling email recipient:', error);
      toast.error('Failed to update email recipient');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEmailRecipient = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this email recipient?')) {
      return;
    }

    try {
      setUpdating(true);
      await emailRecipientsAPI.delete(id);
      setEmailRecipients(emailRecipients.filter(r => r.id !== id));
      toast.success('Email recipient deleted successfully');
    } catch (error) {
      console.error('Error deleting email recipient:', error);
      toast.error('Failed to delete email recipient');
    } finally {
      setUpdating(false);
    }
  };

  const handleJobFormChange = (field: string, value: string) => {
    setJobFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetJobForm = () => {
    setJobFormData({
      title: '',
      position: '',
      vessel_type: '',
      location: '',
      salary_range: '',
      requirements: '',
      responsibilities: '',
      status: 'active'
    });
    setSelectedJob(null);
    setShowJobForm(false);
  };

  const handleCreateJob = () => {
    if (!currentUser?.permissions.jobs.edit) {
      toast.error('You do not have permission to create job postings');
      return;
    }

    resetJobForm();
    setShowJobForm(true);
  };

  const handleEditJob = (job: JobPosting) => {
    if (!currentUser?.permissions.jobs.edit) {
      toast.error('You do not have permission to edit job postings');
      return;
    }

    setSelectedJob(job);
    setJobFormData({
      title: job.title,
      position: job.position,
      vessel_type: job.vessel_type,
      location: job.location,
      salary_range: job.salary_range,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
      status: job.status
    });
    setShowJobForm(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobFormData.title || !jobFormData.position || !jobFormData.vessel_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);
      
      const jobData = {
        title: jobFormData.title,
        position: jobFormData.position,
        vessel_type: jobFormData.vessel_type,
        location: jobFormData.location,
        salary_range: jobFormData.salary_range,
        requirements: jobFormData.requirements.split('\n').filter(r => r.trim()),
        responsibilities: jobFormData.responsibilities.split('\n').filter(r => r.trim()),
        status: jobFormData.status
      };

      if (selectedJob) {
        await jobPostingsAPI.update(selectedJob.id, jobData);
        setJobPostings(jobPostings.map(job =>
          job.id === selectedJob.id ? { ...job, ...jobData } : job
        ));
        toast.success('Job posting updated successfully');
      } else {
        const newJob = await jobPostingsAPI.create(jobData);
        setJobPostings([newJob, ...jobPostings]);
        toast.success('Job posting created successfully');
      }
      
      resetJobForm();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job posting');
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestAdminAccess = () => {
    setAdminFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'viewer'
    });
    setShowAdminForm(true);
  };

  const handleCreateAdmin = () => {
    setAdminFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'viewer'
    });
    setShowAdminForm(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminFormData.username || !adminFormData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (adminFormData.password !== adminFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (adminFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdating(true);
      const newAdmin = await adminUsersAPI.create(
        adminFormData.username,
        adminFormData.password,
        adminFormData.role
      );
      
      setAdminUsers([...adminUsers, newAdmin]);
      setShowAdminForm(false);
      toast.success('Admin user created successfully. Waiting for approval.');
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create admin user');
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveAdmin = async (id: string) => {
    if (!currentUser?.permissions.admins.edit) {
      toast.error('You do not have permission to approve admins');
      return;
    }

    try {
      setUpdating(true);
      await adminUsersAPI.approve(id);
      setAdminUsers(adminUsers.map(admin =>
        admin.id === id ? { ...admin, is_approved: true } : admin
      ));
      toast.success('Admin approved successfully');
    } catch (error) {
      console.error('Error approving admin:', error);
      toast.error('Failed to approve admin');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectAdmin = async (id: string) => {
    if (!currentUser?.permissions.admins.edit) {
      toast.error('You do not have permission to reject admins');
      return;
    }

    if (!confirm('Are you sure you want to reject this admin request?')) {
      return;
    }

    try {
      setUpdating(true);
      await adminUsersAPI.reject(id);
      setAdminUsers(adminUsers.filter(admin => admin.id !== id));
      toast.success('Admin request rejected');
    } catch (error) {
      console.error('Error rejecting admin:', error);
      toast.error('Failed to reject admin');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!currentUser?.permissions.admins.edit) {
      toast.error('You do not have permission to delete admins');
      return;
    }

    if (id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      setUpdating(true);
      await adminUsersAPI.delete(id);
      setAdminUsers(adminUsers.filter(admin => admin.id !== id));
      toast.success('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = (admin: Omit<AdminUser, 'password_hash'>) => {
    if (currentUser?.id !== admin.id && !currentUser?.permissions.admins.edit) {
      toast.error('You can only change your own password');
      return;
    }

    setSelectedAdmin(admin);
    setPasswordFormData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordFormData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdating(true);
      await adminUsersAPI.updatePassword(selectedAdmin!.id, passwordFormData.newPassword);
      setShowPasswordForm(false);
      setSelectedAdmin(null);
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditPermissions = (admin: Omit<AdminUser, 'password_hash'>) => {
    if (!currentUser?.permissions.admins.edit) {
      toast.error('You do not have permission to edit permissions');
      return;
    }

    setSelectedAdmin(admin);
    setShowPermissionsForm(true);
  };

  const handleUpdatePermissions = async (adminId: string, category: string, action: string, value: boolean) => {
    if (!currentUser?.permissions.admins.edit) {
      toast.error('You do not have permission to update permissions');
      return;
    }

    const admin = adminUsers.find(a => a.id === adminId);
    if (!admin) return;

    const updatedPermissions = {
      ...admin.permissions,
      [category]: {
        ...admin.permissions[category as keyof typeof admin.permissions],
        [action]: value
      }
    };

    try {
      setUpdating(true);
      await adminUsersAPI.updatePermissions(adminId, updatedPermissions);
      setAdminUsers(adminUsers.map(a =>
        a.id === adminId ? { ...a, permissions: updatedPermissions } : a
      ));
      
      // Update selectedAdmin if it's the same admin
      if (selectedAdmin?.id === adminId) {
        setSelectedAdmin({ ...selectedAdmin, permissions: updatedPermissions });
      }
      
      toast.success('Permissions updated');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateRole = async (adminId: string, role: AdminUser['role']) => {
    if (!currentUser?.permissions.admins.edit) {
      toast.error('You do not have permission to update roles');
      return;
    }

    try {
      setUpdating(true);
      await adminUsersAPI.updateRole(adminId, role);
      setAdminUsers(adminUsers.map(a =>
        a.id === adminId ? { ...a, role } : a
      ));
      toast.success('Role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getJobStatusBadge = (status: JobPosting['status']) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">CLOSED</Badge>
    );
  };

  const getRoleBadge = (role: AdminUser['role']) => {
    const variants = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[role]}>{role.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getEmailStatusBadge = (app: Application) => {
    if (app.email_sent) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sent
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-semibold mb-1">Email sent at:</p>
                <p>{app.email_sent_at ? new Date(app.email_sent_at).toLocaleString() : 'N/A'}</p>
                {app.email_recipients && app.email_recipients.length > 0 && (
                  <>
                    <p className="font-semibold mt-2 mb-1">Recipients:</p>
                    <ul className="list-disc list-inside">
                      {app.email_recipients.map((email, idx) => (
                        <li key={idx}>{email}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Not Sent
        </Badge>
      );
    }
  };

  const renderApplicationTable = (appList: Application[]) => {
    const allSelected = appList.length > 0 && selectedApplicationIds.length === appList.length;
    const canDelete = currentUser?.permissions.applications.delete;
    
    return (
      <>
        {appList.length > 0 && selectedApplicationIds.length > 0 && canDelete && (
          <div className="mb-4 flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelectedApplications}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Selected ({selectedApplicationIds.length})
            </Button>
          </div>
        )}
        {appList.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No applications yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {canDelete && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => toggleSelectAllApplications(appList)}
                    />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Notification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appList.map((app) => (
                <TableRow key={app.id}>
                  {canDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selectedApplicationIds.includes(app.id)}
                        onCheckedChange={() => toggleApplicationSelection(app.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{app.full_name}</TableCell>
                  <TableCell>{app.job_title}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>
                    {new Date(app.submitted_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{getEmailStatusBadge(app)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteApplication(app.id)}
                          disabled={updating}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </>
    );
  };

  const renderApplicationsByJob = () => {
    // Group applications by job title
    const applicationsByJob = applications.reduce((acc, app) => {
      const jobTitle = app.job_title;
      if (!acc[jobTitle]) {
        acc[jobTitle] = [];
      }
      acc[jobTitle].push(app);
      return acc;
    }, {} as Record<string, Application[]>);

    // Get job titles sorted by application count (descending)
    const jobTitles = Object.keys(applicationsByJob).sort((a, b) => 
      applicationsByJob[b].length - applicationsByJob[a].length
    );

    if (jobTitles.length === 0) {
      return (
        <p className="text-center py-8 text-gray-500">
          No applications yet
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {jobTitles.map((jobTitle) => {
          const jobApps = applicationsByJob[jobTitle];
          const isOpen = openJobGroups.includes(jobTitle);
          const statusCounts = {
            pending: jobApps.filter(a => a.status === 'pending').length,
            reviewed: jobApps.filter(a => a.status === 'reviewed').length,
            shortlisted: jobApps.filter(a => a.status === 'shortlisted').length,
            rejected: jobApps.filter(a => a.status === 'rejected').length
          };

          return (
            <Card key={jobTitle}>
              <Collapsible open={isOpen} onOpenChange={() => toggleJobGroup(jobTitle)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{jobTitle}</CardTitle>
                          <CardDescription className="mt-1">
                            {jobApps.length} application{jobApps.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {statusCounts.pending > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending: {statusCounts.pending}
                          </Badge>
                        )}
                        {statusCounts.reviewed > 0 && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Reviewed: {statusCounts.reviewed}
                          </Badge>
                        )}
                        {statusCounts.shortlisted > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            Shortlisted: {statusCounts.shortlisted}
                          </Badge>
                        )}
                        {statusCounts.rejected > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            Rejected: {statusCounts.rejected}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    {renderApplicationTable(jobApps)}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="Enter username"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    disabled={updating}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/careers')}
                >
                  Back to Careers
                </Button>
              </form>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRequestAdminAccess}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Request Admin Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Form Modal for Request Access */}
        {showAdminForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">Request Admin Access</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdminForm(false)}
                  >
                    ✕
                  </Button>
                </div>
                <CardDescription>
                  Your request will need to be approved by an existing admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_username">Username *</Label>
                    <Input
                      id="new_username"
                      value={adminFormData.username}
                      onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                      placeholder="Enter username"
                      required
                      disabled={updating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Password *</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      placeholder="Enter password (min 6 characters)"
                      required
                      disabled={updating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={adminFormData.confirmPassword}
                      onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      required
                      disabled={updating}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAdminForm(false)}
                      className="flex-1"
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, {currentUser?.username} ({getRoleBadge(currentUser!.role)})
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {currentUser?.permissions.applications.view && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Applications</CardDescription>
                    <CardTitle className="text-3xl">{applications.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Pending Review</CardDescription>
                    <CardTitle className="text-3xl">
                      {applications.filter(a => a.status === 'pending').length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </>
            )}
            {currentUser?.permissions.jobs.view && (
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active Jobs</CardDescription>
                  <CardTitle className="text-3xl">
                    {jobPostings.filter(j => j.status === 'active').length}
                  </CardTitle>
                </CardHeader>
              </Card>
            )}
            {currentUser?.permissions.applications.view && (
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Shortlisted</CardDescription>
                  <CardTitle className="text-3xl">
                    {applications.filter(a => a.status === 'shortlisted').length}
                  </CardTitle>
                </CardHeader>
              </Card>
            )}
          </div>

          <Tabs defaultValue="applications" className="space-y-6">
            <TabsList>
              {currentUser?.permissions.applications.view && (
                <TabsTrigger value="applications">Applications</TabsTrigger>
              )}
              {currentUser?.permissions.jobs.view && (
                <TabsTrigger value="jobs">Job Postings</TabsTrigger>
              )}
              {currentUser?.permissions.admins.view && (
                <TabsTrigger value="admins">Admin Users</TabsTrigger>
              )}
              {currentUser?.permissions.settings.view && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            {currentUser?.permissions.applications.view && (
              <TabsContent value="applications" className="space-y-6">
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Applications</TabsTrigger>
                    <TabsTrigger value="by-job">By Job Posting</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <Card>
                      <CardHeader>
                        <CardTitle>All Applications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationTable(applications)}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="by-job">
                    <Card>
                      <CardHeader>
                        <CardTitle>Applications by Job Posting</CardTitle>
                        <CardDescription>
                          Click on a job posting to expand and view its applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationsByJob()}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pending">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pending Applications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationTable(applications.filter(a => a.status === 'pending'))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="shortlisted">
                    <Card>
                      <CardHeader>
                        <CardTitle>Shortlisted Candidates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationTable(applications.filter(a => a.status === 'shortlisted'))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            )}

            {currentUser?.permissions.jobs.view && (
              <TabsContent value="jobs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Job Postings</CardTitle>
                      {currentUser?.permissions.jobs.edit && (
                        <Button onClick={handleCreateJob}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Job
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedJobIds.length > 0 && currentUser?.permissions.jobs.delete && (
                      <div className="mb-4 flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteSelectedJobs}
                          disabled={updating}
                        >
                          {updating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete Selected ({selectedJobIds.length})
                        </Button>
                      </div>
                    )}
                    {jobPostings.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        No job postings yet
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {currentUser?.permissions.jobs.delete && (
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedJobIds.length === jobPostings.length}
                                  onCheckedChange={toggleSelectAllJobs}
                                />
                              </TableHead>
                            )}
                            <TableHead>Title</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Vessel Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobPostings.map((job) => (
                            <TableRow key={job.id}>
                              {currentUser?.permissions.jobs.delete && (
                                <TableCell>
                                  <Checkbox
                                    checked={selectedJobIds.includes(job.id)}
                                    onCheckedChange={() => toggleJobSelection(job.id)}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.position}</TableCell>
                              <TableCell>{job.vessel_type}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {currentUser?.permissions.jobs.edit && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditJob(job)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {currentUser?.permissions.jobs.delete && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteJob(job.id)}
                                      disabled={updating}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {currentUser?.permissions.admins.view && (
              <TabsContent value="admins" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Admin Users</CardTitle>
                      {currentUser?.permissions.admins.edit && (
                        <Button onClick={handleCreateAdmin}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Admin
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {adminUsers.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        No admin users yet
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminUsers.map((admin) => (
                            <TableRow key={admin.id}>
                              <TableCell className="font-medium">{admin.username}</TableCell>
                              <TableCell>
                                {currentUser?.permissions.admins.edit && admin.is_approved ? (
                                  <Select
                                    value={admin.role}
                                    onValueChange={(value) => handleUpdateRole(admin.id, value as AdminUser['role'])}
                                    disabled={updating}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="viewer">Viewer</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  getRoleBadge(admin.role)
                                )}
                              </TableCell>
                              <TableCell>
                                {admin.is_approved ? (
                                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(admin.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {!admin.is_approved && currentUser?.permissions.admins.edit && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApproveAdmin(admin.id)}
                                        disabled={updating}
                                      >
                                        <Check className="w-4 h-4 text-green-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRejectAdmin(admin.id)}
                                        disabled={updating}
                                      >
                                        <X className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                  {admin.is_approved && (
                                    <>
                                      {currentUser?.permissions.admins.edit && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditPermissions(admin)}
                                        >
                                          <Settings className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleChangePassword(admin)}
                                      >
                                        <Key className="w-4 h-4" />
                                      </Button>
                                      {currentUser?.permissions.admins.edit && admin.id !== currentUser?.id && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteAdmin(admin.id)}
                                          disabled={updating}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {currentUser?.permissions.settings.view && (
              <TabsContent value="settings" className="space-y-6">
                <Tabs defaultValue="agencies">
                  <TabsList>
                    <TabsTrigger value="agencies">Agencies</TabsTrigger>
                    <TabsTrigger value="email">Email Recipients</TabsTrigger>
                    <TabsTrigger value="options">Form Options</TabsTrigger>
                  </TabsList>

                  <TabsContent value="agencies">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Agencies</CardTitle>
                          {currentUser?.permissions.settings.edit && (
                            <Button onClick={handleCreateAgency}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Agency
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {agencies.length === 0 ? (
                          <p className="text-center py-8 text-gray-500">
                            No agencies yet
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {agencies.map((agency) => (
                                <TableRow key={agency.id}>
                                  <TableCell className="font-medium">{agency.name}</TableCell>
                                  <TableCell>{agency.contact_person || 'N/A'}</TableCell>
                                  <TableCell>{agency.email || 'N/A'}</TableCell>
                                  <TableCell>{agency.phone || 'N/A'}</TableCell>
                                  <TableCell>
                                    <Switch
                                      checked={agency.is_active}
                                      onCheckedChange={(checked) => handleToggleAgencyActive(agency.id, checked)}
                                      disabled={!currentUser?.permissions.settings.edit}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      {currentUser?.permissions.settings.edit && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditAgency(agency)}
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteAgency(agency.id)}
                                            disabled={updating}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="email">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Email Recipients</CardTitle>
                          {currentUser?.permissions.settings.edit && (
                            <Button onClick={handleCreateEmailRecipient}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Recipient
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {emailRecipients.length === 0 ? (
                          <p className="text-center py-8 text-gray-500">
                            No email recipients yet
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nationality</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {emailRecipients.map((recipient) => (
                                <TableRow key={recipient.id}>
                                  <TableCell className="font-medium">{recipient.name}</TableCell>
                                  <TableCell>{recipient.email}</TableCell>
                                  <TableCell>{recipient.nationality || 'All'}</TableCell>
                                  <TableCell>
                                    <Switch
                                      checked={recipient.is_active}
                                      onCheckedChange={(checked) => handleToggleEmailRecipientActive(recipient.id, checked)}
                                      disabled={!currentUser?.permissions.settings.edit}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewEmailRecipient(recipient)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      {currentUser?.permissions.settings.edit && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEditEmailRecipient(recipient)}
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteEmailRecipient(recipient.id)}
                                            disabled={updating}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="options">
                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Positions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {currentUser?.permissions.settings.edit && (
                            <form onSubmit={handleAddPosition} className="flex gap-2 mb-4">
                              <Input
                                value={newPositionName}
                                onChange={(e) => setNewPositionName(e.target.value)}
                                placeholder="Add new position"
                              />
                              <Button type="submit" disabled={updating}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </form>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {positionOptions.map((pos) => (
                              <Badge key={pos.id} variant="outline" className="text-sm py-1 px-3">
                                {pos.name}
                                {currentUser?.permissions.settings.edit && (
                                  <button
                                    onClick={() => handleDeletePosition(pos.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Vessel Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {currentUser?.permissions.settings.edit && (
                            <form onSubmit={handleAddVesselType} className="flex gap-2 mb-4">
                              <Input
                                value={newVesselTypeName}
                                onChange={(e) => setNewVesselTypeName(e.target.value)}
                                placeholder="Add new vessel type"
                              />
                              <Button type="submit" disabled={updating}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </form>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {vesselTypeOptions.map((vt) => (
                              <Badge key={vt.id} variant="outline" className="text-sm py-1 px-3">
                                {vt.name}
                                {currentUser?.permissions.settings.edit && (
                                  <button
                                    onClick={() => handleDeleteVesselType(vt.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {currentUser?.permissions.settings.edit && (
                            <form onSubmit={handleAddLocation} className="flex gap-2 mb-4">
                              <Input
                                value={newLocationName}
                                onChange={(e) => setNewLocationName(e.target.value)}
                                placeholder="Add new location"
                              />
                              <Button type="submit" disabled={updating}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </form>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {locationOptions.map((loc) => (
                              <Badge key={loc.id} variant="outline" className="text-sm py-1 px-3">
                                {loc.name}
                                {currentUser?.permissions.settings.edit && (
                                  <button
                                    onClick={() => handleDeleteLocation(loc.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Salary Ranges</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {currentUser?.permissions.settings.edit && (
                            <form onSubmit={handleAddSalaryRange} className="flex gap-2 mb-4">
                              <Input
                                value={newSalaryRangeName}
                                onChange={(e) => setNewSalaryRangeName(e.target.value)}
                                placeholder="Add new salary range"
                              />
                              <Button type="submit" disabled={updating}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </form>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {salaryRangeOptions.map((sr) => (
                              <Badge key={sr.id} variant="outline" className="text-sm py-1 px-3">
                                {sr.name}
                                {currentUser?.permissions.settings.edit && (
                                  <button
                                    onClick={() => handleDeleteSalaryRange(sr.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Nationalities</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {currentUser?.permissions.settings.edit && (
                            <form onSubmit={handleAddNationality} className="flex gap-2 mb-4">
                              <Input
                                value={newNationalityName}
                                onChange={(e) => setNewNationalityName(e.target.value)}
                                placeholder="Add new nationality"
                              />
                              <Button type="submit" disabled={updating}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </form>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {nationalityOptions.map((nat) => (
                              <Badge key={nat.id} variant="outline" className="text-sm py-1 px-3">
                                {nat.name}
                                {currentUser?.permissions.settings.edit && (
                                  <button
                                    onClick={() => handleDeleteNationality(nat.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-3xl w-full my-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedApplication.full_name}</CardTitle>
                  <CardDescription>{selectedApplication.job_title}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedApplication(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedApplication.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Phone</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedApplication.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Date of Birth</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedApplication.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Nationality</Label>
                  <p>{selectedApplication.nationality}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Position</Label>
                  <p>{selectedApplication.position}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Vessel Type</Label>
                  <p className="flex items-center gap-2">
                    <Ship className="w-4 h-4" />
                    {selectedApplication.vessel_type}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Experience</Label>
                  <p>{selectedApplication.years_of_experience} years</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Expected Salary</Label>
                  <p className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(selectedApplication.expected_salary)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Agency</Label>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {selectedApplication.agency || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Submitted</Label>
                  <p>{new Date(selectedApplication.submitted_date).toLocaleString()}</p>
                </div>
              </div>

              {selectedApplication.cover_letter && (
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Cover Letter</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                  </div>
                </div>
              )}

              {selectedApplication.resume_url && (
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Resume</Label>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadResume(selectedApplication)}
                    disabled={downloadingResume}
                  >
                    {downloadingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                      </>
                    )}
                  </Button>
                </div>
              )}

              {currentUser?.permissions.applications.edit && (
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Update Status</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedApplication.status === 'pending' ? 'default' : 'outline'}
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'pending')}
                      disabled={updating}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedApplication.status === 'reviewed' ? 'default' : 'outline'}
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewed')}
                      disabled={updating}
                    >
                      Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedApplication.status === 'shortlisted' ? 'default' : 'outline'}
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                      disabled={updating}
                    >
                      Shortlisted
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedApplication.status === 'rejected' ? 'default' : 'outline'}
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      disabled={updating}
                    >
                      Rejected
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Recipient Detail Modal */}
      {showEmailRecipientDetail && selectedEmailRecipient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Email Recipient Details</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailRecipientDetail(false);
                    setSelectedEmailRecipient(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Name</Label>
                <p className="font-medium">{selectedEmailRecipient.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {selectedEmailRecipient.email}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Nationality Filter</Label>
                <p>{selectedEmailRecipient.nationality || 'All nationalities'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <p>
                  {selectedEmailRecipient.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Created</Label>
                <p>{new Date(selectedEmailRecipient.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {selectedJob ? 'Edit Job Posting' : 'Create Job Posting'}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={resetJobForm}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveJob} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={jobFormData.title}
                    onChange={(e) => handleJobFormChange('title', e.target.value)}
                    placeholder="e.g., Chief Engineer"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_position">Position *</Label>
                    <Select
                      value={jobFormData.position}
                      onValueChange={(value) => handleJobFormChange('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.name}>
                            {pos.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_vessel_type">Vessel Type *</Label>
                    <Select
                      value={jobFormData.vessel_type}
                      onValueChange={(value) => handleJobFormChange('vessel_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vessel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselTypeOptions.map((vt) => (
                          <SelectItem key={vt.id} value={vt.name}>
                            {vt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_location">Location</Label>
                    <Select
                      value={jobFormData.location}
                      onValueChange={(value) => handleJobFormChange('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc.id} value={loc.name}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_salary_range">Salary Range</Label>
                    <Select
                      value={jobFormData.salary_range}
                      onValueChange={(value) => handleJobFormChange('salary_range', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryRangeOptions.map((sr) => (
                          <SelectItem key={sr.id} value={sr.name}>
                            {sr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="job_requirements"
                    value={jobFormData.requirements}
                    onChange={(e) => handleJobFormChange('requirements', e.target.value)}
                    placeholder="Enter requirements, one per line"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_responsibilities">Responsibilities (one per line)</Label>
                  <Textarea
                    id="job_responsibilities"
                    value={jobFormData.responsibilities}
                    onChange={(e) => handleJobFormChange('responsibilities', e.target.value)}
                    placeholder="Enter responsibilities, one per line"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_status">Status</Label>
                  <Select
                    value={jobFormData.status}
                    onValueChange={(value) => handleJobFormChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetJobForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Job'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Change Password</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowPasswordForm(false)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Changing password for: {selectedAdmin.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password *</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_new_password">Confirm Password *</Label>
                  <Input
                    id="confirm_new_password"
                    type="password"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permissions Edit Modal */}
      {showPermissionsForm && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-2xl w-full my-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Edit Permissions</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowPermissionsForm(false)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Managing permissions for: {selectedAdmin.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Applications Permissions */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Applications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app_view">View Applications</Label>
                      <Switch
                        id="app_view"
                        checked={selectedAdmin.permissions.applications.view}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'applications', 'view', checked)}
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app_edit">Edit Applications</Label>
                      <Switch
                        id="app_edit"
                        checked={selectedAdmin.permissions.applications.edit}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'applications', 'edit', checked)}
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app_delete">Delete Applications</Label>
                      <Switch
                        id="app_delete"
                        checked={selectedAdmin.permissions.applications.delete}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'applications', 'delete', checked)}
                        disabled={updating}
                      />
                    </div>
                  </div>
                </div>

                {/* Jobs Permissions */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Job Postings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="jobs_view">View Jobs</Label>
                      <Switch
                        id="jobs_view"
                        checked={selectedAdmin.permissions.jobs.view}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'jobs', 'view', checked)}
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="jobs_edit">Edit Jobs</Label>
                      <Switch
                        id="jobs_edit"
                        checked={selectedAdmin.permissions.jobs.edit}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'jobs', 'edit', checked)}
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="jobs_delete">Delete Jobs</Label>
                      <Switch
                        id="jobs_delete"
                        checked={selectedAdmin.permissions.jobs.delete}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'jobs', 'delete', checked)}
                        disabled={updating}
                      />
                    </div>
                  </div>
                </div>

                {/* Admins Permissions */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Admin Users</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admins_view">View Admins</Label>
                      <Switch
                        id="admins_view"
                        checked={selectedAdmin.permissions.admins.view}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'admins', 'view', checked)}
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admins_edit">Edit Admins</Label>
                      <Switch
                        id="admins_edit"
                        checked={selectedAdmin.permissions.admins.edit}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'admins', 'edit', checked)}
                        disabled={updating}
                      />
                    </div>
                  </div>
                </div>

                {/* Settings Permissions */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="settings_view">View Settings</Label>
                      <Switch
                        id="settings_view"
                        checked={selectedAdmin.permissions.settings.view}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'settings', 'view', checked)}
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="settings_edit">Edit Settings</Label>
                      <Switch
                        id="settings_edit"
                        checked={selectedAdmin.permissions.settings.edit}
                        onCheckedChange={(checked) => handleUpdatePermissions(selectedAdmin.id, 'settings', 'edit', checked)}
                        disabled={updating}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowPermissionsForm(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agency Form Modal */}
      {showAgencyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {selectedAgency ? 'Edit Agency' : 'Add Agency'}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowAgencyForm(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAgency} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agency_name">Agency Name *</Label>
                  <Input
                    id="agency_name"
                    value={agencyFormData.name}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, name: e.target.value })}
                    placeholder="Enter agency name"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_contact">Contact Person</Label>
                  <Input
                    id="agency_contact"
                    value={agencyFormData.contact_person}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, contact_person: e.target.value })}
                    placeholder="Enter contact person name"
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_email">Email</Label>
                  <Input
                    id="agency_email"
                    type="email"
                    value={agencyFormData.email}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, email: e.target.value })}
                    placeholder="Enter email"
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_phone">Phone</Label>
                  <Input
                    id="agency_phone"
                    value={agencyFormData.phone}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_address">Address</Label>
                  <Textarea
                    id="agency_address"
                    value={agencyFormData.address}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, address: e.target.value })}
                    placeholder="Enter address"
                    rows={3}
                    disabled={updating}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="agency_active"
                    checked={agencyFormData.is_active}
                    onCheckedChange={(checked) => setAgencyFormData({ ...agencyFormData, is_active: checked })}
                    disabled={updating}
                  />
                  <Label htmlFor="agency_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAgencyForm(false)}
                    className="flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Agency'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Recipient Form Modal */}
      {showEmailRecipientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {selectedEmailRecipient ? 'Edit Email Recipient' : 'Add Email Recipient'}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailRecipientForm(false);
                    setSelectedEmailRecipient(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEmailRecipient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Name *</Label>
                  <Input
                    id="recipient_name"
                    value={emailRecipientFormData.name}
                    onChange={(e) => setEmailRecipientFormData({ ...emailRecipientFormData, name: e.target.value })}
                    placeholder="Enter recipient name"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_email">Email *</Label>
                  <Input
                    id="recipient_email"
                    type="email"
                    value={emailRecipientFormData.email}
                    onChange={(e) => setEmailRecipientFormData({ ...emailRecipientFormData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_nationality">Nationality Filter (optional)</Label>
                  <Select
                    value={emailRecipientFormData.nationality}
                    onValueChange={(value) => setEmailRecipientFormData({ ...emailRecipientFormData, nationality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All nationalities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All nationalities</SelectItem>
                      {nationalityOptions.map((nat) => (
                        <SelectItem key={nat.id} value={nat.name}>
                          {nat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Leave empty to receive all applications, or select a nationality to only receive applications from that nationality
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recipient_active"
                    checked={emailRecipientFormData.is_active}
                    onCheckedChange={(checked) => setEmailRecipientFormData({ ...emailRecipientFormData, is_active: checked })}
                    disabled={updating}
                  />
                  <Label htmlFor="recipient_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEmailRecipientForm(false);
                      setSelectedEmailRecipient(null);
                    }}
                    className="flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Recipient'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Form Modal (for creating new admin when logged in) */}
      {showAdminForm && isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Create Admin User</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowAdminForm(false)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Create a new admin user (requires approval)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_username">Username *</Label>
                  <Input
                    id="admin_username"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_password">Password *</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_confirm_password">Confirm Password *</Label>
                  <Input
                    id="admin_confirm_password"
                    type="password"
                    value={adminFormData.confirmPassword}
                    onChange={(e) => setAdminFormData({ ...adminFormData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_role">Role</Label>
                  <Select
                    value={adminFormData.role}
                    onValueChange={(value) => setAdminFormData({ ...adminFormData, role: value as AdminUser['role'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdminForm(false)}
                    className="flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Admin'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}