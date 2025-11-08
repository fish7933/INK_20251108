import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Upload, CheckCircle, Loader2, Eye, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { jobPostingsAPI, applicationsAPI, nationalityOptionsAPI, agenciesAPI, positionOptionsAPI, JobPosting, NationalityOption, Agency, PositionOption } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function CareersApply() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [nationalityOptions, setNationalityOptions] = useState<NationalityOption[]>([]);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [experienceYears, setExperienceYears] = useState([0]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    nationality: '',
    desired_position: '',
    date_of_birth: '',
    certificates: '',
    previous_vessels: '',
    cover_letter: '',
    resume_filename: '',
    expected_salary: '',
    agency_id: ''
  });

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobData, nationalitiesData, positionsData, agenciesData] = await Promise.all([
        jobId ? jobPostingsAPI.getById(jobId) : null,
        nationalityOptionsAPI.getAll(),
        positionOptionsAPI.getAll(),
        agenciesAPI.getActive()
      ]);
      
      if (jobData) {
        setJob(jobData);
      }
      setNationalityOptions(nationalitiesData);
      setPositionOptions(positionsData);
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Job not found');
      navigate('/careers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNationalityChange = (value: string) => {
    setFormData({
      ...formData,
      nationality: value
    });
  };

  const handlePositionChange = (value: string) => {
    setFormData({
      ...formData,
      desired_position: value
    });
  };

  const handleAgencyChange = (value: string) => {
    setFormData({
      ...formData,
      agency_id: value
    });
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return false;
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        setResumeFile(file);
        setFormData({
          ...formData,
          resume_filename: file.name
        });
      } else {
        // Reset the input
        e.target.value = '';
        setResumeFile(null);
        setFormData({
          ...formData,
          resume_filename: ''
        });
      }
    }
  };

  const formatSalary = (value: string) => {
    const num = parseInt(value.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({
        ...formData,
        expected_salary: value
      });
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.nationality || !formData.desired_position || !formData.date_of_birth || !formData.expected_salary) {
      toast.error('Please fill in all required fields');
      return;
    }

    setShowReview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = () => {
    setShowReview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      await applicationsAPI.create({
        job_id: jobId!,
        job_title: `${job!.title} - ${formData.desired_position}`,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        date_of_birth: formData.date_of_birth,
        certificates: formData.certificates || null,
        experience_years: experienceYears[0],
        previous_vessels: formData.previous_vessels || null,
        cover_letter: formData.cover_letter || null,
        resume_filename: formData.resume_filename || null,
        expected_salary: parseInt(formData.expected_salary),
        salary_currency: 'USD',
        agency_id: formData.agency_id || null
      }, resumeFile || undefined);

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getAgencyName = (agencyId: string): string => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-2xl w-full">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Application Submitted!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for applying to the <strong>{job.title}</strong> position.
                We will review your application and contact you soon.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/careers')}
                >
                  View Other Positions
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/careers')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Button>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className="bg-blue-600">{job.vessel_type}</Badge>
              </div>
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-lg">
                {job.location} • {job.salary_range}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {showReview ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Review Your Application</CardTitle>
                <CardDescription>
                  Please review your information before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-500">Full Name</Label>
                    <p className="text-lg font-medium">{formData.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="text-lg font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Phone Number</Label>
                    <p className="text-lg font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Nationality</Label>
                    <p className="text-lg font-medium">{formData.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Desired Position</Label>
                    <p className="text-lg font-medium">{formData.desired_position}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Date of Birth</Label>
                    <p className="text-lg font-medium">{formData.date_of_birth}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Years of Experience</Label>
                    <p className="text-lg font-medium">{experienceYears[0]} years</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Expected Salary</Label>
                    <p className="text-lg font-medium">${formatSalary(formData.expected_salary)} USD</p>
                  </div>
                  {formData.agency_id && (
                    <div>
                      <Label className="text-sm text-gray-500">Agency</Label>
                      <p className="text-lg font-medium">{getAgencyName(formData.agency_id)}</p>
                    </div>
                  )}
                </div>

                {formData.certificates && (
                  <div>
                    <Label className="text-sm text-gray-500">Certificates</Label>
                    <p className="text-lg font-medium">{formData.certificates}</p>
                  </div>
                )}

                {formData.previous_vessels && (
                  <div>
                    <Label className="text-sm text-gray-500">Previous Vessels</Label>
                    <p className="text-lg font-medium whitespace-pre-wrap">{formData.previous_vessels}</p>
                  </div>
                )}

                {formData.cover_letter && (
                  <div>
                    <Label className="text-sm text-gray-500">Cover Letter</Label>
                    <p className="text-lg font-medium whitespace-pre-wrap">{formData.cover_letter}</p>
                  </div>
                )}

                {formData.resume_filename && resumeFile && (
                  <div>
                    <Label className="text-sm text-gray-500">Resume/CV</Label>
                    <p className="text-lg font-medium">
                      {formData.resume_filename} ({formatFileSize(resumeFile.size)})
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Edit Application
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Application Form</CardTitle>
                <CardDescription>
                  Please fill in all required fields marked with *
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReview} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Select
                        value={formData.nationality}
                        onValueChange={handleNationalityChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {nationalityOptions.map((nationality) => (
                            <SelectItem key={nationality.id} value={nationality.name}>
                              {nationality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desired_position">Desired Position *</Label>
                      <Select
                        value={formData.desired_position}
                        onValueChange={handlePositionChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select desired position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positionOptions.map((position) => (
                            <SelectItem key={position.id} value={position.name}>
                              {position.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience * ({experienceYears[0]} years)</Label>
                      <div className="pt-2">
                        <Slider
                          id="experience_years"
                          min={0}
                          max={30}
                          step={1}
                          value={experienceYears}
                          onValueChange={setExperienceYears}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>15</span>
                          <span>30</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected_salary">Expected Salary (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="expected_salary"
                        name="expected_salary"
                        type="text"
                        placeholder="e.g., 5000"
                        value={formatSalary(formData.expected_salary)}
                        onChange={handleSalaryChange}
                        className="pl-9"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter your expected monthly salary in USD</p>
                  </div>

                  {agencies.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="agency_id">Agency (Optional)</Label>
                      <Select
                        value={formData.agency_id}
                        onValueChange={handleAgencyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Direct Application</SelectItem>
                          {agencies.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Select an agency if you are applying through one</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="certificates">Certificates (comma separated)</Label>
                    <Input
                      id="certificates"
                      name="certificates"
                      placeholder="e.g., STCW Basic Safety, Chief Engineer Certificate"
                      value={formData.certificates}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previous_vessels">Previous Vessels</Label>
                    <Textarea
                      id="previous_vessels"
                      name="previous_vessels"
                      placeholder="List your previous vessel experience"
                      value={formData.previous_vessels}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover_letter">Cover Letter</Label>
                    <Textarea
                      id="cover_letter"
                      name="cover_letter"
                      placeholder="Tell us why you're interested in this position"
                      value={formData.cover_letter}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Input
                          id="resume"
                          type="file"
                          accept={ALLOWED_FILE_TYPES.join(',')}
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gray-500">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>Allowed formats: PDF, DOC, DOCX</p>
                          <p>Maximum file size: 5MB</p>
                        </div>
                      </div>
                      {formData.resume_filename && resumeFile && (
                        <p className="text-sm text-gray-600">
                          Selected: {formData.resume_filename} ({formatFileSize(resumeFile.size)})
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}