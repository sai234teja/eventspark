"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { getMembers, removeMember, updateMemberRole, OrganizationMember } from "@/services/teamService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/types/rbac";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Trash2 } from "lucide-react";

const TeamPage = () => {
  const { activeOrganization, currentRole } = useTenant();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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

  const handleRoleChange = async (memberId: number, newRole: Role) => {
    try {
      // Optimistic UI update
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      
      await updateMemberRole(memberId, newRole, activeOrganization!.id, currentRole!);
      toast({ title: "Success", description: "Role updated successfully." });
    } catch (error: any) {
      // Revert on error by reloading
      loadMembers();
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      // Optimistic UI
      setMembers(members.filter(m => m.id !== memberId));
      
      await removeMember(memberId, activeOrganization!.id, currentRole!);
      toast({ title: "Success", description: "Member removed." });
    } catch (error: any) {
      loadMembers();
      toast({ title: "Error", description: error.message || "Failed to remove member", variant: "destructive" });
    }
  };

  const filteredMembers = members.filter(m => 
    m.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Team Management</h1>
          <p className="text-slate-400 mt-2">Manage members and their access levels.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">Invite User</Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-white">Active Members</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center p-8 text-slate-400">No members found.</div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <p className="font-medium text-white">{member.profiles?.full_name || 'Unknown User'}</p>
                    <p className="text-sm text-slate-400">{member.profiles?.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select 
                      value={member.role} 
                      onValueChange={(val) => handleRoleChange(member.id, val as Role)}
                    >
                      <SelectTrigger className="w-32 bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Role.OWNER}>Owner</SelectItem>
                        <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                        <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                        <SelectItem value={Role.STAFF}>Staff</SelectItem>
                        <SelectItem value={Role.STUDENT}>Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPage;
