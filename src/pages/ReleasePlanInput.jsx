import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// The old "upload & analyze" flow has been replaced by the Song Library vault.
export default function ReleasePlanInput() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/history", { replace: true }); }, [navigate]);
  return null;
}