import { Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { Plane as Plant } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="w-screen bg-background flex flex-col ">
      <header className="border-b fixed top-0 left-0 right-0 border-b ">
        <div className="m-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 ">
            {/* <Plant className="h-6 w-6 text-green-600" /> */}
            <span className="font-semibold text-xl"><span className='text-green-500'>Agri</span> <span className='text-orange-500'>NextGen</span></span>
          </div>
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Outlet />
          </CardContent>
        </Card>
      </main>
      
      <footer className="border-t py-4 text-sm text-muted-foreground fixed bottom-0 left-0 right-0 border-b text-center">
        <div className="">
          <p>© 2025 Nitin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;