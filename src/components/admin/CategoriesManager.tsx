import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const CategoriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      const { error } = await supabase.from("categories").update(formData).eq("id", editing.id);
      if (error) toast.error("Хатолик юз берди");
      else {
        toast.success("Категория янгиланди");
        resetForm();
        loadCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert(formData);
      if (error) toast.error("Хатолик юз берди");
      else {
        toast.success("Категория қўшилди");
        resetForm();
        loadCategories();
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditing(category);
    setFormData({ name: category.name, slug: category.slug });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ростдан ҳам ўчирмоқчимисиз?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) toast.error("Хатолик юз берди");
      else {
        toast.success("Категория ўчирилди");
        loadCategories();
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ name: "", slug: "" });
  };

  return (
    <div className="space-y-8 bg-[#0f0f0f] min-h-screen p-6 text-[#d4af37]">
      {/* === Category Form === */}
      <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
        <CardHeader className="border-b border-[#2a2a2a]">
          <CardTitle className="text-[#d4af37] text-2xl font-bold">
            {editing ? "📝 Категорияни таҳрирлаш" : "➕ Янги категория қўшиш"}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label className="text-[#d4af37]">Категория номи</Label>
                <Input
                  placeholder="Masalan: Kiyimlar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 bg-[#111] border-[#2a2a2a] text-[#d4af37] placeholder-[#8b7e3f] focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
              <div>
                <Label className="text-[#d4af37]">Slug</Label>
                <Input
                  placeholder="masalan: kiyimlar"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="mt-1 bg-[#111] border-[#2a2a2a] text-[#d4af37] placeholder-[#8b7e3f] focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-[#d4af37] hover:bg-[#b8962f] text-black font-semibold shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {editing ? "Янгилаш" : "Қўшиш"}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720]"
                >
                  Бекор қилиш
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* === Category List === */}
      <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
        <CardHeader className="border-b border-[#2a2a2a]">
          <CardTitle className="text-[#d4af37] text-2xl font-bold">
            🗂️ Категориялар рўйхати
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] bg-[#111]">
                <TableHead className="text-[#d4af37] font-semibold">Номи</TableHead>
                <TableHead className="text-[#d4af37] font-semibold">Slug</TableHead>
                <TableHead className="text-[#d4af37] text-center font-semibold">Амаллар</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-[#2a2a2a] hover:bg-[#222] transition-all text-[#d4af37]"
                >
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                        className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720]"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
