"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { getMembers, removeMember, updateMemberRole, OrganizationMember } from "@/services/teamService";
import { inviteUser } from "@/services/invitationService";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, MoreHorizontal, ShieldAlert, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Role } from "@/types/rbac";

const TeamPage = () => {
  const { activeOrganization, currentRole } = useTenant();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  useEffect(() => {
    if (activeOrganization && currentRole) {
      loadMembers();
    }
  }, [activeOrganization, currentRole]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembers(activeOrganization!.id, currentRole!);
      setMembers(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load team members", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !activeOrganization || !currentRole) return;

    try {
      setIsInviting(true);
      await inviteUser(activeOrganization.id, inviteEmail, Role.STAFF, currentRole);
      toast({ title: "Invitation Sent", description: `An invitation has been sent to ${inviteEmail}.` });
      setInviteEmail("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send invitation", variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: Role) => {
    if (!activeOrganization || !currentRole) return;
    try {
      // Optimistic update
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      await updateMemberRole(memberId, newRole, activeOrganization.id, currentRole);
      toast({ title: "Role Updated", description: "The member's role has been successfully updated." });
    } catch (error: any) {
      // Revert optimistic update
      await loadMembers();
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !activeOrganization || !currentRole) return;
    try {
      await removeMember(memberToRemove.id, activeOrganization.id, currentRole);
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      toast({ title: "Member Removed", description: "The member has been removed from the organization." });
      setMemberToRemove(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to remove member", variant: "destructive" });
    }
  };

  const columns: ColumnDef<OrganizationMember>[] = [
    {
      header: "User",
      cell: (member) => (
        <div>
          <div className="font-medium text-slate-200">{member.profiles[0]?.full_name || 'Unknown User'}</div>
          <div className="text-sm text-slate-500">{member.profiles[0]?.email}</div>
        </div>
      )
    },
    {
      header: "Role",
      cell: (member) => (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
        </span>
      )
    },
    {
      header: "Joined",
      cell: (member) => <span className="text-slate-400">{new Date(member.joined_at).toLocaleDateString()}</span>
    },
    {
      header: "Actions",
      cell: (member) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem onClick={() => handleRoleChange(member.id, Role.ADMIN)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(member.id, Role.STAFF)} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
              Make Staff
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem 
              onClick={() => { /* Placeholder for future feature */ toast({ title: "Coming soon", description: "Suspension will be available in a future update."}) }}
              className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-white"
            >
              <ShieldAlert className="mr-2 h-4 w-4 text-orange-400" />
              <span>Suspend Access</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setMemberToRemove(member)} 
              className="cursor-pointer text-red-500 hover:bg-red-900/20 hover:text-red-400 focus:bg-red-900/20 focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Remove from Org</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <SectionHeader 
        title="Team Members" 
        description="Manage who has access to your organization."
      />

      {/* Invite Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Invite New Member</h3>
        <form onSubmit={handleInvite} className="flex gap-4 max-w-md">
          <Input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white"
            required
          />
          <Button type="submit" disabled={isInviting} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            {isInviting ? "Sending..." : "Invite"}
          </Button>
        </form>
      </div>

      {/* Team Table */}
      <DataTable 
        columns={columns} 
        data={members} 
        loading={loading}
        searchable
        searchKey={(member) => member.profiles[0]?.full_name || member.profiles[0]?.email || ''}
        filterOptions={{
          label: "Role",
          key: "role",
          options: [
            { label: "Owner", value: Role.OWNER },
            { label: "Admin", value: Role.ADMIN },
            { label: "Manager", value: Role.MANAGER },
            { label: "Staff", value: Role.STAFF },
            { label: "Student", value: Role.STUDENT },
          ],
          filterFn: (member, value) => member.role === value
        }}
        emptyMessage="No team members found."
      />

      <ConfirmationDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToRemove?.profiles[0]?.email} from this organization? They will lose all access.`}
        confirmText="Yes, remove member"
      />
    </div>
  );
};

export default TeamPage;
