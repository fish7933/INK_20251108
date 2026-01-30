import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit, Trash2, Ship } from 'lucide-react';
import { vesselsAPI, positionsAPI, type Vessel, type PositionWithVessel } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PositionsTab() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [positions, setPositions] = useState<PositionWithVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionWithVessel | null>(null);
  const [filterVesselId, setFilterVesselId] = useState<string>('all');

  const [formData, setFormData] = useState({
    vessel_id: '',
    position_name: '',
    rank: 'Officer',
    vacancies: '1',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    contract_duration: '',
    requirements: '',
    responsibilities: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vesselsData, positionsData] = await Promise.all([
        vesselsAPI.getAll(),
        positionsAPI.getAll(),
      ]);
      setVessels(vesselsData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (position?: PositionWithVessel) => {
    if (position) {
      setEditingPosition(position);
      setFormData({
        vessel_id: position.vessel_id,
        position_name: position.position_name,
        rank: position.rank,
        vacancies: position.vacancies?.toString() || '1',
        salary_min: position.salary_min?.toString() || '',
        salary_max: position.salary_max?.toString() || '',
        salary_currency: position.salary_currency || 'USD',
        contract_duration: position.contract_duration || '',
        requirements: position.requirements || '',
        responsibilities: position.responsibilities || '',
        is_active: position.is_active,
      });
    } else {
      setEditingPosition(null);
      setFormData({
        vessel_id: '',
        position_name: '',
        rank: 'Officer',
        vacancies: '1',
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        contract_duration: '',
        requirements: '',
        responsibilities: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPosition(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vessel_id || !formData.position_name || !formData.rank) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const positionData = {
        vessel_id: formData.vessel_id,
        position_name: formData.position_name,
        rank: formData.rank,
        vacancies: parseInt(formData.vacancies) || 1,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        salary_currency: formData.salary_currency,
        contract_duration: formData.contract_duration || undefined,
        requirements: formData.requirements || undefined,
        responsibilities: formData.responsibilities || undefined,
        is_active: formData.is_active,
      };

      if (editingPosition) {
        await positionsAPI.update(editingPosition.id, positionData);
        toast.success('Position updated successfully');
      } else {
        await positionsAPI.create(positionData);
        toast.success('Position created successfully');
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Failed to save position:', error);
      toast.error('Failed to save position');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this position? All associated applications will also be deleted.')) {
      return;
    }

    try {
      await positionsAPI.delete(id);
      toast.success('Position deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete position:', error);
      toast.error('Failed to delete position');
    }
  };

  const filteredPositions = filterVesselId === 'all'
    ? positions
    : positions.filter((p) => p.vessel_id === filterVesselId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Positions</h2>
          <p className="text-muted-foreground">Manage job positions for each vessel</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Label>Filter by Vessel:</Label>
        <Select value={filterVesselId} onValueChange={setFilterVesselId}>
          <SelectTrigger className="w-[250px]">
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

      {filteredPositions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No positions yet</h3>
            <p className="text-muted-foreground mb-4">Add positions to start recruiting</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPositions.map((position) => (
            <Card key={position.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      {position.position_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Ship className="h-3 w-3" />
                      {position.vessel?.vessel_name}
                    </CardDescription>
                  </div>
                  <Badge variant={position.is_active ? 'default' : 'secondary'}>
                    {position.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rank:</span>
                    <Badge variant="outline">{position.rank}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vacancies:</span>
                    <span className="font-medium">{position.vacancies}</span>
                  </div>
                  {(position.salary_min || position.salary_max) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salary:</span>
                      <span className="font-medium">
                        {position.salary_min && position.salary_max
                          ? `$${position.salary_min.toLocaleString()} - $${position.salary_max.toLocaleString()}`
                          : position.salary_min
                          ? `$${position.salary_min.toLocaleString()}+`
                          : `Up to $${position.salary_max?.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  {position.contract_duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract:</span>
                      <span className="font-medium">{position.contract_duration}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(position)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(position.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPosition ? 'Edit Position' : 'Add New Position'}</DialogTitle>
            <DialogDescription>
              {editingPosition ? 'Update position information' : 'Enter the details for the new position'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vessel_id">Vessel *</Label>
                <Select
                  value={formData.vessel_id}
                  onValueChange={(value) => setFormData({ ...formData, vessel_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vessel" />
                  </SelectTrigger>
                  <SelectContent>
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>
                        {vessel.vessel_name} ({vessel.vessel_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position_name">Position Name *</Label>
                  <Input
                    id="position_name"
                    value={formData.position_name}
                    onChange={(e) => setFormData({ ...formData, position_name: e.target.value })}
                    placeholder="e.g., Chief Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank *</Label>
                  <Select
                    value={formData.rank}
                    onValueChange={(value) => setFormData({ ...formData, rank: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Officer">Officer</SelectItem>
                      <SelectItem value="Rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vacancies">Vacancies</Label>
                  <Input
                    id="vacancies"
                    type="number"
                    value={formData.vacancies}
                    onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Min Salary</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="3000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Max Salary</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_currency">Currency</Label>
                  <Select
                    value={formData.salary_currency}
                    onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_duration">Contract Duration</Label>
                  <Input
                    id="contract_duration"
                    value={formData.contract_duration}
                    onChange={(e) => setFormData({ ...formData, contract_duration: e.target.value })}
                    placeholder="e.g., 6 months"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Enter position requirements..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Enter position responsibilities..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible to applicants)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPosition ? 'Update Position' : 'Create Position'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}