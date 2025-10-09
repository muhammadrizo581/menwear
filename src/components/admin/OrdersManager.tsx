import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";

export const OrdersManager = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, profiles(telegram_username, full_name)")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Хатолик юз берди");
    } else {
      toast.success("Статус янгиланди");
      loadOrders();
    }
  };

  return (
    <Card className="bg-[#1a1a1a]/90 border border-[#2a2a2a] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
      <CardHeader className="border-b border-[#2a2a2a]">
        <CardTitle className="text-[#d4af37] text-2xl font-bold">
          🛒 Буюртмалар рўйхати
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2a2a] bg-[#111]">
              <TableHead className="text-[#d4af37] font-semibold">
                Фойдаланувчи
              </TableHead>
              <TableHead className="text-[#d4af37]">Телефон</TableHead>
              <TableHead className="text-[#d4af37]">Манзил</TableHead>
              <TableHead className="text-[#d4af37]">Умумий нарх</TableHead>
              <TableHead className="text-[#d4af37]">Статус</TableHead>
              <TableHead className="text-[#d4af37]">Сана</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="border-[#2a2a2a] hover:bg-[#222] transition-all text-[#d4af37]"
              >
                <TableCell>
                  <div className="font-medium">
                    {order.customer_name || order.profiles?.full_name || "Номаълум"}
                  </div>
                  {order.profiles?.telegram_username && (
                    <div className="text-sm text-[#bfa75e]/80">
                      @{order.profiles.telegram_username}
                    </div>
                  )}
                </TableCell>

                <TableCell>{order.customer_phone || "-"}</TableCell>
                <TableCell>{order.customer_address || "-"}</TableCell>
                <TableCell>${order.total_price}</TableCell>

                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-36 bg-[#1a1a1a] border-[#d4af37]/30 text-[#d4af37]">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#d4af37]">
                      <SelectItem value="Янги">🟡 Янги</SelectItem>
                      <SelectItem value="Жараёнда">🟠 Жараёнда</SelectItem>
                      <SelectItem value="Етказилган">🟢 Етказилган</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  {new Date(order.created_at).toLocaleDateString("uz-UZ")}
                </TableCell>
              </TableRow>
            ))}

            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-[#d4af37]/60 py-6"
                >
                  Ҳозирча буюртмалар йўқ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
