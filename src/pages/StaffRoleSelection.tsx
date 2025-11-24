import { useNavigate } from 'react-router-dom';
import { Coffee, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function StaffRoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-semibold">KlaséCo</h1>
          </div>
          <p className="text-xl text-muted-foreground">Select Your Role</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="p-8 text-center hover:border-primary cursor-pointer transition-all group"
            onClick={() => navigate('/cashier')}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Cashier</h2>
            <p className="text-muted-foreground">Manage incoming orders</p>
          </Card>

          <Card
            className="p-8 text-center hover:border-primary cursor-pointer transition-all group"
            onClick={() => navigate('/barista')}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Coffee className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Barista</h2>
            <p className="text-muted-foreground">Prepare orders</p>
          </Card>

          <Card
            className="p-8 text-center hover:border-primary cursor-pointer transition-all group"
            onClick={() => navigate('/admin')}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Admin</h2>
            <p className="text-muted-foreground">Manage system</p>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
