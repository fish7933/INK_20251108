import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Ship, 
  GraduationCap, 
  FileCheck, 
  HeartPulse, 
  Users, 
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Seafarer Management Solutions
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <img 
            src="/assets/services-banner.png" 
            alt="Our Services" 
            className="w-full h-[400px] object-contain md:object-cover bg-slate-100"
          />
        </div>

        {/* Core Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Core Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-6 h-6 text-blue-600" />
                  Crew Supply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Specialized crew supply for Chemical and R/PLPG Tanker vessels with well-trained and highly qualified seafarers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Crew Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Comprehensive crew management system with continuous monitoring and support throughout the service period.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                  Ship Agency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Professional ship agency services ensuring smooth operations and compliance with all regulations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management System */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Management System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-blue-600" />
                  Physical Examination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>MOU with government-certified medical institutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Additional tests including Treadmill, BMI, and smoking tests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Dental examinations before embarkation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  Seafarer Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>MOU with Maritime University of Indonesia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Stable supply of trainee navigators and engineers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Cadet training programs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Continuous monitoring through Crew Management Program</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Certificate expiration tracking and renewal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Zero findings during inspections</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-6 h-6 text-blue-600" />
                  Regular Ship Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Regular visits by crew management team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Direct feedback collection from seafarers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Specialized foreign food provider collaboration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Environment */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Educational Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Training Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Own training facilities with offline education programs led by expert instructors (Korean and local).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Skill Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  In-house tests for COOK and 1OLR positions to verify Korean cuisine cooking and welding skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  Korean Culture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Korean culture education and long-term familiarization training to improve retention rates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                  Systematic Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  ISM/ISPS/Chemical Tanker basic training and Oil & Chemical Tanker specialized education.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  On-the-Job Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Quarterly visits by instructors for regular job training of pool crews.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Examination Training
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Training for Oil Major Inspections and working hour record book preparation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* INK Program */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">INK PROGRAM - Crew Management System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              Combining big data analysis technology and artificial intelligence technology to implement a highly mature crew information management system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Total Crew List</h4>
                <p className="text-gray-700 text-sm">
                  Management of all data information of sailors including embarkation, waiting, new, and rehire status.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Onboard Crew List</h4>
                <p className="text-gray-700 text-sm">
                  Complete data input and management of crew on board with certificate and contract expiration tracking.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Waiting Crew List</h4>
                <p className="text-gray-700 text-sm">
                  Quick selection capability with comprehensive standby crew status management.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Pool Crew List</h4>
                <p className="text-gray-700 text-sm">
                  Formation of pool crew by managing records of retired seafarers for rehiring opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}