import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TeamSidebar from "@/components/teamchat/TeamSidebar";
import ChatArea from "@/components/teamchat/ChatArea";
import OrgChart from "@/components/teamchat/OrgChart";

// Team channels are scoped to the account that owns them: "<name>|||<owner email>"
const teamChannelId = (name, ownerEmail) => `${name}|||${ownerEmail}`;

export default function TeamChat() {
  const [user, setUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]); // members this account invited (+ self)
  const [teamOwners, setTeamOwners] = useState([]);   // accounts that invited this user
  const [activeChannel, setActiveChannel] = useState(null);
  const [view, setView] = useState("chat"); // "chat" | "team"

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.TeamMember.list("-created_date", 200)
        .then(members => {
          // RLS only returns members this account invited, plus records naming this account
          const mine = [];
          const inTeams = [];
          members.forEach(m => {
            if (m.email === u.email) inTeams.push(m.invited_by || m.created_by);
            else if (m.created_by_id === u.id) mine.push(m);
          });
          setTeamMembers([
            ...mine,
            { email: u.email, name: u.full_name, role_label: "", id: "self" },
          ]);
          setTeamOwners([...new Set(inTeams)].filter(e => e && e !== u.email));
          setActiveChannel(teamChannelId("general", u.email));
        })
        .catch(() => {
          setTeamMembers([{ email: u.email, name: u.full_name, role_label: "", id: "self" }]);
          setActiveChannel(teamChannelId("general", u.email));
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

  // Who is allowed to read a message posted in the active channel
  const channelParticipants = (() => {
    if (!activeChannel) return [];
    const parts = activeChannel.split("|||");
    if (parts[0] === "dm") return parts.slice(1).filter(Boolean);
    const ownerEmail = parts[1];
    if (ownerEmail === user?.email) return teamMembers.map(m => m.email).filter(Boolean);
    return [ownerEmail, user?.email].filter(Boolean);
  })();

  // Everyone this account can chat with, for name/role lookup
  const contacts = [
    ...teamMembers,
    ...teamOwners.map(e => ({ email: e, name: e.split("@")[0], id: `owner-${e}` })),
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <TeamSidebar
        user={user}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        teamMembers={teamMembers}
        teamOwners={teamOwners}
        view={view}
        setView={setView}
      />

      {view === "chat" ? (
        <ChatArea
          user={user}
          activeChannel={activeChannel}
          teamMembers={contacts}
          participants={channelParticipants}
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