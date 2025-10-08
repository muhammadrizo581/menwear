import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <Card>
      <CardHeader>
        <CardTitle>Буюртмалар рўйхати</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Фойдаланувчи</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Манзил</TableHead>
              <TableHead>Умумий нарх</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Сана</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {order.customer_name || order.profiles?.full_name || "Номаълум"}
                  {order.profiles?.telegram_username && (
                    <div className="text-sm text-muted-foreground">
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
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Янги">Янги</SelectItem>
                      <SelectItem value="Жараёнда">Жараёнда</SelectItem>
                      <SelectItem value="Етказилган">Етказилган</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString("uz-UZ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
