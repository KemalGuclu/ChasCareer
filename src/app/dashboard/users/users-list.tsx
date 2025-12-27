"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";

type CareerGroup = {
  id: string;
  name: string;
  education: { name: string };
};

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  careerGroup: CareerGroup | null;
};

type Props = {
  users: User[];
  careerGroups: CareerGroup[];
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  TEACHER: "Utbildare",
  STUDENT: "Studerande",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  TEACHER: "bg-blue-100 text-blue-800",
  STUDENT: "bg-green-100 text-green-800",
};

export function UsersList({ users: initialUsers, careerGroups }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "STUDENT",
    careerGroupId: "",
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const newUser = await res.json();
      setUsers([...users, newUser]);
      setIsAddDialogOpen(false);
      setFormData({ email: "", name: "", role: "STUDENT", careerGroupId: "" });
      router.refresh();
    }
    setLoading(false);
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    setLoading(true);

    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        role: formData.role,
        careerGroupId: formData.careerGroupId,
      }),
    });

    if (res.ok) {
      const updatedUser = await res.json();
      setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
      setIsEditDialogOpen(false);
      setEditingUser(null);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers(users.filter((u) => u.id !== userId));
      router.refresh();
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name || "",
      role: user.role,
      careerGroupId: user.careerGroup?.id || "",
    });
    setIsEditDialogOpen(true);
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    teachers: users.filter((u) => u.role === "TEACHER").length,
    students: users.filter((u) => u.role === "STUDENT").length,
  };

  return (
    <div className="space-y-6">
      {/* Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utbildare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Studerande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter och sök */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök användare..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alla roller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla roller</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Utbildare</SelectItem>
                  <SelectItem value="STUDENT">Studerande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Lägg till användare
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lägg till användare</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@chasacademy.se"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Namn</Label>
                    <Input
                      id="name"
                      placeholder="Förnamn Efternamn"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Roll</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Studerande</SelectItem>
                        <SelectItem value="TEACHER">Utbildare</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.role === "STUDENT" && (
                    <div className="space-y-2">
                      <Label htmlFor="group">Career-grupp</Label>
                      <Select
                        value={formData.careerGroupId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, careerGroupId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj grupp (valfritt)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Ingen grupp</SelectItem>
                          {careerGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.education.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Avbryt
                  </Button>
                  <Button onClick={handleAddUser} disabled={loading}>
                    {loading ? "Sparar..." : "Lägg till"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabell */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Career-grupp</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "-"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.careerGroup ? (
                        <span>
                          {user.careerGroup.name} (
                          {user.careerGroup.education.name})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Ta bort användare?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Är du säker på att du vill ta bort {user.name}?
                                Detta kan inte ångras.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Ta bort
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera användare</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" value={formData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Namn</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Roll</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Studerande</SelectItem>
                  <SelectItem value="TEACHER">Utbildare</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role === "STUDENT" && (
              <div className="space-y-2">
                <Label htmlFor="edit-group">Career-grupp</Label>
                <Select
                  value={formData.careerGroupId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, careerGroupId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj grupp (valfritt)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ingen grupp</SelectItem>
                    {careerGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.education.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? "Sparar..." : "Spara"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
