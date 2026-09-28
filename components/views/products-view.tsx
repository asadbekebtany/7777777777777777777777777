"use client";

import { PhotoCompare } from "@/components/photo-compare";
import { ProductThumb } from "@/components/product-thumb";
import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckBox, EmptyState, Pagination } from "@/components/ui/feedback";
import { Field, Input, Search, Select } from "@/components/ui/field";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { fill } from "@/lib/i18n";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import type { Product, ProductStatus, ThumbKind } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";
import { Package, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const TABS: Array<ProductStatus | "all"> = ["all", "active", "moderation", "rejected", "inactive"];

export function ProductsView() {
  const { t, locale, products, addProduct, bulkDeactivate, applyDiscount, toast } = useSeller();
  const params = useSearchParams();
  const attentionParam = params.get("attention") === "1";
  const productParam = params.get("product");
  const [tab, setTab] = useState<ProductStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("sales");
  const [attention, setAttention] = useState(attentionParam);
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(productParam);
  const [creating, setCreating] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [percent, setPercent] = useState("10");
  const [page, setPage] = useState(1);
  const [paramKey, setParamKey] = useState(`${attentionParam}|${productParam}`);
  const nextKey = `${attentionParam}|${productParam}`;
  if (paramKey !== nextKey) {
    setParamKey(nextKey);
    setAttention(attentionParam);
    if (productParam) setOpenId(productParam);
  }

  const categories = ["all", ...new Set(products.map((item) => item.category))];
  const filtered = useMemo(() => {
    const list = products.filter((item) => {
      if (tab !== "all" && item.status !== tab) return false;
      if (category !== "all" && item.category !== category) return false;
      if (attention && !item.attention) return false;
      const blob = `${item.name} ${item.sku} ${item.oem}`.toLowerCase();
      if (query && !blob.includes(query.toLowerCase())) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "price") return b.price - a.price;
      if (sort === "stock") return a.stock - b.stock;
      if (sort === "name") return a.name.localeCompare(b.name, "ru");
      return b.sales - a.sales;
    });
  }, [products, tab, category, attention, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * 8, safePage * 8);
  const opened = products.find((item) => item.id === openId) ?? null;
  const labels = productLabels(t);
  const allChecked = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  return (
    <Screen
      title={t.products.title}
      subtitle={t.products.subtitle}
      actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" />{t.products.add}</Button>}
    >
      <Tabs
        value={tab}
        onChange={(id) => { setTab(id as ProductStatus | "all"); setPage(1); }}
        tabs={TABS.map((id) => ({
          id,
          label: id === "all" ? t.common.all : labels[id],
          count: id === "all" ? products.length : products.filter((item) => item.status === id).length,
        }))}
      />
      <div className="grid gap-2 md:grid-cols-4">
        <Search className="md:col-span-2" value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder={t.products.search} />
        <Select ariaLabel={t.products.category} value={category} onChange={(value) => { setCategory(value); setPage(1); }} options={categories.map((item) => ({ value: item, label: item === "all" ? t.products.allCategories : item }))} />
        <Select
          ariaLabel={t.products.sortSales}
          value={sort}
          onChange={setSort}
          options={[
            { value: "sales", label: t.products.sortSales },
            { value: "price", label: t.products.sortPrice },
            { value: "stock", label: t.products.sortStock },
            { value: "name", label: t.products.sortName },
          ]}
        />
      </div>
      {attention && (
        <button type="button" className="w-fit text-sm text-tawfiq-700" onClick={() => setAttention(false)}>
          {t.products.attention} ×
        </button>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-tawfiq-200 bg-tawfiq-50 px-3 py-2 text-sm">
          <span>{t.common.selected}: {selected.length}</span>
          <Button size="sm" variant="secondary" onClick={() => { bulkDeactivate(selected); setSelected([]); }}>{t.products.deactivate}</Button>
          <Button size="sm" variant="secondary" onClick={() => setDiscountOpen(true)}>{t.products.discount}</Button>
          <Button size="sm" variant="secondary" onClick={() => exportProducts(rows.filter((row) => selected.includes(row.id)), t, toast)}>{t.common.export}</Button>
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState
          icon={<Package className="size-5" />}
          title={products.length ? t.products.emptyFilter : t.products.empty}
          text={products.length ? t.products.emptyFilterText : t.products.emptyText}
          action={!products.length ? <Button onClick={() => setCreating(true)}>{t.products.first}</Button> : undefined}
        />
      ) : (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>
                    <CheckBox
                      label={t.common.selected}
                      checked={allChecked ? true : selected.some((id) => rows.some((row) => row.id === id)) ? "indeterminate" : false}
                      onChange={(checked) => setSelected(checked ? Array.from(new Set([...selected, ...rows.map((row) => row.id)])) : selected.filter((id) => !rows.some((row) => row.id === id)))}
                    />
                  </Th>
                  <Th>{t.products.colPhoto}</Th>
                  <Th>{t.products.colName}</Th>
                  <Th className="hidden md:table-cell">{t.products.colSku}</Th>
                  <Th className="hidden lg:table-cell">{t.products.colCategory}</Th>
                  <Th>{t.products.colPrice}</Th>
                  <Th>{t.products.colStock}</Th>
                  <Th>{t.products.colStatus}</Th>
                  <Th className="hidden md:table-cell">{t.products.colSales}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="cursor-pointer hover:bg-tawfiq-50/50" onClick={() => setOpenId(item.id)}>
                    <Td>
                      <span onClick={(event) => event.stopPropagation()}>
                        <CheckBox label={item.name} checked={selected.includes(item.id)} onChange={(checked) => setSelected(checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} />
                      </span>
                    </Td>
                    <Td><ProductThumb kind={item.kind} alt={item.name} className="size-12" /></Td>
                    <Td>
                      <span className="font-medium">{item.name}</span>
                      {item.attention && <Badge tone="amber" className="mt-1">{t.products.attention}</Badge>}
                    </Td>
                    <Td className="hidden md:table-cell text-muted">{item.sku}</Td>
                    <Td className="hidden lg:table-cell">{item.category}</Td>
                    <Td className="whitespace-nowrap tabular-nums">{formatMoney(item.price, locale)}</Td>
                    <Td className={item.stock <= 3 ? "text-danger tabular-nums" : "tabular-nums"}>{item.stock}</Td>
                    <Td><StatusBadge status={item.status} label={labels[item.status]} /></Td>
                    <Td className="hidden md:table-cell tabular-nums">{formatNumber(item.sales, locale)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
          <div className="px-3 pb-3">
            <Pagination page={safePage} pageCount={pageCount} onPage={setPage} label={fill(t.common.range, { from: (safePage - 1) * 8 + 1, to: Math.min(safePage * 8, filtered.length), total: filtered.length })} />
          </div>
        </div>
      )}
      <Drawer open={Boolean(opened)} onClose={() => setOpenId(null)} title={opened?.name ?? ""} description={opened?.sku}>
        {opened && <ProductBody product={opened} />}
      </Drawer>
      <CreateProduct open={creating} onClose={() => setCreating(false)} onCreate={addProduct} />
      <Modal open={discountOpen} onClose={() => setDiscountOpen(false)} title={t.products.discountTitle} description={t.products.discountText}>
        <Field label={t.products.percent}>
          <Input value={percent} onChange={(event) => setPercent(event.target.value)} />
        </Field>
        <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-sm">
          {products.filter((item) => selected.includes(item.id)).map((item) => (
            <li key={item.id}>{item.name}: {formatMoney(item.price, locale)} → {formatMoney(Math.round(item.price * (1 - Number(percent || 0) / 100)), locale)}</li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDiscountOpen(false)}>{t.common.cancel}</Button>
          <Button onClick={() => { applyDiscount(selected, Number(percent) || 0); setDiscountOpen(false); setSelected([]); }}>{t.common.confirm}</Button>
        </div>
      </Modal>
    </Screen>
  );
}

function ProductBody({ product }: { product: Product }) {
  const { t, locale } = useSeller();
  const [compare, setCompare] = useState(false);
  const conversion = product.views ? (product.sales / product.views) * 100 : 0;
  return (
    <div className="space-y-5">
      <ProductThumb kind={product.kind} alt={product.name} className="h-40 w-full" />
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={product.status} label={productLabels(t)[product.status]} />
        {product.attention && <Badge tone="amber">{t.products.attention}</Badge>}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Meta label={t.products.brand} value={product.brand} />
        <Meta label="OEM" value={product.oem} />
        <Meta label={t.products.colPrice} value={formatMoney(product.price, locale)} />
        <Meta label={t.products.colStock} value={String(product.stock)} />
        <Meta label={t.products.drawerSales} value={formatNumber(product.sales, locale)} />
        <Meta label={t.products.views} value={formatNumber(product.views, locale)} />
        <Meta label={t.products.conversion} value={formatPercent(conversion, locale)} />
        <Meta label={t.products.returns} value={String(product.returns)} />
      </dl>
      {product.rejectReason && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{t.products.reject}: {product.rejectReason}</p>}
      <section className="rounded-xl border border-line p-3">
        <h3 className="text-sm font-medium">{t.products.photoTitle}</h3>
        <p className="mt-1 text-sm text-muted">{t.products.photoText}</p>
        <Button className="mt-3" size="sm" variant="secondary" onClick={() => setCompare(true)}>{t.products.showExample}</Button>
        {compare && <div className="mt-3"><PhotoCompare kind={product.kind} before={t.products.before} after={t.products.after} /></div>}
      </section>
      <section className="rounded-xl border border-dashed border-tawfiq-200 bg-tawfiq-50/40 p-3">
        <h3 className="text-sm font-medium">{t.products.futureTitle}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.products.futureBody}</p>
      </section>
    </div>
  );
}

function CreateProduct({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (draft: { name: string; sku: string; brand: string; category: string; price: number; stock: number; kind: ThumbKind; oem: string; note: string }) => string }) {
  const { t } = useSeller();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Тормозная система");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [compare, setCompare] = useState(false);
  const [file, setFile] = useState("");

  return (
    <Modal open={open} onClose={onClose} title={t.products.formTitle} description={t.products.formText} wide>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name || !sku || !price) {
            setError(t.common.required);
            return;
          }
          onCreate({ name, sku, brand: brand || "—", category, price: Number(price), stock: Number(stock || 0), kind: "brakes", oem: "", note: file });
          onClose();
        }}
      >
        <Field label={t.products.name}><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
        <Field label={t.products.sku}><Input value={sku} onChange={(event) => setSku(event.target.value)} /></Field>
        <Field label={t.products.brand}><Input value={brand} onChange={(event) => setBrand(event.target.value)} /></Field>
        <Field label={t.products.category}>
          <Select ariaLabel={t.products.category} value={category} onChange={setCategory} options={["Тормозная система", "Фильтры", "Подвеска", "Зажигание", "Шины", "Диски", "Масла", "Аксессуары"].map((item) => ({ value: item, label: item }))} />
        </Field>
        <Field label={t.products.price}><Input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} /></Field>
        <Field label={t.products.stock}><Input inputMode="numeric" value={stock} onChange={(event) => setStock(event.target.value)} /></Field>
        <div className="sm:col-span-2">
          <p className="text-sm text-ink-soft">{t.products.photo}</p>
          <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-line px-3 py-6 text-sm text-muted hover:border-tawfiq-300">
            {file || t.products.upload}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0]?.name ?? "")} />
          </label>
          <Button type="button" className="mt-3" size="sm" variant="secondary" onClick={() => setCompare((value) => !value)}>{t.products.photoTitle}</Button>
          {compare && <div className="mt-3"><PhotoCompare kind="brakes" before={t.products.before} after={t.products.after} /></div>}
          <p className="mt-3 text-sm leading-relaxed text-muted">{t.products.futureBody}</p>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="secondary" onClick={onClose}>{t.common.cancel}</Button>
          <Button type="submit">{t.products.submit}</Button>
        </div>
      </form>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function productLabels(t: ReturnType<typeof useSeller>["t"]) {
  return { active: t.status.active, moderation: t.status.moderation, rejected: t.status.rejected, inactive: t.status.inactive };
}

function exportProducts(items: Product[], t: ReturnType<typeof useSeller>["t"], toast: (title: string) => void) {
  downloadCsv("tawfiq-products.csv", [
    [t.products.colName, t.products.colSku, "OEM", t.products.colPrice, t.products.colStock],
    ...items.map((item) => [item.name, item.sku, item.oem, item.price, item.stock]),
  ]);
  toast(t.toast.export);
}
