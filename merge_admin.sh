#!/bin/bash

# Read the current file (has multi-position support but incomplete)
# Read the backup file (complete but has old single position)
# Create merged file with multi-position support and complete structure

# Copy lines 1-104 from backup (state declarations with positions array fix)
sed -n '1,104p' src/pages/CareersAdmin_backup.tsx | sed 's/position: '\'''\'''/positions: [] as string[]/' > src/pages/CareersAdmin_merged.tsx

# Add the rest of the handlers and functions from backup (lines 105-990)
sed -n '105,990p' src/pages/CareersAdmin_backup.tsx >> src/pages/CareersAdmin_merged.tsx

# Update handleJobFormChange to support positions array
cat >> src/pages/CareersAdmin_merged.tsx << 'EOF'

  const togglePositionSelection = (positionName: string) => {
    setJobFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(positionName)
        ? prev.positions.filter(p => p !== positionName)
        : [...prev.positions, positionName]
    }));
  };

EOF

# Add resetJobForm with positions array
cat >> src/pages/CareersAdmin_merged.tsx << 'EOF'
  const resetJobForm = () => {
    setJobFormData({
      title: '',
      positions: [],
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

EOF

# Add remaining handlers from backup (lines 1010-1037) but update for positions array
sed -n '1010,1019p' src/pages/CareersAdmin_backup.tsx >> src/pages/CareersAdmin_merged.tsx

cat >> src/pages/CareersAdmin_merged.tsx << 'EOF'
  const handleEditJob = (job: JobPosting) => {
    if (!currentUser?.permissions.jobs.edit) {
      toast.error('You do not have permission to edit job postings');
      return;
    }

    setSelectedJob(job);
    setJobFormData({
      title: job.title,
      positions: job.positions || [],
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
    
    if (!jobFormData.title || jobFormData.positions.length === 0 || !jobFormData.vessel_type) {
      toast.error('Please fill in all required fields (title, at least one position, and vessel type)');
      return;
    }

    try {
      setUpdating(true);
      
      const jobData = {
        title: jobFormData.title,
        positions: jobFormData.positions,
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

EOF

# Add remaining admin handlers and helper functions from backup (lines 1083-1583)
sed -n '1083,1583p' src/pages/CareersAdmin_backup.tsx >> src/pages/CareersAdmin_merged.tsx

# Add the complete UI rendering from backup (lines 1585-1996) 
sed -n '1585,1996p' src/pages/CareersAdmin_backup.tsx >> src/pages/CareersAdmin_merged.tsx

# Add Admin Users tab and Settings tab from backup (lines 1998-2472)
sed -n '1998,2472p' src/pages/CareersAdmin_backup.tsx >> src/pages/CareersAdmin_merged.txt

# Add all modals from backup but update Job Form Modal for multi-position
sed -n '2477,2692p' src/pages/CareersAdmin_backup.tsx >> src/pages/CareersAdmin_merged.tsx

echo "Merge script completed"
