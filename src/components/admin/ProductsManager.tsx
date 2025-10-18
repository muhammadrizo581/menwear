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
      .select("*, categories(name), brands(name)");
    const { data: categoriesData } = await supabase.from("categories").select("*");
    const { data: brandsData } = await supabase.from("brands").select("*");

    setProducts(productsData || []);
    setCategories(categoriesData || []);
    setBrands(brandsData || []);
  };

  // === RASM YUKLASH ===
  const handleUpload = async () => {
    if (!files || files.length === 0) return [];
    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) {
        toast.error("Расм юклашда хатолик");
        continue;
      }

      const { data: publicData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      if (publicData?.publicUrl) uploadedUrls.push(publicData.publicUrl);
    }

    setUploading(false);
    toast.success("Расмлар юкланди ✅");
    return uploadedUrls;
  };

  // === FORM SUBMIT ===
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  let uploadedUrls: string[] = formData.images || [];

  // agar yangi fayllar tanlangan bo‘lsa, yuklab, eski rasmlarga qo‘shamiz
  if (files && files.length > 0) {
    const urls = await handleUpload();
    uploadedUrls = [...uploadedUrls, ...urls];
  }

  const productData = {
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    category_id: formData.category_id || null,
    brand_id: formData.brand_id || null,
    images: uploadedUrls, // 👈 eski + yangi rasmlar
    sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()) : [],
    in_stock: formData.in_stock,
  };

  if (editing) {
    const { error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", editing.id);
    if (error) toast.error("Хатолик юз берди");
    else {
      toast.success("Маҳсулот янгиланди ✏️");
      resetForm();
      loadData();
    }
  } else {
    const { error } = await supabase.from("products").insert(productData);
    if (error) toast.error("Хатолик юз берди");
    else {
      toast.success("Маҳсулот қўшилди ✅");
      resetForm();
      loadData();
    }
  }
};


  // === RASM O‘CHIRISH ===
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#141414] to-[#0b0b0b] text-white py-4 sm:p-6 md:p-8 space-y-8 md:space-y-10">
      {/* ==== FORM CARD ==== */}
      <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.08)] hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all">
        <CardHeader className="pb-2 border-b border-[#2a2a2a]">
          <CardTitle className="text-[#d4af37] text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            {editing ? "✏️ Маҳсулотни таҳрирлаш" : "➕ Янги маҳсулот қўшиш"}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* === GRID FIELDS === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <Label className="text-[#d4af37]">Номи</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white text-sm sm:text-base"
                />
              </div>

              <div>
                <Label className="text-[#d4af37]">Нарх ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white text-sm sm:text-base"
                />
              </div>
            </div>

            {/* === DESCRIPTION === */}
            <div>
              <Label className="text-[#d4af37]">Тавсиф</Label>
              <Textarea
                value={formData.description}
                required
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white text-sm sm:text-base"
              />
            </div>

            {/* === SELECTS === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <Label className="text-[#d4af37]">Категория</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm sm:text-base">
                    <SelectValue placeholder="Танланг" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, brand_id: value })
                  }
                >
                  <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm sm:text-base">
                    <SelectValue placeholder="Танланг" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] text-white border-[#2a2a2a]">
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
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
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="bg-[#111] border-[#333] focus:border-[#d4af37] text-white text-sm sm:text-base"
              />
            </div>

            {/* === IMAGES === */}
            <div>
              <Label className="text-[#d4af37]">Расмлар</Label>
              <Input
                type="file"                
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="bg-[#111] border-[#333] text-white text-sm sm:text-base"
              />
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {formData.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt="preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-[#2a2a2a]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === BUTTONS === */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4">
              <Button
                type="submit"
                className="bg-[#d4af37] text-black hover:bg-[#c39c2e] font-semibold px-5 sm:px-6 py-2 rounded-lg shadow-md text-sm sm:text-base"
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
                  className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720] px-5 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                >
                  Бекор қилиш
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ==== PRODUCT LIST ==== */}
      {/* ==== PRODUCT LIST ==== */}
<Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
  <CardHeader className="border-b border-[#2a2a2a]">
    <CardTitle className="text-[#d4af37] text-xl sm:text-2xl font-bold">
      📦 Маҳсулотлар рўйхати
    </CardTitle>
  </CardHeader>

  <CardContent className="mt-4">
    {/* 🟢 DESKTOP / LARGE TABLE */}
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] bg-[#111]">
            <TableHead className="text-[#d4af37] font-semibold">Номи</TableHead>
            <TableHead className="text-[#d4af37]">Нарх</TableHead>
            <TableHead className="text-[#d4af37]">Категория</TableHead>
            <TableHead className="text-[#d4af37]">Бренд</TableHead>
            <TableHead className="text-[#d4af37]">Расмлар</TableHead>
            <TableHead className="text-[#d4af37] text-center">Амаллар</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="border-[#2a2a2a] hover:bg-[#222] transition-all text-[#d4af37]"
            >
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.categories?.name || "-"}</TableCell>
              <TableCell>{product.brands?.name || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {product.images?.slice(0, 3).map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt="thumb"
                      className="w-10 h-10 rounded object-cover border border-[#2a2a2a]"
                    />
                  ))}
                  {product.images?.length > 3 && (
                    <span className="text-xs text-[#888]">
                      +{product.images.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720]"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
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
    </div>

    {/* 🟡 MOBILE / COMPACT CARDS */}
    <div className="md:hidden flex flex-col gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4 text-[#d4af37] shadow-md"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold">{product.name}</h3>
            <span className="text-sm text-[#c1c1c1]">${product.price}</span>
          </div>

          <p className="text-xs text-[#999] mt-1">
            {product.categories?.name || "-"} / {product.brands?.name || "-"}
          </p>

          {product.images?.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.slice(0, 4).map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt="thumb"
                  className="w-14 h-14 rounded-md object-cover border border-[#2a2a2a] flex-shrink-0"
                />
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(product)}
              className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720]"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(product.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

    </div>
  );
};

