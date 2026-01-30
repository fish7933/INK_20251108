import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Eye, FileText, Mail, Ship, Briefcase, Calendar, User, Award } from 'lucide-react';
import { applicationsAPI, vesselsAPI, positionsAPI, type Vessel, type Position, type ApplicationWithRelations } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ApplicationsTab() {
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithRelations | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterVesselId, setFilterVesselId] = useState<string>('all');
  const [filterPositionId, setFilterPositionId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicationsData, vesselsData, positionsData] = await Promise.all([
        applicationsAPI.getAll(),
        vesselsAPI.getAll(),
        positionsAPI.getAll(),
      ]);
      setApplications(applicationsData);
      setVessels(vesselsData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application: ApplicationWithRelations) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await applicationsAPI.update(id, { status: status as 'pending' | 'reviewing' | 'accepted' | 'rejected' });
      toast.success('Status updated successfully');
      loadData();
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: status as 'pending' | 'reviewing' | 'accepted' | 'rejected' });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterVesselId !== 'all' && app.vessel_id !== filterVesselId) return false;
    if (filterPositionId !== 'all' && app.position_id !== filterPositionId) return false;
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    return true;
  });

  const availablePositions = filterVesselId === 'all'
    ? positions
    : positions.filter((p) => p.vessel_id === filterVesselId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Applications</h2>
        <p className="text-muted-foreground">Review and manage job applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Filter by Vessel</Label>
          <Select value={filterVesselId} onValueChange={(value) => {
            setFilterVesselId(value);
            setFilterPositionId('all');
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vessels</SelectItem>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>
                  {vessel.vessel_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Filter by Position</Label>
          <Select value={filterPositionId} onValueChange={setFilterPositionId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {availablePositions.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.position_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Filter by Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground">Applications will appear here when candidates apply</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow
                    key={application.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(application)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.full_name}</div>
                        <div className="text-sm text-muted-foreground">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-muted-foreground" />
                        {application.vessel?.vessel_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {application.position?.position_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(application.submitted_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {application.email_sent ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Mail className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Not Sent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(application);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review applicant information and update status</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      Vessel Information
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium">{selectedApplication.vessel?.vessel_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedApplication.vessel?.vessel_type}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Position Applied
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium">{selectedApplication.position?.position_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedApplication.position?.rank}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Application Status
                    </h3>
                    <Select
                      value={selectedApplication.status}
                      onValueChange={(value) => handleUpdateStatus(selectedApplication.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted: {new Date(selectedApplication.submitted_date).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Status
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      {selectedApplication.email_sent ? (
                        <>
                          <Badge variant="outline" className="bg-green-50 text-green-700 mb-2">
                            Email Sent
                          </Badge>
                          {selectedApplication.email_sent_at && (
                            <p className="text-xs text-muted-foreground">
                              Sent at: {new Date(selectedApplication.email_sent_at).toLocaleString()}
                            </p>
                          )}
                          {selectedApplication.resume_attached && (
                            <p className="text-xs text-muted-foreground">Resume attached</p>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Email Not Sent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium">{selectedApplication.nationality || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {selectedApplication.date_of_birth
                        ? new Date(selectedApplication.date_of_birth).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {selectedApplication.experience_years
                        ? `${selectedApplication.experience_years} years`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Professional Details
                </h3>
                <div className="space-y-3">
                  {selectedApplication.certificates && (
                    <div>
                      <p className="text-sm text-muted-foreground">Certificates</p>
                      <p className="font-medium whitespace-pre-wrap">{selectedApplication.certificates}</p>
                    </div>
                  )}
                  {selectedApplication.previous_vessels && (
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Vessels</p>
                      <p className="font-medium whitespace-pre-wrap">{selectedApplication.previous_vessels}</p>
                    </div>
                  )}
                  {selectedApplication.expected_salary && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Salary</p>
                      <p className="font-medium">
                        ${selectedApplication.expected_salary.toLocaleString()} {selectedApplication.salary_currency}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedApplication.cover_letter && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Cover Letter</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                  </div>
                </div>
              )}

              {selectedApplication.resume_url && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Resume</h3>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedApplication.resume_url, '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Resume ({selectedApplication.resume_filename})
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}