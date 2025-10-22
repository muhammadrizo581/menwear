import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";

export const ProductsManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    brand_id: "",
    images: [] as string[],
    sizes: "",
    in_stock: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select(`
        *,
        categories(name),
        brands(name),
        product_images(image_base64)
      `);

    const { data: categoriesData } = await supabase.from("categories").select("*");
    const { data: brandsData } = await supabase.from("brands").select("*");

    const productsWithImages = (productsData || []).map((p: any) => ({
      ...p,
      images: p.product_images?.map((i: any) => i.image_base64) || [],
    }));

    setProducts(productsWithImages);
    setCategories(categoriesData || []);
    setBrands(brandsData || []);
  };

  // === BASE64 IMAGE UPLOAD ===
  const handleUpload = async () => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    const base64Images: string[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      base64Images.push(base64);
    }

    setUploading(false);
    toast.success("Расмлар юкланди ✅");
    return base64Images;
  };

  // === FORM SUBMIT ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedBase64: string[] = formData.images || [];

    if (files && files.length > 0) {
      const newImages = await handleUpload();
      uploadedBase64 = [...uploadedBase64, ...newImages];
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
      sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()) : [],
      in_stock: formData.in_stock,
    };

    let newProductId = editing?.id;

    if (editing) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editing.id);

      if (error) {
        toast.error("Хатолик юз берди (update)");
        return;
      }

      await (supabase as any).from("product_images").delete().eq("product_id", editing.id);
      newProductId = editing.id;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select("id")
        .single();

      if (error) {
        toast.error("Хатолик юз берди (insert)");
        return;
      }

      newProductId = data.id;
    }

    if (uploadedBase64.length > 0 && newProductId) {
      const { error } = await (supabase as any).from("product_images").insert(
        uploadedBase64.map((img) => ({
          product_id: newProductId,
          image_base64: img,
        }))
      );

      if (error) {
        console.error(error);
        toast.error("Расмни сақлашда хатолик");
      }
    }

    toast.success(editing ? "Маҳсулот янгиланди ✏️" : "Маҳсулот қўшилди ✅");
    resetForm();
    loadData();
  };

  const handleRemoveImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
  };

  const handleEdit = (product: any) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      images: product.images || [],
      sizes: product.sizes?.join(", ") || "",
      in_stock: product.in_stock,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ростдан ҳам ўчирмоқчимисиз?")) {
      await (supabase as any).from("product_images").delete().eq("product_id", id);
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) toast.error("Хатолик юз берди");
      else {
        toast.success("Маҳсулот ўчирилди 🗑️");
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
      images: [],
      sizes: "",
      in_stock: true,
    });
    setFiles(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#141414] to-[#0b0b0b] text-white py-4 sm:p-6 md:p-8 space-y-10">
      {/* ==== FORM CARD ==== */}
      <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.08)] hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all">
        <CardHeader className="pb-2 border-b border-[#2a2a2a]">
          <CardTitle className="text-[#d4af37] text-2xl font-bold tracking-tight flex items-center gap-2">
            {editing ? "✏️ Маҳсулотни таҳрирлаш" : "➕ Янги маҳсулот қўшиш"}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* === NAME & PRICE === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-[#d4af37]">Номи</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white"
                />
              </div>
              <div>
                <Label className="text-[#d4af37]">Нарх ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white"
                />
              </div>
            </div>

            {/* === DESCRIPTION === */}
            <div>
              <Label className="text-[#d4af37]">Тавсиф</Label>
              <Textarea
                value={formData.description}
                required
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white"
              />
            </div>

            {/* === SELECTS === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-[#d4af37]">Категория</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category_id: v })
                  }
                >
                  <SelectTrigger className="bg-[#111] border-[#333] text-white">
                    <SelectValue placeholder="Танланг" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#d4af37]">Бренд</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, brand_id: v })
                  }
                >
                  <SelectTrigger className="bg-[#111] border-[#333] text-white">
                    <SelectValue placeholder="Танланг" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] text-white">
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* === SIZES === */}
            <div>
              <Label className="text-[#d4af37]">Ўлчамлар (вергул билан)</Label>
              <Input
                required
                value={formData.sizes}
                onChange={(e) =>
                  setFormData({ ...formData, sizes: e.target.value })
                }
                placeholder="S, M, L, XL"
                className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white"
              />
            </div>

            {/* === IMAGES === */}
            <div>
              <Label className="text-[#d4af37]">Расмлар</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="bg-[#111] border-[#333] text-white"
              />
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {formData.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt="preview"
                        className="w-20 h-20 rounded-lg object-cover border border-[#2a2a2a]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === BUTTONS === */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button
                type="submit"
                className="bg-[#d4af37] text-black hover:bg-[#c39c2e] font-semibold px-6 py-2 rounded-lg shadow-md"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" /> Юкланмоқда...
                  </>
                ) : editing ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" /> Янгилаш
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Қўшиш
                  </>
                )}
              </Button>

              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720] px-6 py-2 rounded-lg"
                >
                  Бекор қилиш
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* === PRODUCTS TABLE === */}
      <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] p-4">
        <CardHeader>
          <CardTitle className="text-[#d4af37] text-xl font-semibold">
            📦 Маҳсулотлар рўйхати
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Расм</TableHead>
                <TableHead>Номи</TableHead>
                <TableHead>Нарх</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Ҳолат</TableHead>
                <TableHead>Амаллар</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.images?.[0] || "/placeholder.svg"}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.brands?.name}</TableCell>
                  <TableCell>{p.categories?.name}</TableCell>
                  <TableCell>
                    {p.in_stock ? "✅ Бор" : "❌ Йўқ"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(p)}
                      variant="outline"
                      className="text-[#d4af37] border-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(p.id)}
                      variant="outline"
                      className="text-red-500 border-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
