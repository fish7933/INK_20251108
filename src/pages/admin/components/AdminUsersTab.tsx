import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminUsersTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Users</h2>
        <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin User Management</h3>
          <p className="text-muted-foreground text-center max-w-md">
            This feature is coming soon. You'll be able to manage administrator accounts, 
            roles, and permissions from this section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}