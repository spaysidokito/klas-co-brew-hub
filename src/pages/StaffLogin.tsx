import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Coffee, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Credential check
    const validUsername = 'KlaseCo';
    const validPassword = 'One2twenty1';

    setTimeout(() => {
      if (username === validUsername && password === validPassword) {
        // Store authentication in sessionStorage (cleared when browser closes)
        sessionStorage.setItem('staffAuth', 'true');
        sessionStorage.setItem('staffRole', 'staff');
        toast.success('Welcome to KlaséCo Staff Portal!');
        navigate('/staff');
      } else {
        toast.error('Invalid credentials');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/klaseco-logo.png" 
              alt="KlaséCo Logo" 
              className="h-16 w-16 object-contain"
            />
            <img 
              src="/bsit-logo.png" 
              alt="BSIT Logo" 
              className="h-16 w-16 object-contain"
            />
            <img 
              src="/stacl-logo.png" 
              alt="St. Anne College of Lucena Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">KlaséCo Staff</h1>
          <p className="text-gray-600 text-center">Enter your credentials to access the staff portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-amber-900 font-semibold">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-amber-900 font-semibold">
              Password
            </Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-800 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-800 hover:bg-amber-900 text-white font-semibold py-6"
            disabled={loading}
          >
            <Lock className="h-5 w-5 mr-2" />
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Button
          variant="ghost"
          className="w-full mt-6 text-amber-800"
          onClick={() => navigate('/')}
        >
          Back to Menu
        </Button>
      </Card>
    </div>
  );
}
