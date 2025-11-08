import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Printer, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600">
            Get in Touch with Our Team
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <img 
            src="/assets/contact.png" 
            alt="Contact INK" 
            className="w-full h-[400px] object-contain md:object-cover bg-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Korea Headquarters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">INK CO., LTD.</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-1">Address</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Dong-gu, Busan, Korea
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-1">Phone</p>
                    <a 
                      href="tel:+82-51-714-1877" 
                      className="text-blue-600 hover:underline text-lg"
                    >
                      +82-51-714-1877
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Printer className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-1">Fax</p>
                    <p className="text-gray-700 text-lg">+82-51-714-1878</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-1">Email</p>
                    <a 
                      href="mailto:ink@inkmarine.co.kr" 
                      className="text-blue-600 hover:underline block"
                    >
                      ink@inkmarine.co.kr
                    </a>
                    <a 
                      href="mailto:hr1@inkmarine.co.kr" 
                      className="text-blue-600 hover:underline block"
                    >
                      hr1@inkmarine.co.kr
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours & Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-slate-800">Monday - Friday</span>
                    <span className="text-gray-700">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-slate-800">Saturday</span>
                    <span className="text-gray-700">By Appointment</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-slate-800">Sunday</span>
                    <span className="text-gray-700">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-slate-800">Established</span>
                    <span className="text-gray-700">April 01, 2013</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-slate-800">Employees</span>
                    <span className="text-gray-700">62 people</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-slate-800">Vessels Managed</span>
                    <span className="text-gray-700">62 vessels</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-slate-800">Crew Onboard</span>
                    <span className="text-gray-700">561 seafarers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Partner?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-4">
                  Contact us today to learn more about our professional seafarer management services and how we can help your business succeed.
                </p>
                <p className="text-blue-200 text-sm">
                  We look forward to hearing from you and building a successful partnership together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}