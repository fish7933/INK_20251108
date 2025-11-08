import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Printer, Building2, Award, Globe } from 'lucide-react';

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Our Global Branches
          </h1>
          <p className="text-xl text-gray-600">
            Global Presence with Local Expertise
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <img 
            src="/assets/branches-banner.png" 
            alt="INK Global Branches" 
            className="w-full h-[400px] object-contain md:object-cover bg-slate-100"
          />
        </div>

        {/* Headquarters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-8 h-8 text-blue-600" />
              Korea Headquarters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">INK Co., Ltd.</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">Address</p>
                      <p className="text-gray-600 text-sm mt-1">
                        President B/D 201, 13, Jungang-daero 180beon-gil,<br />
                        Dong-gu, Busan, Korea
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">Phone</p>
                      <a href="tel:+82-51-714-1877" className="text-blue-600 hover:underline">
                        +82-51-714-1877
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Printer className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">Fax</p>
                      <p className="text-gray-700">+82-51-714-1878</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">Email</p>
                      <a href="mailto:ink@inkmarine.co.kr" className="text-blue-600 hover:underline">
                        ink@inkmarine.co.kr
                      </a>
                      <br />
                      <a href="mailto:hr1@inkmarine.co.kr" className="text-blue-600 hover:underline">
                        hr1@inkmarine.co.kr
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Certifications
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Business License</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Shipping Business Registration Certificate - Ship Management Business</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indonesia Branch */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-8 h-8 text-blue-600" />
              Indonesia Branch Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Photo */}
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/assets/indonesia-team.jpg" 
                  alt="PT. INKOR DUNIA SAMUDERA Team" 
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Branch Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">PT. INKOR DUNIA SAMUDERA</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Address</p>
                        <p className="text-gray-700">
                          Jl. Arteri Kelapa Gading, No.16, 02/04,<br />
                          Kelapa Gading Barat, Jakarta Utara, 14240,<br />
                          Indonesia
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Phone</p>
                        <a href="tel:+62-21-2957-4546" className="text-blue-600 hover:underline">
                          +62-21-2957-4546
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Printer className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Fax</p>
                        <p className="text-gray-700">+62-21-2957-4548</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Email</p>
                        <a href="mailto:inkor@inkormarine.com" className="text-blue-600 hover:underline">
                          inkor@inkormarine.com
                        </a>
                        <br />
                        <a href="mailto:crewinginkor@gmail.com" className="text-blue-600 hover:underline">
                          crewinginkor@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      Certifications
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Indonesia Governor SRPS Certificate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Indonesia Branch RO MLC Certificate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>ISO 9001:2015 Certificate</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Myanmar Branch */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-8 h-8 text-blue-600" />
              Myanmar Branch Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Photo */}
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/assets/myanmar-team.jpg" 
                  alt="INK MARINE Co., Ltd. Team" 
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Branch Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">INK MARINE Co., Ltd.</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Address</p>
                        <p className="text-gray-700">
                          No.182-194, 2nd Floor, Room(D E F), Hnin Si Housing,<br />
                          Botahtaung Pagoda Road (Middle Block),<br />
                          Pazundaung Township, Yangon, Myanmar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Phone</p>
                        <div className="space-y-1">
                          <a href="tel:+951299181" className="text-blue-600 hover:underline block">
                            +951 299 181
                          </a>
                          <a href="tel:+95943040201" className="text-blue-600 hover:underline block">
                            +959 430 40 201
                          </a>
                          <a href="tel:+95943183687" className="text-blue-600 hover:underline block">
                            +959 431 836 87
                          </a>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Mobile: <a href="tel:+959259255539" className="text-blue-600 hover:underline">+959 259 255 539</a></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Email</p>
                        <div className="space-y-1">
                          <a href="mailto:crewing@inkmarinemyanmar.com" className="text-blue-600 hover:underline block text-sm">
                            crewing@inkmarinemyanmar.com
                          </a>
                          <a href="mailto:operation.inkmarine@gmail.com" className="text-blue-600 hover:underline block text-sm">
                            operation.inkmarine@gmail.com
                          </a>
                          <a href="mailto:crewinginkmarine@gmail.com" className="text-blue-600 hover:underline block text-sm">
                            crewinginkmarine@gmail.com
                          </a>
                          <a href="mailto:info@inkmarinemyanmar.com" className="text-blue-600 hover:underline block text-sm">
                            info@inkmarinemyanmar.com
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">Website</p>
                        <a href="http://www.inkmarinemyanmar.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          www.inkmarinemyanmar.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      Certifications
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Myanmar Governor SRPS Certificate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>ISO 9001:2015 Certificate</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 25 Hours Hotel Service */}
        <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">25 HOURS HOTEL SERVICE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Accommodation</h4>
                <p className="text-blue-100">118 separate crew rooms</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">24/7 Service</h4>
                <p className="text-blue-100">24-hour front desk management (security and escape prevention)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Document Service</h4>
                <p className="text-blue-100">Pick-up and delivery service</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Support Service</h4>
                <p className="text-blue-100">Comprehensive handling support</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Rest Area</h4>
                <p className="text-blue-100">Crew rest area with snacks provided</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}