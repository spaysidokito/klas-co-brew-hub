import { useNavigate } from 'react-router-dom';
import { Coffee, UserCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffRoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Coffee className="h-14 w-14 md:h-16 md:w-16 text-amber-800" />
            <h1 className="text-5xl md:text-6xl font-bold text-amber-900">KlaséCo</h1>
          </div>
          <p className="text-2xl md:text-3xl text-amber-700 font-light">Select Your Role</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <button
            className="group bg-white rounded-3xl p-8 md:p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-amber-600"
            onClick={() => navigate('/cashier')}
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-6 group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-md">
              <UserCircle className="h-12 w-12 md:h-14 md:w-14 text-amber-800" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-amber-900 group-hover:text-amber-800 transition-colors">Cashier</h2>
            <p className="text-amber-700 text-base md:text-lg">Manage incoming orders</p>
          </button>

          <button
            className="group bg-white rounded-3xl p-8 md:p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-amber-600"
            onClick={() => navigate('/barista')}
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-6 group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-md">
              <Coffee className="h-12 w-12 md:h-14 md:w-14 text-amber-800" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-amber-900 group-hover:text-amber-800 transition-colors">Barista</h2>
            <p className="text-amber-700 text-base md:text-lg">Prepare orders</p>
          </button>

          <button
            className="group bg-white rounded-3xl p-8 md:p-10 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-amber-600 sm:col-span-2 lg:col-span-1"
            onClick={() => navigate('/admin')}
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-6 group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-md">
              <ShieldCheck className="h-12 w-12 md:h-14 md:w-14 text-amber-800" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-amber-900 group-hover:text-amber-800 transition-colors">Admin</h2>
            <p className="text-amber-700 text-base md:text-lg">Manage system</p>
          </button>
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-amber-800 hover:text-amber-900 hover:bg-amber-100 text-lg px-8 py-6 rounded-xl"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
