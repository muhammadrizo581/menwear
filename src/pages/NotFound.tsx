import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0c] text-white px-6">
      {/* LOGO */}
      <img
        src="/logo.jpeg"
        alt="Menwear Logo"
        className="h-24 w-auto mb-8 rounded-lg shadow-[0_0_25px_rgba(212,175,55,0.3)]"
      />

      {/* TITLE */}
      <h1 className="text-7xl font-extrabold text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
        404
      </h1>
      <p className="mt-4 text-gray-400 text-xl text-center">
        Ушбу саҳифа топилмади ёки ўчирилган бўлиши мумкин.
      </p>

      {/* ACTION BUTTON */}
      <Link to="/" className="mt-10">
        <Button className="bg-[#d4af37] hover:bg-[#b8952e] text-black font-semibold text-lg px-8 py-6 rounded-2xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]">
          🏠 Бош саҳифага қайтиш
        </Button>
      </Link>

      {/* SMALL HINT */}
      <p className="mt-6 text-sm text-gray-500">
        Ёки навигация меню орқали бошқа саҳифани танланг.
      </p>
    </div>
  );
};

export default NotFound;
