import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Eye, Mail, Phone, Calendar, DollarSign, Building2, Loader2, Trash2, Download, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsAPI, storageAPI } from '@/lib/supabase';
import type { Application, AdminUser, Agency } from '../types';

interface ApplicationsTabProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  agencies: Agency[];
  currentUser: AdminUser | null;
}

export function ApplicationsTab({ applications, setApplications, agencies, currentUser }: ApplicationsTabProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [openJobGroups, setOpenJobGroups] = useState<string[]>([]);

  const formatSalary = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString('en-US')}`;
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

  const toggleJobGroup = (jobTitle: string) => {
    setOpenJobGroups(prev =>
      prev.includes(jobTitle) ? prev.filter(t => t !== jobTitle) : [...prev, jobTitle]
    );
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

  const getStatusBadge = (status: Application['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
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

  return (
    <>
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
                    {selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Nationality</Label>
                  <p>{selectedApplication.nationality}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Experience</Label>
                  <p>{selectedApplication.experience_years} years</p>
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
                    {selectedApplication.agency_id ? agencies.find(a => a.id === selectedApplication.agency_id)?.name || 'N/A' : 'Direct Application'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Submitted</Label>
                  <p>{new Date(selectedApplication.submitted_date).toLocaleString()}</p>
                </div>
              </div>

              {selectedApplication.certificates && (
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Certificates</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.certificates}</p>
                  </div>
                </div>
              )}

              {selectedApplication.previous_vessels && (
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Previous Vessels</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.previous_vessels}</p>
                  </div>
                </div>
              )}

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
    </>
  );
}