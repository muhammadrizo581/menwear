import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0c] text-white">
      {/* HEADER */}
{/* HEADER */}
<header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0c0c0c]/95 backdrop-blur">
  <div className="container flex h-16 items-center justify-between px-4 md:px-8">
    
    {/* MOBILE LOGO (faqat mobilda chiqadi) */}
    <Link
      to="/"
      className="flex items-center space-x-2 md:hidden"
    >
      <img
        src="/logo.jpeg"
        alt="Menwear Logo"
        className="h-8 w-auto rounded-full"
      />
      <span className="hidden md:block text-[#d4af37] font-bold">MENWEAR.UZ</span>
    </Link>

    {/* DESKTOP LOGO (faqat md va undan katta ekranlarda chiqadi) */}
    <div className="hidden md:flex items-center space-x-2">
      <img
        src="/logo.jpeg"
        alt="Menwear Logo"
        className="h-8 w-auto rounded-full"
      />
      <span className="hidden md:inline-block text-[#d4af37] font-bold">
        MENWEAR.UZ
      </span>
    </div>

    {/* NAVIGATION (desktop uchun) */}
    <nav className="hidden md:flex items-center space-x-8 mx-auto">
      {[
        { name: "Категориялар", path: "/categories" },
        { name: "Брендлар", path: "/brands" },
        { name: "Биз ҳақимизда", path: "/about" },
        { name: "Алоқа", path: "/contact" },
      ].map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="text-sm text-gray-300 hover:text-[#d4af37] transition-colors duration-200"
        >
          {item.name}
        </Link>
      ))}
    </nav>

    {/* ACTION BUTTONS */}
    <div className="flex items-center space-x-4">
      {/* CART */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/cart")}
        className="relative text-gray-300 hover:text-[#d4af37] hover:bg-transparent"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#d4af37] text-black text-xs flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>

      {/* AUTH */}
      {user ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="text-gray-300 hover:text-[#d4af37] hover:bg-transparent"
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-300 hover:text-[#d4af37] hover:bg-transparent"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <Button
          onClick={() => navigate("/auth")}
          className="bg-[#d4af37] text-black hover:bg-[#b8972f]"
        >
          Кириш
        </Button>
      )}

      {/* MOBILE MENU ICON */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-gray-300 hover:text-[#d4af37]"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  </div>
</header>


      {/* MAIN CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-[#2a2a2a] bg-[#0c0c0c]">
        <div className="container py-10 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/logo.jpeg"
                  alt="Menwear Logo"
                  className="h-8 w-auto rounded-full"
                />
                <span className="text-xl font-semibold text-[#d4af37]">
                  MENWEAR.UZ
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Хитойдан сифатли эркаклар кийимларини импорт қилувчи онлайн дўкон. 
                Сиз учун премиум сифатдаги кийимлар.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-[#d4af37]">
                Саҳифалар
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-[#d4af37]">
                    Бош саҳифа
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className="text-gray-400 hover:text-[#d4af37]"
                  >
                    Категориялар
                  </Link>
                </li>
                <li>
                  <Link
                    to="/brands"
                    className="text-gray-400 hover:text-[#d4af37]"
                  >
                    Брендлар
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-[#d4af37]">
                Алоқа
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📞 +998 97 118 1000</li>
                <li>📱 Telegram: @Abdulvadud_Believe</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-[#2a2a2a] text-center text-sm text-gray-500">
            © 2025 <span className="text-[#d4af37] font-semibold">Menwear.uz</span>. Барча ҳуқуқлар ҳимояланган.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
