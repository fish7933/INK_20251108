import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Ship, Plus, Edit, Trash2, Anchor } from 'lucide-react';
import { vesselsAPI, positionsAPI, type Vessel } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VesselsTab() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [positionCounts, setPositionCounts] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    vessel_name: '',
    vessel_type: '',
    tonnage: '',
    route: '',
    flag: '',
    built_year: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    try {
      setLoading(true);
      const data = await vesselsAPI.getAll();
      setVessels(data);

      // Load position counts for each vessel
      const counts: Record<string, number> = {};
      for (const vessel of data) {
        const positions = await positionsAPI.getByVessel(vessel.id);
        counts[vessel.id] = positions.length;
      }
      setPositionCounts(counts);
    } catch (error) {
      console.error('Failed to load vessels:', error);
      toast.error('Failed to load vessels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vessel?: Vessel) => {
    if (vessel) {
      setEditingVessel(vessel);
      setFormData({
        vessel_name: vessel.vessel_name,
        vessel_type: vessel.vessel_type,
        tonnage: vessel.tonnage?.toString() || '',
        route: vessel.route || '',
        flag: vessel.flag || '',
        built_year: vessel.built_year?.toString() || '',
        description: vessel.description || '',
        image_url: vessel.image_url || '',
        is_active: vessel.is_active,
      });
    } else {
      setEditingVessel(null);
      setFormData({
        vessel_name: '',
        vessel_type: '',
        tonnage: '',
        route: '',
        flag: '',
        built_year: '',
        description: '',
        image_url: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVessel(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vessel_name || !formData.vessel_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const vesselData = {
        vessel_name: formData.vessel_name,
        vessel_type: formData.vessel_type,
        tonnage: formData.tonnage ? parseInt(formData.tonnage) : undefined,
        route: formData.route || undefined,
        flag: formData.flag || undefined,
        built_year: formData.built_year ? parseInt(formData.built_year) : undefined,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        is_active: formData.is_active,
      };

      if (editingVessel) {
        await vesselsAPI.update(editingVessel.id, vesselData);
        toast.success('Vessel updated successfully');
      } else {
        await vesselsAPI.create(vesselData);
        toast.success('Vessel created successfully');
      }

      handleCloseDialog();
      loadVessels();
    } catch (error) {
      console.error('Failed to save vessel:', error);
      toast.error('Failed to save vessel');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vessel? All associated positions and applications will also be deleted.')) {
      return;
    }

    try {
      await vesselsAPI.delete(id);
      toast.success('Vessel deleted successfully');
      loadVessels();
    } catch (error) {
      console.error('Failed to delete vessel:', error);
      toast.error('Failed to delete vessel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vessels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vessels</h2>
          <p className="text-muted-foreground">Manage your fleet and vessel information</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vessel
        </Button>
      </div>

      {vessels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ship className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vessels yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first vessel</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vessel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vessels.map((vessel) => (
            <Card key={vessel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Anchor className="h-5 w-5 text-blue-600" />
                      {vessel.vessel_name}
                    </CardTitle>
                    <CardDescription>{vessel.vessel_type}</CardDescription>
                  </div>
                  <Badge variant={vessel.is_active ? 'default' : 'secondary'}>
                    {vessel.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {vessel.tonnage && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tonnage:</span>
                      <span className="font-medium">{vessel.tonnage.toLocaleString()} MT</span>
                    </div>
                  )}
                  {vessel.route && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium">{vessel.route}</span>
                    </div>
                  )}
                  {vessel.flag && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flag:</span>
                      <span className="font-medium">{vessel.flag}</span>
                    </div>
                  )}
                  {vessel.built_year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Built:</span>
                      <span className="font-medium">{vessel.built_year}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Positions:</span>
                    <Badge variant="outline">{positionCounts[vessel.id] || 0}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(vessel)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(vessel.id)}
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
            <DialogTitle>{editingVessel ? 'Edit Vessel' : 'Add New Vessel'}</DialogTitle>
            <DialogDescription>
              {editingVessel ? 'Update vessel information' : 'Enter the details for the new vessel'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel_name">Vessel Name *</Label>
                  <Input
                    id="vessel_name"
                    value={formData.vessel_name}
                    onChange={(e) => setFormData({ ...formData, vessel_name: e.target.value })}
                    placeholder="e.g., MV Pacific Star"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vessel_type">Vessel Type *</Label>
                  <Input
                    id="vessel_type"
                    value={formData.vessel_type}
                    onChange={(e) => setFormData({ ...formData, vessel_type: e.target.value })}
                    placeholder="e.g., Bulk Carrier"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tonnage">Tonnage (MT)</Label>
                  <Input
                    id="tonnage"
                    type="number"
                    value={formData.tonnage}
                    onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })}
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="built_year">Built Year</Label>
                  <Input
                    id="built_year"
                    type="number"
                    value={formData.built_year}
                    onChange={(e) => setFormData({ ...formData, built_year: e.target.value })}
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="e.g., Asia-Europe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flag">Flag</Label>
                  <Input
                    id="flag"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="e.g., Panama"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/photo1763015392.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter vessel description..."
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
                {editingVessel ? 'Update Vessel' : 'Create Vessel'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}