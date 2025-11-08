import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase, Ship, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobPostingsAPI, JobPosting } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Careers() {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobPostings();
  }, []);

  const loadJobPostings = async () => {
    try {
      setLoading(true);
      const data = await jobPostingsAPI.getActive();
      setJobPostings(data);
    } catch (error) {
      console.error('Error loading job postings:', error);
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Join Our Crew
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Start your maritime career with INK CO., LTD.
            </p>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="flex-1 py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Current Openings
            </h2>
            <p className="text-xl text-gray-600">
              {jobPostings.length} position{jobPostings.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {jobPostings.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <Ship className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl text-gray-600">
                  No positions available at the moment.
                </p>
                <p className="text-gray-500 mt-2">
                  Please check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobPostings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-blue-600">{job.vessel_type}</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="text-base">
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.positions.map((position, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span>{job.salary_range}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate(`/careers/apply/${job.id}`)}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}