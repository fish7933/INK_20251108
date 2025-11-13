import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  applicationsAPI,
  jobPostingsAPI,
  adminUsersAPI,
  emailRecipientsAPI,
  agenciesAPI,
  positionOptionsAPI,
  vesselTypeOptionsAPI,
  locationOptionsAPI,
  salaryRangeOptionsAPI,
  nationalityOptionsAPI,
  adminAuth
} from '@/lib/supabase';
import type {
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
} from '../types';

export function useAdminData() {
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    loadData();
  }, []);

  return {
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
  };
}