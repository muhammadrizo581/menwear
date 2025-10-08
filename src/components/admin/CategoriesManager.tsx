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
      if (error) {
        toast.error("Хатолик юз берди");
      } else {
        toast.success("Категория янгиланди");
        resetForm();
        loadCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert(formData);
      if (error) {
        toast.error("Хатолик юз берди");
      } else {
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
      if (error) {
        toast.error("Хатолик юз берди");
      } else {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Категорияни таҳрирлаш" : "Янги категория қўшиш"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Номи</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} required />
            </div>
            <div className="flex gap-4">
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                {editing ? "Янгилаш" : "Қўшиш"}
              </Button>
              {editing && <Button type="button" variant="outline" onClick={resetForm}>Бекор қилиш</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Категориялар рўйхати</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номи</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Амаллар</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
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
