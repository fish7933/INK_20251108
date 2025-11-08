import { Mail, Phone, Printer, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src="/logo.png" 
              alt="INK CO., LTD." 
              className="h-16 w-auto object-contain mb-2"
            />
            <p className="text-gray-400">Professional Seafarer Management</p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href="tel:+82-51-714-1877" className="hover:text-blue-400">
                  +82-51-714-1877
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span>+82-51-714-1878</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:ink@inkmarine.co.kr" className="hover:text-blue-400">
                  ink@inkmarine.co.kr
                </a>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Headquarters</h4>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-400 mt-1" />
              <div>
                <p className="text-gray-400 mt-1">
                  201, President B/D, 13, Jungang-daero 180beon-gil,
                  Dong-gu, Busan, Korea
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} INK CO., LTD. All rights reserved.</p>
          <Link 
            to="/careers/admin" 
            className="flex items-center gap-2 hover:text-blue-400 transition-colors mt-4 sm:mt-0"
          >
            <Shield className="w-4 h-4" />
            Admin Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}