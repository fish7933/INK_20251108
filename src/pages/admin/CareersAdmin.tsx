import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth, adminUsersAPI } from '@/lib/supabase';
import { useAdminData } from './hooks/useAdminData';
import { ApplicationsTab } from './components/ApplicationsTab';
import { JobPostingsTab } from './components/JobPostingsTab';
import { AdminUsersTab } from './components/AdminUsersTab';
import { SettingsTab } from './components/SettingsTab';
import type { AdminUser } from './types';

export default function CareersAdmin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [updating, setUpdating] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' as AdminUser['role']
  });

  const {
    loading,
    applications,
    setApplications,
    jobPostings,
    setJobPostings,
    adminUsers,
    setAdminUsers,
    emailRecipients,
    setEmailRecipients,
    agencies,
    setAgencies,
    positionOptions,
    setPositionOptions,
    vesselTypeOptions,
    setVesselTypeOptions,
    locationOptions,
    setLocationOptions,
    salaryRangeOptions,
    setSalaryRangeOptions,
    nationalityOptions,
    setNationalityOptions,
    loadData
  } = useAdminData();

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
      } else {
        console.log('[CareersAdmin] Not authenticated');
      }
    };

    checkAuth();
  }, []);

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

  const handleRequestAdminAccess = () => {
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

  const getRoleBadge = (role: AdminUser['role']) => {
    const variants = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[role]}`}>{role.replace('_', ' ').toUpperCase()}</span>;
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
                <ApplicationsTab
                  applications={applications}
                  setApplications={setApplications}
                  agencies={agencies}
                  currentUser={currentUser}
                />
              </TabsContent>
            )}

            {currentUser?.permissions.jobs.view && (
              <TabsContent value="jobs" className="space-y-6">
                <JobPostingsTab
                  jobPostings={jobPostings}
                  setJobPostings={setJobPostings}
                  positionOptions={positionOptions}
                  vesselTypeOptions={vesselTypeOptions}
                  locationOptions={locationOptions}
                  salaryRangeOptions={salaryRangeOptions}
                  currentUser={currentUser}
                />
              </TabsContent>
            )}

            {currentUser?.permissions.admins.view && (
              <TabsContent value="admins" className="space-y-6">
                <AdminUsersTab
                  adminUsers={adminUsers}
                  setAdminUsers={setAdminUsers}
                  currentUser={currentUser}
                />
              </TabsContent>
            )}

            {currentUser?.permissions.settings.view && (
              <TabsContent value="settings" className="space-y-6">
                <SettingsTab
                  emailRecipients={emailRecipients}
                  setEmailRecipients={setEmailRecipients}
                  agencies={agencies}
                  setAgencies={setAgencies}
                  positionOptions={positionOptions}
                  setPositionOptions={setPositionOptions}
                  vesselTypeOptions={vesselTypeOptions}
                  setVesselTypeOptions={setVesselTypeOptions}
                  locationOptions={locationOptions}
                  setLocationOptions={setLocationOptions}
                  salaryRangeOptions={salaryRangeOptions}
                  setSalaryRangeOptions={setSalaryRangeOptions}
                  nationalityOptions={nationalityOptions}
                  setNationalityOptions={setNationalityOptions}
                  currentUser={currentUser}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}