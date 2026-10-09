import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets the scroll position on every route change so new pages land at the top
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}