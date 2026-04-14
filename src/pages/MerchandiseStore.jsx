import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, ShoppingBag, DollarSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MerchandiseStore() {
  const [merch, setMerch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_name: "", category: "T-Shirt", price: "", image_url: "" });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAdd = () => {
    if (!form.product_name || !form.price) return;
    setMerch(prev => [...prev, {
      id: crypto.randomUUID(),
      ...form,
      price: Number(form.price),
      sales: 0,
      created_date: new Date()
    }]);
    setForm({ product_name: "", category: "T-Shirt", price: "", image_url: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setMerch(prev => prev.filter(m => m.id !== id));
  };

  const totalRevenue = merch.reduce((sum, m) => sum + (m.price * (m.sales || 0)), 0);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Revenue</p>
          <h1 className="font-heading text-4xl font-bold mb-2">Merchandise Store</h1>
          <p className="text-muted-foreground">Build your merch catalog & embed in Link-in-Bio (integrate with Stripe/Printful).</p>
        </motion.div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />Add Product
          </Button>
          <Button variant="outline" className="gap-2">
            <DollarSign className="h-4 w-4" />Total Sales: ${totalRevenue.toFixed(2)}
          </Button>
        </div>

        {showForm && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <Input placeholder="Product name (e.g. Limited Edition Hoodie)" value={form.product_name} onChange={(e) => setForm(f => ({ ...f, product_name: e.target.value }))} />
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option>T-Shirt</option>
              <option>Hoodie</option>
              <option>Hat</option>
              <option>Vinyl</option>
              <option>Other</option>
            </select>
            <Input type="number" step="0.01" placeholder="Price ($)" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
            <Input placeholder="Product image URL" value={form.image_url} onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">Add Product</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : merch.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No products yet. Start building your merch catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {merch.map(m => (
              <div key={m.id} className="rounded-xl bg-card border border-border overflow-hidden">
                {m.image_url && <img src={m.image_url} alt={m.product_name} className="w-full h-40 object-cover" />}
                <div className="p-4">
                  <p className="font-medium">{m.product_name}</p>
                  <p className="text-xs text-muted-foreground">{m.category}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-heading font-bold text-lg">${m.price.toFixed(2)}</p>
                    <button onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}