import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit, Trash2, Eye, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
  emailRecipientsAPI,
  agenciesAPI,
  positionOptionsAPI,
  vesselTypeOptionsAPI,
  locationOptionsAPI,
  salaryRangeOptionsAPI,
  nationalityOptionsAPI
} from '@/lib/supabase';
import type {
  EmailRecipient,
  Agency,
  PositionOption,
  VesselTypeOption,
  LocationOption,
  SalaryRangeOption,
  NationalityOption,
  AdminUser
} from '../types';

interface SettingsTabProps {
  emailRecipients: EmailRecipient[];
  setEmailRecipients: React.Dispatch<React.SetStateAction<EmailRecipient[]>>;
  agencies: Agency[];
  setAgencies: React.Dispatch<React.SetStateAction<Agency[]>>;
  positionOptions: PositionOption[];
  setPositionOptions: React.Dispatch<React.SetStateAction<PositionOption[]>>;
  vesselTypeOptions: VesselTypeOption[];
  setVesselTypeOptions: React.Dispatch<React.SetStateAction<VesselTypeOption[]>>;
  locationOptions: LocationOption[];
  setLocationOptions: React.Dispatch<React.SetStateAction<LocationOption[]>>;
  salaryRangeOptions: SalaryRangeOption[];
  setSalaryRangeOptions: React.Dispatch<React.SetStateAction<SalaryRangeOption[]>>;
  nationalityOptions: NationalityOption[];
  setNationalityOptions: React.Dispatch<React.SetStateAction<NationalityOption[]>>;
  currentUser: AdminUser | null;
}

export function SettingsTab({
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
  currentUser
}: SettingsTabProps) {
  const [selectedEmailRecipient, setSelectedEmailRecipient] = useState<EmailRecipient | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showEmailRecipientForm, setShowEmailRecipientForm] = useState(false);
  const [showEmailRecipientDetail, setShowEmailRecipientDetail] = useState(false);
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  const [newVesselTypeName, setNewVesselTypeName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newSalaryRangeName, setNewSalaryRangeName] = useState('');
  const [newNationalityName, setNewNationalityName] = useState('');
  const [emailRecipientFormData, setEmailRecipientFormData] = useState({
    email: '',
    name: '',
    nationality: 'all',
    is_active: true
  });
  const [agencyFormData, setAgencyFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });

  // Agency handlers
  const handleCreateAgency = () => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setAgencyFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      is_active: true
    });
    setSelectedAgency(null);
    setShowAgencyForm(true);
  };

  const handleEditAgency = (agency: Agency) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setSelectedAgency(agency);
    setAgencyFormData({
      name: agency.name,
      contact_person: agency.contact_person || '',
      email: agency.email || '',
      phone: agency.phone || '',
      address: agency.address || '',
      is_active: agency.is_active
    });
    setShowAgencyForm(true);
  };

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agencyFormData.name) {
      toast.error('Please enter agency name');
      return;
    }

    try {
      setUpdating(true);

      const agencyData = {
        name: agencyFormData.name,
        contact_person: agencyFormData.contact_person || null,
        email: agencyFormData.email || null,
        phone: agencyFormData.phone || null,
        address: agencyFormData.address || null,
        is_active: agencyFormData.is_active
      };

      if (selectedAgency) {
        await agenciesAPI.update(selectedAgency.id, agencyData);
        setAgencies(agencies.map(a =>
          a.id === selectedAgency.id ? { ...a, ...agencyData } : a
        ));
        toast.success('Agency updated successfully');
      } else {
        const newAgency = await agenciesAPI.create(agencyData);
        setAgencies([newAgency, ...agencies]);
        toast.success('Agency added successfully');
      }

      setShowAgencyForm(false);
      setSelectedAgency(null);
    } catch (error) {
      console.error('Error saving agency:', error);
      toast.error('Failed to save agency');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAgencyActive = async (id: string, isActive: boolean) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    try {
      setUpdating(true);
      await agenciesAPI.toggleActive(id, isActive);
      setAgencies(agencies.map(a =>
        a.id === id ? { ...a, is_active: isActive } : a
      ));
      toast.success(`Agency ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling agency:', error);
      toast.error('Failed to update agency');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAgency = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this agency?')) {
      return;
    }

    try {
      setUpdating(true);
      await agenciesAPI.delete(id);
      setAgencies(agencies.filter(a => a.id !== id));
      toast.success('Agency deleted successfully');
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast.error('Failed to delete agency');
    } finally {
      setUpdating(false);
    }
  };

  // Email recipient handlers
  const handleCreateEmailRecipient = () => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setEmailRecipientFormData({
      email: '',
      name: '',
      nationality: 'all',
      is_active: true
    });
    setSelectedEmailRecipient(null);
    setShowEmailRecipientForm(true);
  };

  const handleViewEmailRecipient = (recipient: EmailRecipient) => {
    setSelectedEmailRecipient(recipient);
    setShowEmailRecipientDetail(true);
  };

  const handleEditEmailRecipient = (recipient: EmailRecipient) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    setShowEmailRecipientDetail(false);
    setSelectedEmailRecipient(recipient);
    setEmailRecipientFormData({
      email: recipient.email,
      name: recipient.name,
      nationality: recipient.nationality || 'all',
      is_active: recipient.is_active
    });
    setShowEmailRecipientForm(true);
  };

  const handleSaveEmailRecipient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRecipientFormData.email || !emailRecipientFormData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUpdating(true);

      const recipientData = {
        email: emailRecipientFormData.email,
        name: emailRecipientFormData.name,
        nationality: emailRecipientFormData.nationality === 'all' ? null : emailRecipientFormData.nationality,
        is_active: emailRecipientFormData.is_active
      };

      if (selectedEmailRecipient) {
        await emailRecipientsAPI.update(selectedEmailRecipient.id, recipientData);
        setEmailRecipients(emailRecipients.map(r =>
          r.id === selectedEmailRecipient.id ? { ...r, ...recipientData } : r
        ));
        toast.success('Email recipient updated successfully');
      } else {
        const newRecipient = await emailRecipientsAPI.create(recipientData);
        setEmailRecipients([newRecipient, ...emailRecipients]);
        toast.success('Email recipient added successfully');
      }

      setShowEmailRecipientForm(false);
      setSelectedEmailRecipient(null);
    } catch (error) {
      console.error('Error saving email recipient:', error);
      toast.error('Failed to save email recipient');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleEmailRecipientActive = async (id: string, isActive: boolean) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    try {
      setUpdating(true);
      await emailRecipientsAPI.toggleActive(id, isActive);
      setEmailRecipients(emailRecipients.map(r =>
        r.id === id ? { ...r, is_active: isActive } : r
      ));
      toast.success(`Email recipient ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling email recipient:', error);
      toast.error('Failed to update email recipient');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEmailRecipient = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this email recipient?')) {
      return;
    }

    try {
      setUpdating(true);
      await emailRecipientsAPI.delete(id);
      setEmailRecipients(emailRecipients.filter(r => r.id !== id));
      toast.success('Email recipient deleted successfully');
    } catch (error) {
      console.error('Error deleting email recipient:', error);
      toast.error('Failed to delete email recipient');
    } finally {
      setUpdating(false);
    }
  };

  // Form options handlers
  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newPositionName.trim()) {
      toast.error('Please enter a position name');
      return;
    }

    try {
      setUpdating(true);
      const newPosition = await positionOptionsAPI.create(newPositionName.trim());
      setPositionOptions([...positionOptions, newPosition].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPositionName('');
      toast.success('Position added successfully');
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Failed to add position');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this position?')) {
      return;
    }

    try {
      setUpdating(true);
      await positionOptionsAPI.delete(id);
      setPositionOptions(positionOptions.filter(pos => pos.id !== id));
      toast.success('Position deleted successfully');
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete position');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddVesselType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newVesselTypeName.trim()) {
      toast.error('Please enter a vessel type name');
      return;
    }

    try {
      setUpdating(true);
      const newVesselType = await vesselTypeOptionsAPI.create(newVesselTypeName.trim());
      setVesselTypeOptions([...vesselTypeOptions, newVesselType].sort((a, b) => a.name.localeCompare(b.name)));
      setNewVesselTypeName('');
      toast.success('Vessel type added successfully');
    } catch (error) {
      console.error('Error adding vessel type:', error);
      toast.error('Failed to add vessel type');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteVesselType = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this vessel type?')) {
      return;
    }

    try {
      setUpdating(true);
      await vesselTypeOptionsAPI.delete(id);
      setVesselTypeOptions(vesselTypeOptions.filter(vt => vt.id !== id));
      toast.success('Vessel type deleted successfully');
    } catch (error) {
      console.error('Error deleting vessel type:', error);
      toast.error('Failed to delete vessel type');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newLocationName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    try {
      setUpdating(true);
      const newLocation = await locationOptionsAPI.create(newLocationName.trim());
      setLocationOptions([...locationOptions, newLocation].sort((a, b) => a.name.localeCompare(b.name)));
      setNewLocationName('');
      toast.success('Location added successfully');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      setUpdating(true);
      await locationOptionsAPI.delete(id);
      setLocationOptions(locationOptions.filter(loc => loc.id !== id));
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSalaryRange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newSalaryRangeName.trim()) {
      toast.error('Please enter a salary range');
      return;
    }

    try {
      setUpdating(true);
      const newSalaryRange = await salaryRangeOptionsAPI.create(newSalaryRangeName.trim());
      setSalaryRangeOptions([...salaryRangeOptions, newSalaryRange].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSalaryRangeName('');
      toast.success('Salary range added successfully');
    } catch (error) {
      console.error('Error adding salary range:', error);
      toast.error('Failed to add salary range');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSalaryRange = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this salary range?')) {
      return;
    }

    try {
      setUpdating(true);
      await salaryRangeOptionsAPI.delete(id);
      setSalaryRangeOptions(salaryRangeOptions.filter(sr => sr.id !== id));
      toast.success('Salary range deleted successfully');
    } catch (error) {
      console.error('Error deleting salary range:', error);
      toast.error('Failed to delete salary range');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNationality = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!newNationalityName.trim()) {
      toast.error('Please enter a nationality');
      return;
    }

    try {
      setUpdating(true);
      const newNationality = await nationalityOptionsAPI.create(newNationalityName.trim());
      setNationalityOptions([...nationalityOptions, newNationality].sort((a, b) => a.name.localeCompare(b.name)));
      setNewNationalityName('');
      toast.success('Nationality added successfully');
    } catch (error) {
      console.error('Error adding nationality:', error);
      toast.error('Failed to add nationality');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteNationality = async (id: string) => {
    if (!currentUser?.permissions.settings.edit) {
      toast.error('You do not have permission to edit settings');
      return;
    }

    if (!confirm('Are you sure you want to delete this nationality?')) {
      return;
    }

    try {
      setUpdating(true);
      await nationalityOptionsAPI.delete(id);
      setNationalityOptions(nationalityOptions.filter(nat => nat.id !== id));
      toast.success('Nationality deleted successfully');
    } catch (error) {
      console.error('Error deleting nationality:', error);
      toast.error('Failed to delete nationality');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="agencies">
        <TabsList>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="email">Email Recipients</TabsTrigger>
          <TabsTrigger value="options">Form Options</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Agencies</CardTitle>
                {currentUser?.permissions.settings.edit && (
                  <Button onClick={handleCreateAgency}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agency
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {agencies.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No agencies yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies.map((agency) => (
                      <TableRow key={agency.id}>
                        <TableCell className="font-medium">{agency.name}</TableCell>
                        <TableCell>{agency.contact_person || 'N/A'}</TableCell>
                        <TableCell>{agency.email || 'N/A'}</TableCell>
                        <TableCell>{agency.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={agency.is_active}
                            onCheckedChange={(checked) => handleToggleAgencyActive(agency.id, checked)}
                            disabled={!currentUser?.permissions.settings.edit}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {currentUser?.permissions.settings.edit && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAgency(agency)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteAgency(agency.id)}
                                  disabled={updating}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Recipients</CardTitle>
                {currentUser?.permissions.settings.edit && (
                  <Button onClick={handleCreateEmailRecipient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Recipient
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {emailRecipients.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No email recipients yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailRecipients.map((recipient) => (
                      <TableRow key={recipient.id}>
                        <TableCell className="font-medium">{recipient.name}</TableCell>
                        <TableCell>{recipient.email}</TableCell>
                        <TableCell>{recipient.nationality || 'All'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={recipient.is_active}
                            onCheckedChange={(checked) => handleToggleEmailRecipientActive(recipient.id, checked)}
                            disabled={!currentUser?.permissions.settings.edit}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewEmailRecipient(recipient)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {currentUser?.permissions.settings.edit && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditEmailRecipient(recipient)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteEmailRecipient(recipient.id)}
                                  disabled={updating}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
        </TabsContent>

        <TabsContent value="options">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.permissions.settings.edit && (
                  <form onSubmit={handleAddPosition} className="flex gap-2 mb-4">
                    <Input
                      value={newPositionName}
                      onChange={(e) => setNewPositionName(e.target.value)}
                      placeholder="Add new position"
                    />
                    <Button type="submit" disabled={updating}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                <div className="flex flex-wrap gap-2">
                  {positionOptions.map((pos) => (
                    <Badge key={pos.id} variant="outline" className="text-sm py-1 px-3">
                      {pos.name}
                      {currentUser?.permissions.settings.edit && (
                        <button
                          onClick={() => handleDeletePosition(pos.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vessel Types</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.permissions.settings.edit && (
                  <form onSubmit={handleAddVesselType} className="flex gap-2 mb-4">
                    <Input
                      value={newVesselTypeName}
                      onChange={(e) => setNewVesselTypeName(e.target.value)}
                      placeholder="Add new vessel type"
                    />
                    <Button type="submit" disabled={updating}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                <div className="flex flex-wrap gap-2">
                  {vesselTypeOptions.map((vt) => (
                    <Badge key={vt.id} variant="outline" className="text-sm py-1 px-3">
                      {vt.name}
                      {currentUser?.permissions.settings.edit && (
                        <button
                          onClick={() => handleDeleteVesselType(vt.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.permissions.settings.edit && (
                  <form onSubmit={handleAddLocation} className="flex gap-2 mb-4">
                    <Input
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Add new location"
                    />
                    <Button type="submit" disabled={updating}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((loc) => (
                    <Badge key={loc.id} variant="outline" className="text-sm py-1 px-3">
                      {loc.name}
                      {currentUser?.permissions.settings.edit && (
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salary Ranges</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.permissions.settings.edit && (
                  <form onSubmit={handleAddSalaryRange} className="flex gap-2 mb-4">
                    <Input
                      value={newSalaryRangeName}
                      onChange={(e) => setNewSalaryRangeName(e.target.value)}
                      placeholder="Add new salary range"
                    />
                    <Button type="submit" disabled={updating}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                <div className="flex flex-wrap gap-2">
                  {salaryRangeOptions.map((sr) => (
                    <Badge key={sr.id} variant="outline" className="text-sm py-1 px-3">
                      {sr.name}
                      {currentUser?.permissions.settings.edit && (
                        <button
                          onClick={() => handleDeleteSalaryRange(sr.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nationalities</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.permissions.settings.edit && (
                  <form onSubmit={handleAddNationality} className="flex gap-2 mb-4">
                    <Input
                      value={newNationalityName}
                      onChange={(e) => setNewNationalityName(e.target.value)}
                      placeholder="Add new nationality"
                    />
                    <Button type="submit" disabled={updating}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                <div className="flex flex-wrap gap-2">
                  {nationalityOptions.map((nat) => (
                    <Badge key={nat.id} variant="outline" className="text-sm py-1 px-3">
                      {nat.name}
                      {currentUser?.permissions.settings.edit && (
                        <button
                          onClick={() => handleDeleteNationality(nat.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Recipient Detail Modal */}
      {showEmailRecipientDetail && selectedEmailRecipient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">Email Recipient Details</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailRecipientDetail(false);
                    setSelectedEmailRecipient(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Name</Label>
                <p className="font-medium">{selectedEmailRecipient.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {selectedEmailRecipient.email}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Nationality Filter</Label>
                <p>{selectedEmailRecipient.nationality || 'All nationalities'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <p>
                  {selectedEmailRecipient.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Created</Label>
                <p>{new Date(selectedEmailRecipient.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agency Form Modal */}
      {showAgencyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {selectedAgency ? 'Edit Agency' : 'Add Agency'}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowAgencyForm(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAgency} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agency_name">Agency Name *</Label>
                  <Input
                    id="agency_name"
                    value={agencyFormData.name}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, name: e.target.value })}
                    placeholder="Enter agency name"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_contact">Contact Person</Label>
                  <Input
                    id="agency_contact"
                    value={agencyFormData.contact_person}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, contact_person: e.target.value })}
                    placeholder="Enter contact person name"
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_email">Email</Label>
                  <Input
                    id="agency_email"
                    type="email"
                    value={agencyFormData.email}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, email: e.target.value })}
                    placeholder="Enter email"
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_phone">Phone</Label>
                  <Input
                    id="agency_phone"
                    value={agencyFormData.phone}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_address">Address</Label>
                  <Textarea
                    id="agency_address"
                    value={agencyFormData.address}
                    onChange={(e) => setAgencyFormData({ ...agencyFormData, address: e.target.value })}
                    placeholder="Enter address"
                    rows={3}
                    disabled={updating}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="agency_active"
                    checked={agencyFormData.is_active}
                    onCheckedChange={(checked) => setAgencyFormData({ ...agencyFormData, is_active: checked })}
                    disabled={updating}
                  />
                  <Label htmlFor="agency_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAgencyForm(false)}
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
                        Saving...
                      </>
                    ) : (
                      'Save Agency'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Recipient Form Modal */}
      {showEmailRecipientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {selectedEmailRecipient ? 'Edit Email Recipient' : 'Add Email Recipient'}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowEmailRecipientForm(false);
                    setSelectedEmailRecipient(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEmailRecipient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Name *</Label>
                  <Input
                    id="recipient_name"
                    value={emailRecipientFormData.name}
                    onChange={(e) => setEmailRecipientFormData({ ...emailRecipientFormData, name: e.target.value })}
                    placeholder="Enter recipient name"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_email">Email *</Label>
                  <Input
                    id="recipient_email"
                    type="email"
                    value={emailRecipientFormData.email}
                    onChange={(e) => setEmailRecipientFormData({ ...emailRecipientFormData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    disabled={updating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_nationality">Nationality Filter (optional)</Label>
                  <Select
                    value={emailRecipientFormData.nationality}
                    onValueChange={(value) => setEmailRecipientFormData({ ...emailRecipientFormData, nationality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All nationalities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All nationalities</SelectItem>
                      {nationalityOptions.map((nat) => (
                        <SelectItem key={nat.id} value={nat.name}>
                          {nat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Leave empty to receive all applications, or select a nationality to only receive applications from that nationality
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recipient_active"
                    checked={emailRecipientFormData.is_active}
                    onCheckedChange={(checked) => setEmailRecipientFormData({ ...emailRecipientFormData, is_active: checked })}
                    disabled={updating}
                  />
                  <Label htmlFor="recipient_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEmailRecipientForm(false);
                      setSelectedEmailRecipient(null);
                    }}
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
                        Saving...
                      </>
                    ) : (
                      'Save Recipient'
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