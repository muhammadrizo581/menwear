import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const ProductsManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    brand_id: "",
    images: "",
    sizes: "",
    in_stock: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: productsData } = await supabase.from("products").select("*, categories(name), brands(name)");
    const { data: categoriesData } = await supabase.from("categories").select("*");
    const { data: brandsData } = await supabase.from("brands").select("*");
    
    setProducts(productsData || []);
    setCategories(categoriesData || []);
    setBrands(brandsData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
      images: formData.images ? formData.images.split(",").map(s => s.trim()) : [],
      sizes: formData.sizes ? formData.sizes.split(",").map(s => s.trim()) : [],
      in_stock: formData.in_stock
    };

    if (editing) {
      const { error } = await supabase.from("products").update(productData).eq("id", editing.id);
      if (error) {
        toast.error("Хатолик юз берди");
      } else {
        toast.success("Маҳсулот янгиланди");
        resetForm();
        loadData();
      }
    } else {
      const { error } = await supabase.from("products").insert(productData);
      if (error) {
        toast.error("Хатолик юз берди");
      } else {
        toast.success("Маҳсулот қўшилди");
        resetForm();
        loadData();
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      images: product.images?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      in_stock: product.in_stock
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ростдан ҳам ўчирмоқчимисиз?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        toast.error("Хатолик юз берди");
      } else {
        toast.success("Маҳсулот ўчирилди");
        loadData();
      }
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      brand_id: "",
      images: "",
      sizes: "",
      in_stock: true
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Маҳсулотни таҳрирлаш" : "Янги маҳсулот қўшиш"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Номи</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div>
              <Label>Тавсиф</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Нарх ($)</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>
              
              <div>
                <Label>Категория</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Танланг" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Бренд</Label>
              <Select value={formData.brand_id} onValueChange={(value) => setFormData({...formData, brand_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Танланг" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Расмлар (URL'лар, вергул билан ажратилган)</Label>
              <Input value={formData.images} onChange={(e) => setFormData({...formData, images: e.target.value})} placeholder="https://example.com/image1.jpg, https://..." />
            </div>

            <div>
              <Label>Ўлчамлар (вергул билан ажратилган)</Label>
              <Input value={formData.sizes} onChange={(e) => setFormData({...formData, sizes: e.target.value})} placeholder="S, M, L, XL" />
            </div>

            <div className="flex gap-4">
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                {editing ? "Янгилаш" : "Қўшиш"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Бекор қилиш
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Маҳсулотлар рўйхати</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номи</TableHead>
                <TableHead>Нарх</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Амаллар</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.categories?.name || "-"}</TableCell>
                  <TableCell>{product.brands?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
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
