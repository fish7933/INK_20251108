import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import { emailRecipientsAPI, type EmailRecipient } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsTab() {
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<EmailRecipient | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nationality: '',
    is_active: true,
  });

  useState(() => {
    loadEmailRecipients();
  });

  const loadEmailRecipients = async () => {
    try {
      setLoading(true);
      const data = await emailRecipientsAPI.getAll();
      setEmailRecipients(data);
    } catch (error) {
      console.error('Failed to load email recipients:', error);
      toast.error('Failed to load email recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (recipient?: EmailRecipient) => {
    if (recipient) {
      setEditingRecipient(recipient);
      setFormData({
        email: recipient.email,
        name: recipient.name,
        nationality: recipient.nationality || '',
        is_active: recipient.is_active,
      });
    } else {
      setEditingRecipient(null);
      setFormData({
        email: '',
        name: '',
        nationality: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecipient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const recipientData = {
        email: formData.email,
        name: formData.name,
        nationality: formData.nationality || undefined,
        is_active: formData.is_active,
      };

      if (editingRecipient) {
        await emailRecipientsAPI.update(editingRecipient.id, recipientData);
        toast.success('Email recipient updated successfully');
      } else {
        await emailRecipientsAPI.create(recipientData);
        toast.success('Email recipient created successfully');
      }

      handleCloseDialog();
      loadEmailRecipients();
    } catch (error) {
      console.error('Failed to save email recipient:', error);
      toast.error('Failed to save email recipient');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email recipient?')) {
      return;
    }

    try {
      await emailRecipientsAPI.delete(id);
      toast.success('Email recipient deleted successfully');
      loadEmailRecipients();
    } catch (error) {
      console.error('Failed to delete email recipient:', error);
      toast.error('Failed to delete email recipient');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Recipients</h2>
          <p className="text-muted-foreground">Manage who receives application notifications</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipient
        </Button>
      </div>

      {emailRecipients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No email recipients yet</h3>
            <p className="text-muted-foreground mb-4">Add recipients to receive application notifications</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nationality Filter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        onCheckedChange={async (checked) => {
                          try {
                            await emailRecipientsAPI.update(recipient.id, { is_active: checked });
                            toast.success(`Recipient ${checked ? 'activated' : 'deactivated'}`);
                            loadEmailRecipients();
                          } catch (error) {
                            console.error('Failed to update recipient:', error);
                            toast.error('Failed to update recipient');
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(recipient)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(recipient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">
                  {editingRecipient ? 'Edit Email Recipient' : 'Add Email Recipient'}
                </CardTitle>
                <Button variant="ghost" onClick={handleCloseDialog}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter recipient name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality Filter (Optional)</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g., Filipino, Indonesian"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to receive all applications, or specify a nationality to filter
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingRecipient ? 'Update Recipient' : 'Create Recipient'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}