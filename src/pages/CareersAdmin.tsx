import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Ship, Briefcase, FileText, Users, Settings } from 'lucide-react';
import VesselsTab from './admin/components/VesselsTab';
import PositionsTab from './admin/components/PositionsTab';
import ApplicationsTab from './admin/components/ApplicationsTab';
import AdminUsersTab from './admin/components/AdminUsersTab';
import SettingsTab from './admin/components/SettingsTab';

export default function CareersAdmin() {
  const [activeTab, setActiveTab] = useState('vessels');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Careers Admin Dashboard</h1>
          <p className="text-gray-600">Manage vessels, positions, and applications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="vessels" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Vessels</span>
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Positions</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="admin-users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vessels">
            <Card>
              <CardContent className="pt-6">
                <VesselsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardContent className="pt-6">
                <PositionsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardContent className="pt-6">
                <ApplicationsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-users">
            <Card>
              <CardContent className="pt-6">
                <AdminUsersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="pt-6">
                <SettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}