import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { jobPostingsAPI } from '@/lib/supabase';
import type { JobPosting, AdminUser, PositionOption, VesselTypeOption, LocationOption, SalaryRangeOption } from '../types';

interface JobPostingsTabProps {
  jobPostings: JobPosting[];
  setJobPostings: React.Dispatch<React.SetStateAction<JobPosting[]>>;
  positionOptions: PositionOption[];
  vesselTypeOptions: VesselTypeOption[];
  locationOptions: LocationOption[];
  salaryRangeOptions: SalaryRangeOption[];
  currentUser: AdminUser | null;
}

export function JobPostingsTab({
  jobPostings,
  setJobPostings,
  positionOptions,
  vesselTypeOptions,
  locationOptions,
  salaryRangeOptions,
  currentUser
}: JobPostingsTabProps) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
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

  const getJobStatusBadge = (status: JobPosting['status']) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">CLOSED</Badge>
    );
  };

  return (
    <>
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
    </>
  );
}