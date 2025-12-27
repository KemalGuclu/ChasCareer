"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

type Company = {
  id: string;
  name: string;
  industry: string | null;
  city: string;
  size: string | null;
  website: string | null;
};

export function EditCompanyDialog({ company }: { company: Company }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    industry: company.industry || "",
    city: company.city,
    size: company.size || "",
    website: company.website || "",
  });

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch(`/api/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          Redigera
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redigera företag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Företagsnamn</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Bransch</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Stad</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Storlek</Label>
            <Select
              value={formData.size}
              onValueChange={(value) =>
                setFormData({ ...formData, size: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj storlek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 anställda</SelectItem>
                <SelectItem value="11-50">11-50 anställda</SelectItem>
                <SelectItem value="51-200">51-200 anställda</SelectItem>
                <SelectItem value="201-500">201-500 anställda</SelectItem>
                <SelectItem value="500+">500+ anställda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Webbplats</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Sparar..." : "Spara"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
