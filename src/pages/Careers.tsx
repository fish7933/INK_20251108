import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Ship, MapPin, Calendar, DollarSign, Briefcase, Filter, X, AlertCircle } from 'lucide-react';
import { supabase, applicationsAPI, uploadResume, type Vessel, type Position } from '@/lib/supabase';
import { toast } from 'sonner';

interface PositionWithVessel extends Position {
  vessel?: Vessel;
}

export default function Careers() {
  const [positions, setPositions] = useState<PositionWithVessel[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<PositionWithVessel[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<PositionWithVessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    position: '',
    vesselType: '',
    location: '',
    salaryMin: '',
  });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    nationality: '',
    date_of_birth: '',
    experience_years: '',
    certificates: '',
    previous_vessels: '',
    expected_salary: '',
    salary_currency: 'USD',
    cover_letter: '',
    resume: null as File | null,
  });

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, positions]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: queryError } = await supabase
        .from('app_7c39e793e3_positions')
        .select('*, vessel:app_7c39e793e3_vessels(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (queryError) {
        throw queryError;
      }
      
      if (!data) {
        setPositions([]);
        setFilteredPositions([]);
        return;
      }
      
      // Filter only positions with active vessels
      const activePositions = data.filter((p: PositionWithVessel) => p.vessel?.is_active === true);
      
      setPositions(activePositions);
      setFilteredPositions(activePositions);
    } catch (err) {
      console.error('Failed to load positions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job positions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...positions];

    if (filters.position) {
      filtered = filtered.filter((p) =>
        p.position_name.toLowerCase().includes(filters.position.toLowerCase()) ||
        p.rank.toLowerCase().includes(filters.position.toLowerCase())
      );
    }

    if (filters.vesselType) {
      filtered = filtered.filter((p) =>
        p.vessel?.vessel_type.toLowerCase().includes(filters.vesselType.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter((p) =>
        p.vessel?.route?.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.vessel?.flag?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.salaryMin) {
      const minSalary = parseInt(filters.salaryMin);
      filtered = filtered.filter((p) => {
        if (!p.salary_min && !p.salary_max) return true;
        return (p.salary_min && p.salary_min >= minSalary) || (p.salary_max && p.salary_max >= minSalary);
      });
    }

    setFilteredPositions(filtered);
  };

  const clearFilters = () => {
    setFilters({
      position: '',
      vesselType: '',
      location: '',
      salaryMin: '',
    });
  };

  const handleApplyClick = (position: PositionWithVessel) => {
    setSelectedPosition(position);
    setIsApplicationModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPosition || !selectedPosition.vessel) {
      toast.error('Position information is missing');
      return;
    }

    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      let resumeUrl = '';
      let resumeFilename = '';

      if (formData.resume) {
        const tempId = crypto.randomUUID();
        const uploadResult = await uploadResume(formData.resume, tempId);
        resumeUrl = uploadResult.url;
        resumeFilename = uploadResult.filename;
      }

      const applicationData = {
        vessel_id: selectedPosition.vessel_id,
        position_id: selectedPosition.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
        certificates: formData.certificates || undefined,
        previous_vessels: formData.previous_vessels || undefined,
        expected_salary: formData.expected_salary ? parseInt(formData.expected_salary) : undefined,
        salary_currency: formData.salary_currency,
        cover_letter: formData.cover_letter || undefined,
        resume_url: resumeUrl || undefined,
        resume_filename: resumeFilename || undefined,
      };

      await applicationsAPI.create(applicationData);

      toast.success('Application submitted successfully! Check your email for confirmation.');

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        nationality: '',
        date_of_birth: '',
        experience_years: '',
        certificates: '',
        previous_vessels: '',
        expected_salary: '',
        salary_currency: 'USD',
        cover_letter: '',
        resume: null,
      });

      setIsApplicationModalOpen(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="max-w-2xl w-full shadow-lg border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Job Postings</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadPositions} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center">Maritime Job Vacancies</h1>
          <p className="text-xl text-center text-white/90">Find your next career opportunity at sea</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredPositions.length} {filteredPositions.length === 1 ? 'Position' : 'Positions'} Available
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <Card className="p-6 mb-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filter-position" className="text-sm font-medium mb-2 block">
                    Position / Rank
                  </Label>
                  <Input
                    id="filter-position"
                    placeholder="e.g. Chief Engineer"
                    value={filters.position}
                    onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-vessel" className="text-sm font-medium mb-2 block">
                    Vessel Type
                  </Label>
                  <Input
                    id="filter-vessel"
                    placeholder="e.g. Bulk Carrier"
                    value={filters.vesselType}
                    onChange={(e) => setFilters({ ...filters, vesselType: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-location" className="text-sm font-medium mb-2 block">
                    Location / Route
                  </Label>
                  <Input
                    id="filter-location"
                    placeholder="e.g. Worldwide"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-salary" className="text-sm font-medium mb-2 block">
                    Min. Salary (USD)
                  </Label>
                  <Input
                    id="filter-salary"
                    type="number"
                    placeholder="e.g. 5000"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Positions Grid */}
        {filteredPositions.length === 0 ? (
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No positions found</h3>
              <p className="text-gray-600 text-center">
                {filters.position || filters.vesselType || filters.location || filters.salaryMin
                  ? 'Try adjusting your filters'
                  : 'Check back soon for new opportunities'}
              </p>
              {positions.length > 0 && (
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPositions.map((position) => (
              <Card
                key={position.id}
                className="hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200"
              >
                <CardContent className="p-6">
                  {/* Vessel Name - 최상단에 크고 눈에 띄게 배치 */}
                  {position.vessel?.vessel_name && (
                    <div className="mb-4 pb-4 border-b-2 border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Ship className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Vessel</span>
                      </div>
                      <h2 className="text-2xl font-bold text-blue-700 leading-tight">
                        {position.vessel.vessel_name}
                      </h2>
                    </div>
                  )}

                  {/* Position Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{position.position_name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {position.vessel?.vessel_type || 'Vessel'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(position.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="space-y-3 mb-6">
                    {(position.salary_min || position.salary_max) && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">
                          {position.salary_min && position.salary_max
                            ? `$${position.salary_min.toLocaleString()} - $${position.salary_max.toLocaleString()}`
                            : position.salary_min
                            ? `$${position.salary_min.toLocaleString()}+`
                            : `Up to $${position.salary_max?.toLocaleString()}`}
                        </span>
                      </div>
                    )}

                    {position.vessel?.route && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="text-gray-700">{position.vessel.route}</span>
                      </div>
                    )}

                    {position.contract_duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="text-gray-700">{position.contract_duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <Button
                    onClick={() => handleApplyClick(position)}
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-semibold py-6 text-base"
                  >
                    Apply now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Apply for {selectedPosition?.position_name}</DialogTitle>
            <DialogDescription className="text-base">
              {selectedPosition?.vessel?.vessel_name} - {selectedPosition?.vessel?.vessel_type}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Full Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="certificates">Certificates & Licenses</Label>
                  <Textarea
                    id="certificates"
                    value={formData.certificates}
                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                    placeholder="List your relevant certificates and licenses..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previous_vessels">Previous Vessels</Label>
                  <Textarea
                    id="previous_vessels"
                    value={formData.previous_vessels}
                    onChange={(e) => setFormData({ ...formData, previous_vessels: e.target.value })}
                    placeholder="List your previous vessels and positions..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected_salary">Expected Salary (Monthly)</Label>
                    <Input
                      id="expected_salary"
                      type="number"
                      value={formData.expected_salary}
                      onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_currency">Currency</Label>
                    <select
                      id="salary_currency"
                      value={formData.salary_currency}
                      onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="cover_letter">Cover Letter</Label>
                  <Textarea
                    id="cover_letter"
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    placeholder="Tell us why you're interested in this position..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume / CV</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApplicationModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}