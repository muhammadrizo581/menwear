import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Button,
} from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import {
  Label,
} from "@/components/ui/label";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// === IMAGEKIT CONFIG ===
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY!;
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT!;

// === IMAGE UPLOAD FUNCTION ===
async function uploadToImageKit(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);

    const res = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(IMAGEKIT_PRIVATE + ":")}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      return data.url;
    } else {
      console.error("ImageKit error:", data);
      toast.error("Rasm yuklashda xatolik");
      return null;
    }
  } catch (err) {
    console.error("ImageKit upload failed:", err);
    toast.error("Rasm yuklanmadi");
    return null;
  }
}

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

  // === LOAD DATA FROM SUPABASE ===
  const loadData = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select(`*, categories(name), brands(name), product_images(image_url)`);

    const { data: categoriesData } = await supabase.from("categories").select("*");
    const { data: brandsData } = await supabase.from("brands").select("*");

    const formatted = (productsData || []).map((p: any) => ({
      ...p,
      images: p.product_images?.map((i: any) => i.image_url) || [],
    }));

    setProducts(formatted);
    setCategories(categoriesData || []);
    setBrands(brandsData || []);
  };

  // === UPLOAD SELECTED FILES TO IMAGEKIT ===
  const handleUpload = async (): Promise<string[]> => {
    if (!files?.length) return [];
    setUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadToImageKit(file);
      if (url) urls.push(url);
    }

    setUploading(false);
    toast.success("Rasmlar yuklandi ✅");
    return urls;
  };

  // === SAVE OR UPDATE PRODUCT ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedUrls: string[] = formData.images || [];
    if (files?.length) {
      const newUrls = await handleUpload();
      uploadedUrls = [...uploadedUrls, ...newUrls];
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      brand_id: formData.brand_id || null,
      sizes: formData.sizes.split(",").map((s) => s.trim()),
      in_stock: formData.in_stock,
    };

    let productId = editing?.id;

    if (editing) {
      await supabase.from("products").update(productData).eq("id", editing.id);
      await (supabase as any).from("product_images").delete().eq("product_id", editing.id);
      productId = editing.id;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select("id")
        .single();
      if (error) throw error;
      productId = data.id;
    }

    if (uploadedUrls.length && productId) {
      await (supabase as any)
        .from("product_images")
        .insert(uploadedUrls.map((url) => ({ product_id: productId, image_url: url })));
    }

    toast.success(editing ? "Mahsulot yangilandi ✏️" : "Mahsulot qo‘shildi ✅");
    resetForm();
    loadData();
  };

  // === EDIT PRODUCT ===
  const handleEdit = (p: any) => {
    setEditing(p);
    setFormData({
      name: p.name,
      description: p.description || "",
      price: p.price.toString(),
      category_id: p.category_id || "",
      brand_id: p.brand_id || "",
      images: p.images || [],
      sizes: p.sizes?.join(", ") || "",
      in_stock: p.in_stock,
    });
  };

  // === DELETE PRODUCT ===
  const handleDelete = async (id: string) => {
    if (!confirm("Rostdan ham o‘chirmoqchimisiz?")) return;
    await (supabase as any).from("product_images").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    toast.success("O‘chirildi 🗑️");
    loadData();
  };

  const handleRemoveImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
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

  // === UI ===
  return (
    <div>
      {/* FORM SECTION */}
      <section className="bg-[#1a1a1a]/90 border border-[#2a2a2a] rounded-2xl p-6 shadow-lg">
        <h2 className="text-[#d4af37] text-2xl font-bold mb-5 text-center">
          {editing ? "✏️ Маҳсулотни таҳрирлаш" : "➕ Янги маҳсулот қўшиш"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name / Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#d4af37]">Номи</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#111] border-[#333] text-white focus:border-[#d4af37]"
              />
            </div>
            <div>
              <Label className="text-[#d4af37]">Нарх ($)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-[#111] border-[#333] text-white focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-[#d4af37]">Тавсиф</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#111] border-[#333] text-white focus:border-[#d4af37]"
            />
          </div>

          {/* Category / Brand */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#d4af37]">Категория</Label>
              <Select
                value={formData.category_id}
                onValueChange={(v) => setFormData({ ...formData, category_id: v })}
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
                onValueChange={(v) => setFormData({ ...formData, brand_id: v })}
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

          {/* Sizes */}
          <div>
            <Label className="text-[#d4af37]">Ўлчамлар (вергул билан)</Label>
            <Input
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              placeholder="S, M, L, XL"
              className="bg-[#111] border-[#333] text-white focus:border-[#d4af37]"
            />
          </div>

          {/* Images */}
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
                      className="w-20 h-20 object-cover rounded-lg border border-[#2a2a2a]"
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

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              type="submit"
              disabled={uploading}
              className="bg-[#d4af37] text-black hover:bg-[#c39c2e]"
            >
              {editing ? (
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
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af3720]"
              >
                Бекор қилиш
              </Button>
            )}
          </div>
        </form>
      </section>

      {/* PRODUCTS LIST */}
      <section className="bg-[#1a1a1a]/90 border border-[#2a2a2a] rounded-2xl p-4 shadow-lg mt-6">
        <h2 className="text-[#d4af37] text-xl font-semibold mb-4 text-center">
          📦 Маҳсулотлар рўйхати
        </h2>

        <div className="hidden md:block">
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
                    <img src={p.images?.[0]} className="w-16 h-16 object-cover rounded" />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.brands?.name}</TableCell>
                  <TableCell>{p.categories?.name}</TableCell>
                  <TableCell>{p.in_stock ? "✅ Бор" : "❌ Йўқ"}</TableCell>
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
        </div>
      </section>
    </div>
  );
};
