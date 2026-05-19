import { useEffect, useState } from "react";
import { products } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
  variantId: string;
  sku: string;
  price: string;
  salePrice: string;
};

function quickVariantLabel(v: any): string {
  const attrs = v.attributes;
  if (!attrs?.length) return v.sku ? String(v.sku) : "Default";
  const parts = attrs
    .map((a: any) => {
      const name = a.attribute ?? a.attributeValue?.attribute?.name;
      const val = a.value ?? a.attributeValue?.value;
      if (name && val) return `${name}: ${val}`;
      return val || name || "";
    })
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : v.sku ? String(v.sku) : "Variant";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  onSaved: () => void;
};

export function QuickProductPricingDialog({
  open,
  onOpenChange,
  productId,
  onSaved,
}: Props) {
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [variantsMeta, setVariantsMeta] = useState<any[]>([]);

  useEffect(() => {
    if (!open || !productId) {
      setProductName("");
      setRows([]);
      setVariantsMeta([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await products.getProductById(productId);
        if (cancelled) return;
        if (res.data.success) {
          const p = res.data.data?.product;
          setProductName(p?.name || "");
          const vs = p?.variants || [];
          setVariantsMeta(vs);
          setRows(
            vs.map((v: any) => ({
              variantId: v.id,
              sku: String(v.sku ?? ""),
              price: String(v.price ?? ""),
              salePrice:
                v.salePrice != null && v.salePrice !== ""
                  ? String(v.salePrice)
                  : "",
            }))
          );
        } else {
          toast.error(res.data.message || "Failed to load product");
        }
      } catch {
        if (!cancelled) toast.error("Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  const handleSave = async () => {
    if (!productId) return;

    for (const r of rows) {
      if (!r.sku.trim()) {
        toast.error("SKU is required for each variant");
        return;
      }
      const price = parseFloat(r.price);
      if (Number.isNaN(price) || price < 0) {
        toast.error("Enter a valid regular price for each variant");
        return;
      }
      if (r.salePrice.trim() !== "") {
        const sp = parseFloat(r.salePrice);
        if (Number.isNaN(sp) || sp < 0 || sp >= price) {
          toast.error("Sale price must be less than regular price");
          return;
        }
      }
    }

    setSaving(true);
    try {
      const updates = rows.map((r) => ({
        variantId: r.variantId,
        sku: r.sku.trim(),
        price: r.price,
        salePrice: r.salePrice.trim() === "" ? null : r.salePrice,
      }));
      const res = await products.quickUpdateProductPricing(
        productId,
        updates
      );
      if (res.data.success) {
        toast.success("Prices and SKU updated");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Update failed";
      toast.error(typeof msg === "string" ? msg : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const noVariants = !loading && open && productId && rows.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-[#FFFFFF] border-[#E5E7EB]">
        <DialogHeader>
          <DialogTitle className="text-[#1F2937]">Quick update</DialogTitle>
          {productName ? (
            <p className="text-sm text-[#6B7280] font-normal truncate">
              {productName}
            </p>
          ) : null}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
            </div>
          ) : noVariants ? (
            <p className="text-sm text-[#6B7280] py-4 text-center">
              This product has no variants to edit. Add a variant from the full
              product editor.
            </p>
          ) : (
            rows.map((row) => {
              const v = variantsMeta.find((x: any) => x?.id === row.variantId);
              const subtitle =
                rows.length > 1 && v ? quickVariantLabel(v) : null;
              return (
                <div
                  key={row.variantId}
                  className="rounded-lg border border-[#E5E7EB] p-3 space-y-3 bg-[#F9FAFB]"
                >
                  {subtitle ? (
                    <p className="text-xs font-medium text-[#374151]">
                      {subtitle}
                    </p>
                  ) : null}
                  <div className="grid gap-2">
                    <Label className="text-xs text-[#6B7280]">SKU</Label>
                    <Input
                      value={row.sku}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.variantId === row.variantId
                              ? { ...r, sku: e.target.value }
                              : r
                          )
                        )
                      }
                      className="bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label className="text-xs text-[#6B7280]">
                        Regular price (₹)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.price}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.variantId === row.variantId
                              ? { ...r, price: e.target.value }
                              : r
                          )
                        )
                      }
                        className="bg-white border-[#E5E7EB]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-[#6B7280]">
                        Sale price (₹)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Optional"
                        value={row.salePrice}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.variantId === row.variantId
                              ? { ...r, salePrice: e.target.value }
                              : r
                          )
                        )
                      }
                        className="bg-white border-[#E5E7EB]"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="border-[#E5E7EB]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || saving || rows.length === 0}
            className="bg-[#4CAF50] hover:bg-[#43A047] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
