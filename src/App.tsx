import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MenuHomePage from "./pages/MenuHomePage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import StaffLogin from "./pages/StaffLogin";
import StaffRoleSelection from "./pages/StaffRoleSelection";
import CashierDashboard from "./pages/CashierDashboard";
import BaristaDashboard from "./pages/BaristaDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UpdateMenu from "./pages/UpdateMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MenuHomePage />} />
            <Route path="/category/:slug" element={<CategoryDetailPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff" element={<ProtectedRoute><StaffRoleSelection /></ProtectedRoute>} />
            <Route path="/cashier" element={<ProtectedRoute><CashierDashboard /></ProtectedRoute>} />
            <Route path="/barista" element={<ProtectedRoute><BaristaDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/update-menu" element={<ProtectedRoute><UpdateMenu /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
