import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TeamSidebar from "@/components/teamchat/TeamSidebar";
import ChatArea from "@/components/teamchat/ChatArea";
import OrgChart from "@/components/teamchat/OrgChart";

export default function TeamChat() {
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activeChannel, setActiveChannel] = useState("general");
  const [view, setView] = useState("chat"); // "chat" | "team"

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Load all team members (created by anyone in the workspace)
      base44.entities.TeamMember.list("-created_date", 100)
        .then(members => {
          // Deduplicate by email; include current user too
          const byEmail = {};
          members.forEach(m => { byEmail[m.email] = m; });
          // Ensure current user appears in team view
          if (u && !byEmail[u.email]) {
            byEmail[u.email] = { email: u.email, name: u.full_name, role_label: "", id: "self" };
          }
          setTeamMembers(Object.values(byEmail));
        })
        .catch(() => {
          if (u) setTeamMembers([{ email: u.email, name: u.full_name, role_label: "", id: "self" }]);
        });
    });
  }, []);

  const handleUpdateRole = (id, role) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, role_label: role } : m));
  };

  const handleStartDM = (email) => {
    const sorted = [user?.email, email].sort();
    setActiveChannel(`dm|||${sorted[0]}|||${sorted[1]}`);
    setView("chat");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <TeamSidebar
        user={user}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        teamMembers={teamMembers}
        view={view}
        setView={setView}
      />

      {view === "chat" ? (
        <ChatArea
          user={user}
          activeChannel={activeChannel}
          teamMembers={teamMembers}
        />
      ) : (
        <OrgChart
          teamMembers={teamMembers}
          currentUserEmail={user?.email}
          onStartDM={handleStartDM}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
}