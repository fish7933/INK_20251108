import { useState, useEffect, useMemo } from 'react';
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
import { Lock, Eye, Mail, Phone, Calendar, FileText, Ship, Loader2, Plus, Edit, Trash2, UserPlus, Check, X, Key, CheckCircle2, XCircle, Info, Download, DollarSign, Paperclip, Building2, Settings, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
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

type SortDirection = 'asc' | 'desc' | null;
type ApplicationSortField = 'full_name' | 'selected_position' | 'submitted_date' | 'status';
type JobSortField = 'title' | 'status' | 'created_at';

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
  
  // Sorting states
  const [applicationSortField, setApplicationSortField] = useState<ApplicationSortField | null>(null);
  const [applicationSortDirection, setApplicationSortDirection] = useState<SortDirection>(null);
  const [jobSortField, setJobSortField] = useState<JobSortField | null>(null);
  const [jobSortDirection, setJobSortDirection] = useState<SortDirection>(null);

  // Pagination states
  const [applicationPage, setApplicationPage] = useState(1);
  const [applicationPageSize, setApplicationPageSize] = useState(10);
  const [jobPage, setJobPage] = useState(1);
  const [jobPageSize, setJobPageSize] = useState(10);

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
    nationality: 'all',
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
    positions: [] as string[],
    vessel_type: '',
    location: '',
    salary_range: '',
    requirements: '',
    responsibilities: '',
    status: 'active' as 'active' | 'closed'
  });

  // Sorting functions
  const handleApplicationSort = (field: ApplicationSortField) => {
    if (applicationSortField === field) {
      // Toggle direction: asc -> desc -> null
      if (applicationSortDirection === 'asc') {
        setApplicationSortDirection('desc');
      } else if (applicationSortDirection === 'desc') {
        setApplicationSortDirection(null);
        setApplicationSortField(null);
      }
    } else {
      setApplicationSortField(field);
      setApplicationSortDirection('asc');
    }
    setApplicationPage(1); // Reset to first page when sorting changes
  };

  const handleJobSort = (field: JobSortField) => {
    if (jobSortField === field) {
      // Toggle direction: asc -> desc -> null
      if (jobSortDirection === 'asc') {
        setJobSortDirection('desc');
      } else if (jobSortDirection === 'desc') {
        setJobSortDirection(null);
        setJobSortField(null);
      }
    } else {
      setJobSortField(field);
      setJobSortDirection('asc');
    }
    setJobPage(1); // Reset to first page when sorting changes
  };

  const getSortIcon = (field: string, currentField: string | null, direction: SortDirection) => {
    if (field !== currentField || !direction) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    }
    return direction === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1 inline" /> : 
      <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  // Sorted applications
  const sortedApplications = useMemo(() => {
    if (!applicationSortField || !applicationSortDirection) {
      return applications;
    }

    return [...applications].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (applicationSortField) {
        case 'full_name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'selected_position':
          aValue = a.selected_position?.toLowerCase() || '';
          bValue = b.selected_position?.toLowerCase() || '';
          break;
        case 'submitted_date':
          aValue = new Date(a.submitted_date).getTime();
          bValue = new Date(b.submitted_date).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return applicationSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return applicationSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, applicationSortField, applicationSortDirection]);

  // Sorted job postings
  const sortedJobPostings = useMemo(() => {
    if (!jobSortField || !jobSortDirection) {
      return jobPostings;
    }

    return [...jobPostings].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (jobSortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return jobSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return jobSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [jobPostings, jobSortField, jobSortDirection]);

  // Pagination component
  const Pagination = ({ 
    currentPage, 
    totalItems, 
    pageSize, 
    onPageChange, 
    onPageSizeChange 
  }: { 
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        
        if (currentPage > 3) {
          pages.push('...');
        }
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (currentPage < totalPages - 2) {
          pages.push('...');
        }
        
        pages.push(totalPages);
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {totalItems} entries
          </span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

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
    
    // Use sorted applications
    const displayList = applicationSortField && applicationSortDirection 
      ? sortedApplications.filter(app => appList.some(a => a.id === app.id))
      : appList;
    
    // Apply pagination
    const startIndex = (applicationPage - 1) * applicationPageSize;
    const endIndex = startIndex + applicationPageSize;
    const paginatedList = displayList.slice(startIndex, endIndex);
    
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
          <>
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
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleApplicationSort('full_name')}
                  >
                    Name
                    {getSortIcon('full_name', applicationSortField, applicationSortDirection)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleApplicationSort('selected_position')}
                  >
                    Position
                    {getSortIcon('selected_position', applicationSortField, applicationSortDirection)}
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleApplicationSort('submitted_date')}
                  >
                    Submitted
                    {getSortIcon('submitted_date', applicationSortField, applicationSortDirection)}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer select-none hover:bg-gray-50"
                    onClick={() => handleApplicationSort('status')}
                  >
                    Status
                    {getSortIcon('status', applicationSortField, applicationSortDirection)}
                  </TableHead>
                  <TableHead>Email Notification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.map((app) => (
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
                    <TableCell>{app.selected_position}</TableCell>
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
            
            <Pagination
              currentPage={applicationPage}
              totalItems={displayList.length}
              pageSize={applicationPageSize}
              onPageChange={setApplicationPage}
              onPageSizeChange={(size) => {
                setApplicationPageSize(size);
                setApplicationPage(1);
              }}
            />
          </>
        )}
      </>
    );
  };

  const renderApplicationsByJob = () => {
    // Group applications by job title
    const applicationsByJob = sortedApplications.reduce((acc, app) => {
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
            </CardContent>
          </Card>
        </div>
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
                        <CardDescription>
                          Click column headers to sort
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationTable(sortedApplications)}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="by-job">
                    <Card>
                      <CardHeader>
                        <CardTitle>Applications by Job Posting</CardTitle>
                        <CardDescription>
                          Click on a job posting to expand and view its applications. Click column headers to sort.
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
                        <CardDescription>
                          Click column headers to sort
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationTable(sortedApplications.filter(a => a.status === 'pending'))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="shortlisted">
                    <Card>
                      <CardHeader>
                        <CardTitle>Shortlisted Candidates</CardTitle>
                        <CardDescription>
                          Click column headers to sort
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderApplicationTable(sortedApplications.filter(a => a.status === 'shortlisted'))}
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
                      <div>
                        <CardTitle>Job Postings</CardTitle>
                        <CardDescription>
                          Click column headers to sort
                        </CardDescription>
                      </div>
                      {currentUser?.permissions.jobs.edit && (
                        <Button onClick={() => {}}>
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
                      <>
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
                              <TableHead 
                                className="cursor-pointer select-none hover:bg-gray-50"
                                onClick={() => handleJobSort('title')}
                              >
                                Title
                                {getSortIcon('title', jobSortField, jobSortDirection)}
                              </TableHead>
                              <TableHead>Positions</TableHead>
                              <TableHead>Vessel Type</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead 
                                className="cursor-pointer select-none hover:bg-gray-50"
                                onClick={() => handleJobSort('status')}
                              >
                                Status
                                {getSortIcon('status', jobSortField, jobSortDirection)}
                              </TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedJobPostings
                              .slice((jobPage - 1) * jobPageSize, jobPage * jobPageSize)
                              .map((job) => (
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
                                <TableCell>{job.positions?.join(", ") || "N/A"}</TableCell>
                                <TableCell>{job.vessel_type}</TableCell>
                                <TableCell>{job.location}</TableCell>
                                <TableCell>{getJobStatusBadge(job.status)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    {currentUser?.permissions.jobs.edit && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {}}
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
                        
                        <Pagination
                          currentPage={jobPage}
                          totalItems={sortedJobPostings.length}
                          pageSize={jobPageSize}
                          onPageChange={setJobPage}
                          onPageSizeChange={(size) => {
                            setJobPageSize(size);
                            setJobPage(1);
                          }}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}