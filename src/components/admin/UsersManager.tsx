"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const UsersManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    telegram_username: "",
    role: "user",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
    if (profilesError) {
      toast.error("Фойдаланувчиларни юклашда хатолик");
      return;
    }

    const { data: rolesData } = await supabase.from("user_roles").select("*");

    const usersWithRoles = (profilesData || []).map((profile) => {
      const userRole = rolesData?.find((role) => role.user_id === profile.id);
      return {
        ...profile,
        user_roles: userRole ? [{ role: userRole.role }] : [],
      };
    });

    setUsers(usersWithRoles);
  };

  const handleEdit = (user: any) => {
    setEditing(user);
    setFormData({
      full_name: user.full_name || "",
      phone: user.phone || "",
      telegram_username: user.telegram_username || "",
      role: user.user_roles?.[0]?.role || "user",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        telegram_username: formData.telegram_username,
      })
      .eq("id", editing.id);

    if (profileError) {
      toast.error("Маълумотларни янгилашда хатолик");
      return;
    }

    const oldRole: "admin" | "user" =
      (editing.user_roles?.[0]?.role as "admin" | "user") || "user";
    if (oldRole !== formData.role) {
      if (formData.role === "admin") {
        await supabase.from("user_roles").upsert(
          [
            {
              user_id: editing.id,
              role: "admin" as const,
            },
          ],
          { onConflict: "user_id,role" }
        );
      } else {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editing.id)
          .eq("role", "admin");
      }
    }

    toast.success("Фойдаланувчи янгиланди");
    setDialogOpen(false);
    resetForm();
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ростдан ҳам ўчирмоқчимисиз?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error("Ўчиришда хатолик: " + error.message);
    else {
      toast.success("Фойдаланувчи ўчирилди");
      loadUsers();
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      full_name: "",
      phone: "",
      telegram_username: "",
      role: "user",
    });
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
        <CardHeader className="border-b border-[#2a2a2a]">
          <CardTitle className="text-[#d4af37] text-2xl font-bold">
            👥 Фойдаланувчилар рўйхати
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#111] border-[#2a2a2a]">
                <TableHead className="text-[#d4af37]">Исм</TableHead>
                <TableHead className="text-[#d4af37]">Телефон</TableHead>
                <TableHead className="text-[#d4af37]">Telegram</TableHead>
                <TableHead className="text-[#d4af37]">Роль</TableHead>
                <TableHead className="text-[#d4af37]">Яратилган</TableHead>
                <TableHead className="text-[#d4af37]">Амаллар</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    className="border-[#2a2a2a] hover:bg-[#222] transition-all text-[#d4af37]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TableCell>{user.full_name || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      {user.telegram_username ? (
                        <span className="text-[#bfa75e]/80">
                          @{user.telegram_username}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          user.user_roles?.[0]?.role === "admin"
                            ? "text-[#d4af37] font-semibold"
                            : "text-[#888]"
                        }
                      >
                        {user.user_roles?.[0]?.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("uz-UZ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={dialogOpen && editing?.id === user.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setDialogOpen(false);
                              resetForm();
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#2a2a2a]"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#d4af37]">
                            <DialogHeader>
                              <DialogTitle>Фойдаланувчини таҳрирлаш</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={handleSubmit}
                              className="space-y-4 mt-4"
                            >
                              <div>
                                <Label>Исм</Label>
                                <Input
                                  className="bg-[#111] text-[#d4af37] border-[#2a2a2a]"
                                  value={formData.full_name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      full_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Телефон</Label>
                                <Input
                                  className="bg-[#111] text-[#d4af37] border-[#2a2a2a]"
                                  value={formData.phone}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Telegram username</Label>
                                <Input
                                  className="bg-[#111] text-[#d4af37] border-[#2a2a2a]"
                                  value={formData.telegram_username}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      telegram_username: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Роль</Label>
                                <Select
                                  value={formData.role}
                                  onValueChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      role: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="bg-[#111] text-[#d4af37] border-[#2a2a2a]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#d4af37]">
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex gap-3 justify-end pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setDialogOpen(false);
                                    resetForm();
                                  }}
                                  className="border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#222]"
                                >
                                  Бекор қилиш
                                </Button>
                                <Button
                                  type="submit"
                                  className="bg-[#d4af37] text-black hover:bg-[#bfa75e]"
                                >
                                  Сақлаш
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user.id)}
                          className="bg-[#2a2a2a] text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#333]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-[#d4af37]/60 py-6"
                  >
                    Ҳозирча фойдаланувчилар йўқ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};
