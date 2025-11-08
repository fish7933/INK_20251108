# Multi-Position Job Posting System Design

## Overview
Transform the system to support multiple positions per job posting, where applicants select one position when applying.

## Database Changes

### 1. job_postings table
- Change `position` (text) → `positions` (text[])
- Keep all other fields the same

### 2. applications table  
- Keep `job_title` (references job posting title)
- Add `selected_position` (text) - the position applicant chose from the job's positions array

## Implementation Steps

### Phase 1: Database Migration
1. Drop existing job_postings and applications data
2. Update table schema to use positions array
3. Update TypeScript types in supabase.ts

### Phase 2: Admin Panel (CareersAdmin.tsx)
1. Job Form Modal:
   - Replace single position select with multi-select checkboxes
   - Show all available positions from position_options
   - Allow selecting multiple positions
2. Job List Display:
   - Show positions as multiple badges
   - Update table columns

### Phase 3: Public Pages
1. Careers.tsx (Job Listings):
   - Display multiple positions as badges on job cards
   - Update filtering logic
2. CareersApply.tsx (Application Form):
   - Add position selector dropdown (shows only positions from selected job)
   - Make it required field
   - Update form submission

## Data Flow
1. Admin creates job with positions: ["Chief Engineer", "Second Engineer", "Third Engineer"]
2. Job listing shows all three positions
3. Applicant selects job and chooses "Second Engineer" from dropdown
4. Application stores: job_title + selected_position
