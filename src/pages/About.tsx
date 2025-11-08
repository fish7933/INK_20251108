import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            About INK
          </h1>
          <p className="text-xl text-gray-600">
            Leading Maritime Crew Management Solutions
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <img 
            src="/assets/about-handshake.png" 
            alt="INK Partnership" 
            className="w-full h-[400px] object-contain md:object-cover bg-slate-100"
          />
        </div>

        {/* Company Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Company Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              INK CO., LTD. is a professional maritime crew management company established on April 1, 2013. 
              We specialize in providing comprehensive crew management services for LPG carriers and various 
              types of vessels, ensuring the highest standards of safety, efficiency, and professionalism.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With our headquarters in Busan, Korea, and branch offices in Indonesia and Myanmar, we have 
              built a strong global presence in the maritime industry. Our commitment to excellence and 
              continuous improvement has made us a trusted partner for ship owners and operators worldwide.
            </p>
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-800 mb-1">62</p>
              <p className="text-gray-600">Employees</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-800 mb-1">62</p>
              <p className="text-gray-600">Vessels Managed</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-800 mb-1">561</p>
              <p className="text-gray-600">Seafarers Onboard</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-800 mb-1">2013</p>
              <p className="text-gray-600">Established</p>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To provide exceptional maritime crew management services that ensure safe, efficient, 
                and reliable vessel operations while fostering the professional development of seafarers 
                and maintaining the highest industry standards.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To be the leading maritime crew management company in Asia, recognized for our 
                commitment to excellence, innovation, and sustainable practices in the global 
                shipping industry.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CEO Message */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">CEO Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img 
                  src="/assets/ceo.jpg" 
                  alt="Haley Lee, CEO of INK CO., LTD." 
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                <p className="text-center text-gray-800 font-semibold mt-3">
                  Haley Lee
                </p>
                <p className="text-center text-gray-600 text-sm">
                  CEO, INK CO., LTD.
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to INK CO., LTD. Since our establishment in 2013, we have been dedicated 
                  to providing world-class maritime crew management services. Our success is built 
                  on the foundation of trust, professionalism, and unwavering commitment to safety.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We understand that our seafarers are our greatest asset. Through continuous training, 
                  development programs, and comprehensive support systems, we ensure that every crew 
                  member is equipped with the skills and knowledge necessary to excel in their roles.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  As we look to the future, we remain committed to innovation, sustainability, and 
                  maintaining the highest standards of service excellence. Thank you for your trust 
                  in INK CO., LTD.
                </p>
                <p className="text-gray-700 font-semibold mt-4">
                  - Haley Lee, CEO
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Company History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    April 2013
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Company Establishment</h3>
                  <p className="text-gray-700">
                    INK CO., LTD. was founded in Busan, Korea, marking the beginning of our journey 
                    in maritime crew management.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    2015
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Indonesia Expansion</h3>
                  <p className="text-gray-700">
                    Established PT. INKOR DUNIA SAMUDERA in Jakarta, Indonesia, expanding our 
                    regional presence and service capabilities.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    2017
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Myanmar Branch Opening</h3>
                  <p className="text-gray-700">
                    Opened INK MARINE Co., Ltd. in Yangon, Myanmar, further strengthening our 
                    position in Southeast Asia.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    2020
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">ISO Certification</h3>
                  <p className="text-gray-700">
                    Achieved ISO 9001:2015 certification, demonstrating our commitment to quality 
                    management systems and continuous improvement.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-32">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                    2023
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Milestone Achievement</h3>
                  <p className="text-gray-700">
                    Celebrated 10 years of excellence with 62 vessels under management and 561 
                    seafarers onboard, solidifying our position as a leading crew management company.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}