import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserPlus, Check, X, Key, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { adminUsersAPI } from '@/lib/supabase';
import type { AdminUser } from '../types';

interface AdminUsersTabProps {
  adminUsers: Omit<AdminUser, 'password_hash'>[];
  setAdminUsers: React.Dispatch<React.SetStateAction<Omit<AdminUser, 'password_hash'>[]>>;
  currentUser: AdminUser | null;
}

export function AdminUsersTab({ adminUsers, setAdminUsers, currentUser }: AdminUsersTabProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<Omit<AdminUser, 'password_hash'> | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [updating, setUpdating] = useState(false);
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

  const getRoleBadge = (role: AdminUser['role']) => {
    const variants = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[role]}>{role.replace('_', ' ').toUpperCase()}</Badge>;
  };

  return (
    <>
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

      {/* Admin Form Modal */}
      {showAdminForm && (
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
    </>
  );
}