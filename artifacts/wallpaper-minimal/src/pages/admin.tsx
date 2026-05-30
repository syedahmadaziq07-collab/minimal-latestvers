import React, { useState, useEffect } from "react";
import { 
  useListWallpapers, useCreateWallpaper, useUpdateWallpaper, useDeleteWallpaper, getListWallpapersQueryKey,
  useListOrders, useUpdateOrder, useDeleteOrder, getListOrdersQueryKey,
  useGetOrderStats, getGetOrderStatsQueryKey,
  useListBundles, useCreateBundle, useUpdateBundle, useDeleteBundle, getListBundlesQueryKey,
  useListPromos, useCreatePromo, useUpdatePromo, useDeletePromo, getListPromosQueryKey,
  useGetSettings, useSaveSettings, getGetSettingsQueryKey
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  LayoutDashboard, Image as ImageIcon, ShoppingBag, Package, Tag, Settings, LogOut, 
  Trash2, Edit2, Plus, UploadCloud, Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const ADMIN_COLORS = {
  taupe: "#D4C5B0",
  mocha: "#9E8E78",
  text: "#1A1A1A",
  card: "#F7F5F2",
  border: "#E8E4DF"
};

// ---------------------------------------------------------------------------
// Dashboard Tab
// ---------------------------------------------------------------------------

function DashboardTab() {
  const { data: stats, isLoading } = useGetOrderStats({ query: { queryKey: getGetOrderStatsQueryKey() } });

  if (isLoading) return <div className="p-8 text-center text-[#9E8E78]">Loading stats...</div>;
  if (!stats) return null;

  const cards = [
    { title: "Total Revenue", value: `$${stats.total_revenue.toFixed(2)}` },
    { title: "Total Orders", value: stats.total_orders },
    { title: "Orders Today", value: stats.orders_today },
    { title: "Revenue Today", value: `$${stats.revenue_today.toFixed(2)}` },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-sm border"
            style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ADMIN_COLORS.mocha }}>{card.title}</p>
            <p className="text-3xl font-serif italic" style={{ color: ADMIN_COLORS.text }}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-sm border" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
          <h3 className="font-serif italic text-xl mb-6" style={{ color: ADMIN_COLORS.text }}>Revenue by Product</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenue_by_type || []}>
                <XAxis dataKey="type" stroke={ADMIN_COLORS.mocha} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={ADMIN_COLORS.mocha} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: ADMIN_COLORS.border }}
                  contentStyle={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border, borderRadius: '2px' }}
                  formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill={ADMIN_COLORS.taupe} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-sm border" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
          <h3 className="font-serif italic text-xl mb-6" style={{ color: ADMIN_COLORS.text }}>Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: ADMIN_COLORS.border, color: ADMIN_COLORS.mocha }}>
                  <th className="pb-3 font-normal">Date</th>
                  <th className="pb-3 font-normal">Customer</th>
                  <th className="pb-3 font-normal">Product</th>
                  <th className="pb-3 font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recent_orders || []).map((order, i) => (
                  <tr key={i} className="border-b last:border-0" style={{ borderColor: ADMIN_COLORS.border }}>
                    <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 truncate max-w-[120px]">{order.customer_email}</td>
                    <td className="py-3 capitalize">{order.product}</td>
                    <td className="py-3">${Number(order.amount).toFixed(2)}</td>
                  </tr>
                ))}
                {(stats.recent_orders || []).length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center" style={{ color: ADMIN_COLORS.mocha }}>No recent orders.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wallpapers Tab — with Supabase Storage upload
// ---------------------------------------------------------------------------

function WallpapersTab() {
  const queryClient = useQueryClient();
  const { data: wallpapers, isLoading } = useListWallpapers({}, { query: { queryKey: getListWallpapersQueryKey() } });
  
  const createMutation = useCreateWallpaper();
  const updateMutation = useUpdateWallpaper();
  const deleteMutation = useDeleteWallpaper();

  const [formData, setFormData] = useState({
    name: "", category: "", price: 4, image_url: "", featured: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", category: "", price: 4, image_url: "", featured: false });
    setEditingId(null);
    setPreviewUrl(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadToStorage(e.dataTransfer.files[0]);
    }
  };

  const uploadToStorage = async (file: File) => {
    if (!supabase) {
      toast.error("Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("wallpapers")
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("wallpapers")
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicData.publicUrl }));
      toast.success("Image uploaded to Supabase Storage");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message ?? "Unknown error"}`);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Please upload an image first");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          toast.success("Wallpaper updated");
          queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
          resetForm();
        },
        onError: (err: any) => toast.error(`Failed to update: ${err.message}`)
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          toast.success("Wallpaper saved");
          queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
          resetForm();
        },
        onError: (err: any) => toast.error(`Failed to save: ${err.message}`)
      });
    }
  };

  const toggleFeatured = (wp: { id: string; featured: boolean }) => {
    updateMutation.mutate({ id: wp.id, data: { featured: !wp.featured } }, {
      onSuccess: () => {
        toast.success(`${!wp.featured ? 'Featured' : 'Unfeatured'}`);
        queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this wallpaper?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Wallpaper deleted");
        queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed to delete: ${err.message}`)
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Upload Form */}
      <div className="lg:col-span-1 p-6 rounded-sm border sticky top-8" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
        <h3 className="font-serif italic text-2xl mb-6" style={{ color: ADMIN_COLORS.text }}>
          {editingId ? 'Edit Wallpaper' : 'Upload Wallpaper'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Supabase Storage Upload */}
          <div 
            className={`border-2 border-dashed p-6 text-center rounded-sm transition-colors cursor-pointer ${dragActive ? 'border-black bg-black/5' : 'border-black/20 hover:border-black/40'}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById('file-upload')?.click()}
          >
            <input 
              type="file" id="file-upload" className="hidden" accept="image/*" 
              onChange={(e) => e.target.files && uploadToStorage(e.target.files[0])} 
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin" style={{ color: ADMIN_COLORS.mocha }} />
                <p className="text-sm" style={{ color: ADMIN_COLORS.mocha }}>Uploading to Supabase...</p>
              </div>
            ) : previewUrl ? (
              <div className="space-y-2">
                <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded-sm shadow-sm" />
                <p className="text-[10px] uppercase tracking-widest" style={{ color: ADMIN_COLORS.mocha }}>
                  {formData.image_url ? "✓ Uploaded" : "Click to change"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={24} style={{ color: ADMIN_COLORS.mocha }} />
                <p className="text-sm" style={{ color: ADMIN_COLORS.mocha }}>Drag & drop or click to upload</p>
                <p className="text-[10px]" style={{ color: ADMIN_COLORS.mocha }}>Uploads to Supabase Storage</p>
              </div>
            )}
          </div>

          {formData.image_url && (
            <p className="text-[10px] break-all" style={{ color: ADMIN_COLORS.mocha }}>
              URL: {formData.image_url.slice(0, 60)}…
            </p>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Name</label>
            <input 
              type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-2.5 text-sm bg-transparent border outline-none focus:border-black transition-colors"
              style={{ borderColor: ADMIN_COLORS.border }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Category</label>
            <input 
              type="text" required list="categories-datalist" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full p-2.5 text-sm bg-transparent border outline-none focus:border-black transition-colors"
              style={{ borderColor: ADMIN_COLORS.border }}
            />
            <datalist id="categories-datalist">
              {['Minimalist', 'Japan', 'Cozy', 'Nature', 'Pastel', 'Anime', 'Sunset', 'Architecture', 'Couple', 'Calm', 'Aesthetic'].map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Price ($)</label>
            <input 
              type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="w-full p-2.5 text-sm bg-transparent border outline-none focus:border-black transition-colors"
              style={{ borderColor: ADMIN_COLORS.border }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} />
            <span className="text-sm" style={{ color: ADMIN_COLORS.text }}>Featured Wallpaper</span>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              disabled={isPending} 
              className="flex-1 py-3 text-xs uppercase tracking-widest text-white bg-black hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {editingId ? 'Update' : 'Save Wallpaper'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 border text-xs uppercase tracking-widest transition-colors hover:bg-black/5" style={{ borderColor: ADMIN_COLORS.border, color: ADMIN_COLORS.text }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Wallpaper Grid */}
      <div className="lg:col-span-2">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[9/16] animate-pulse rounded-sm" style={{ backgroundColor: ADMIN_COLORS.card }} />)}
          </div>
        ) : (wallpapers ?? []).length === 0 ? (
          <div className="p-12 text-center" style={{ color: ADMIN_COLORS.mocha }}>
            <ImageIcon className="mx-auto mb-4 opacity-30" size={32} />
            <p>No wallpapers yet. Upload your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wallpapers?.map(wp => (
              <div key={wp.id} className="group relative border rounded-sm overflow-hidden flex flex-col" style={{ borderColor: ADMIN_COLORS.border, backgroundColor: ADMIN_COLORS.card }}>
                <div className="aspect-[9/16] relative bg-black/5">
                  {wp.image_url ? (
                    <img src={wp.image_url} alt={wp.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="opacity-20" size={32} /></div>
                  )}
                  {wp.featured && (
                    <div className="absolute top-2 left-2 bg-black text-white text-[9px] uppercase tracking-wider px-2 py-0.5">Featured</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => { setFormData(wp as any); setEditingId(wp.id); setPreviewUrl(wp.image_url); }} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200">
                      <Edit2 size={14} className="text-black" />
                    </button>
                    <button onClick={() => handleDelete(wp.id)} className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center hover:bg-gray-200">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-serif leading-tight truncate text-sm" style={{ color: ADMIN_COLORS.text }}>{wp.name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: ADMIN_COLORS.mocha }}>${wp.price}</p>
                  </div>
                  <Switch checked={wp.featured} onCheckedChange={() => toggleFeatured(wp)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Orders Tab
// ---------------------------------------------------------------------------

function OrdersTab() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-center text-[#9E8E78]">Loading orders...</div>;

  const handleStatus = (id: string, status: string) => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success("Order status updated");
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this order?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Order deleted");
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  return (
    <div className="rounded-sm border overflow-hidden" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
      {(orders ?? []).length === 0 ? (
        <div className="p-12 text-center" style={{ color: ADMIN_COLORS.mocha }}>
          <ShoppingBag className="mx-auto mb-4 opacity-50" size={32} />
          <p>No orders yet. Orders from Stripe checkout will appear here.</p>
        </div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: ADMIN_COLORS.border, color: ADMIN_COLORS.mocha }}>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Amount</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <React.Fragment key={order.id}>
                <tr className="border-b last:border-0 hover:bg-black/5 cursor-pointer transition-colors" style={{ borderColor: ADMIN_COLORS.border }} onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                  <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 truncate max-w-[140px]">{order.customer_email}</td>
                  <td className="px-4 py-3 capitalize">{order.product}</td>
                  <td className="px-4 py-3">${Number(order.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'refunded' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2" onClick={e => e.stopPropagation()}>
                    <select 
                      value={order.status} 
                      onChange={e => handleStatus(order.id, e.target.value)}
                      className="bg-transparent border rounded px-1 py-1 text-xs"
                      style={{ borderColor: ADMIN_COLORS.border }}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700 inline-block align-middle ml-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr className="bg-black/5 border-b" style={{ borderColor: ADMIN_COLORS.border }}>
                    <td colSpan={6} className="px-4 py-4 space-y-2 text-xs" style={{ color: ADMIN_COLORS.mocha }}>
                      <p><strong>Order ID:</strong> {order.id}</p>
                      <p><strong>Full Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bundles Tab  (columns: is_popular, is_active)
// ---------------------------------------------------------------------------

function BundlesTab() {
  const queryClient = useQueryClient();
  const { data: bundles, isLoading } = useListBundles({ query: { queryKey: getListBundlesQueryKey() } });
  const createMutation = useCreateBundle();
  const updateMutation = useUpdateBundle();
  const deleteMutation = useDeleteBundle();

  const emptyForm = { name: "", description: "", wallpaper_count: 5, price: 15, is_popular: false, is_active: true };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          toast.success("Bundle updated");
          queryClient.invalidateQueries({ queryKey: getListBundlesQueryKey() });
          setEditingId(null); setFormData(emptyForm);
        },
        onError: (err: any) => toast.error(`Failed: ${err.message}`)
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          toast.success("Bundle created");
          queryClient.invalidateQueries({ queryKey: getListBundlesQueryKey() });
          setFormData(emptyForm);
        },
        onError: (err: any) => toast.error(`Failed: ${err.message}`)
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete bundle?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Bundle deleted");
        queryClient.invalidateQueries({ queryKey: getListBundlesQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="p-8 text-center" style={{ color: ADMIN_COLORS.mocha }}>Loading bundles...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {bundles?.map(bundle => (
            <div key={bundle.id} className="p-6 rounded-sm border relative" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
              {!bundle.is_active && <div className="absolute top-0 right-0 bg-black/10 text-xs px-2 py-1 rounded-bl">Inactive</div>}
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-serif text-xl italic" style={{ color: ADMIN_COLORS.text }}>{bundle.name}</h4>
                <span className="text-lg">${bundle.price}</span>
              </div>
              <p className="text-sm mb-4" style={{ color: ADMIN_COLORS.mocha }}>{bundle.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-1 text-xs border rounded-full" style={{ borderColor: ADMIN_COLORS.border, color: ADMIN_COLORS.text }}>{bundle.wallpaper_count} Wallpapers</span>
                {bundle.is_popular && <span className="px-2 py-1 text-xs bg-[#D4C5B0] text-black rounded-full">Popular</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setFormData({ name: bundle.name, description: bundle.description, wallpaper_count: bundle.wallpaper_count, price: bundle.price, is_popular: bundle.is_popular, is_active: bundle.is_active }); setEditingId(bundle.id); }} className="px-3 py-1.5 text-xs bg-black text-white hover:bg-black/80 transition-colors uppercase tracking-wider rounded-sm">Edit</button>
                <button onClick={() => handleDelete(bundle.id)} className="px-3 py-1.5 text-xs border text-red-600 hover:bg-red-50 transition-colors uppercase tracking-wider rounded-sm" style={{ borderColor: ADMIN_COLORS.border }}>Delete</button>
              </div>
            </div>
          ))}
          {(bundles ?? []).length === 0 && (
            <div className="col-span-3 p-12 text-center" style={{ color: ADMIN_COLORS.mocha }}>
              <Package className="mx-auto mb-4 opacity-30" size={32} />
              <p>No bundles yet. Create your first one below.</p>
            </div>
          )}
        </div>
      )}

      <div className="p-6 border rounded-sm max-w-xl" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
        <h3 className="font-serif text-xl mb-4 italic" style={{ color: ADMIN_COLORS.text }}>{editingId ? 'Edit Bundle' : 'Add New Bundle'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 bg-transparent border outline-none h-20" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Price ($)</label>
              <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full p-2 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Wallpaper Count</label>
              <input type="number" required value={formData.wallpaper_count} onChange={e => setFormData({...formData, wallpaper_count: parseInt(e.target.value)})} className="w-full p-2 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={formData.is_popular} onCheckedChange={v => setFormData({...formData, is_popular: v})} /> <span className="text-sm" style={{ color: ADMIN_COLORS.mocha }}>Popular</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /> <span className="text-sm" style={{ color: ADMIN_COLORS.mocha }}>Active</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isPending} className="py-2 px-6 bg-black text-white text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-2">
              {isPending && <Loader2 size={12} className="animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="py-2 px-6 border text-black text-xs uppercase tracking-widest" style={{ borderColor: ADMIN_COLORS.border }}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Promos Tab  (column: is_active)
// ---------------------------------------------------------------------------

function PromosTab() {
  const queryClient = useQueryClient();
  const { data: promos, isLoading } = useListPromos({ query: { queryKey: getListPromosQueryKey() } });
  const createMutation = useCreatePromo();
  const updateMutation = useUpdatePromo();
  const deleteMutation = useDeletePromo();

  const emptyForm = { code: "", discount_type: "percent", discount_value: 10, max_uses: "", expires_at: "", is_active: true };
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { 
      code: formData.code.toUpperCase(), 
      discount_type: formData.discount_type as "percent" | "fixed", 
      discount_value: parseFloat(formData.discount_value as any),
      is_active: formData.is_active
    };
    if (formData.max_uses) payload.max_uses = parseInt(formData.max_uses);
    if (formData.expires_at) payload.expires_at = new Date(formData.expires_at).toISOString();

    createMutation.mutate({ data: payload }, {
      onSuccess: () => {
        toast.success("Promo code created");
        queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() });
        setFormData(emptyForm);
      },
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  const toggleActive = (promo: { id: string; is_active: boolean }) => {
    updateMutation.mutate({ id: promo.id, data: { is_active: !promo.is_active } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() }),
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete promo code?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Promo code deleted");
        queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed: ${err.message}`)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 p-6 rounded-sm border sticky top-8" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
        <h3 className="font-serif italic text-xl mb-4" style={{ color: ADMIN_COLORS.text }}>Create Promo Code</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Code</label>
            <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-2 bg-transparent border outline-none font-mono uppercase" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Type</label>
              <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} className="w-full p-2 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }}>
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Value</label>
              <input type="number" step="any" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value as any})} className="w-full p-2 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Max Uses (Opt)</label>
              <input type="number" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} className="w-full p-2 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Expires (Opt)</label>
              <input type="datetime-local" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} className="w-full p-2 bg-transparent border outline-none text-xs" style={{ borderColor: ADMIN_COLORS.border }} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} /> <span className="text-sm" style={{ color: ADMIN_COLORS.mocha }}>Active</span>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
            {createMutation.isPending && <Loader2 size={12} className="animate-spin" />}
            Create Code
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 rounded-sm border overflow-hidden" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
        {isLoading ? (
          <div className="p-8 text-center" style={{ color: ADMIN_COLORS.mocha }}>Loading promos...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: ADMIN_COLORS.border, color: ADMIN_COLORS.mocha }}>
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Discount</th>
                <th className="px-4 py-3 font-normal">Uses</th>
                <th className="px-4 py-3 font-normal">Expires</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos?.map(promo => (
                <tr key={promo.id} className="border-b last:border-0 transition-opacity" style={{ borderColor: ADMIN_COLORS.border, opacity: promo.is_active ? 1 : 0.5 }}>
                  <td className="px-4 py-3"><span className="font-mono bg-black/5 px-2 py-1 rounded tracking-wider">{promo.code}</span></td>
                  <td className="px-4 py-3">{promo.discount_type === 'percent' ? `${promo.discount_value}%` : `$${promo.discount_value}`}</td>
                  <td className="px-4 py-3">{promo.uses_count} / {promo.max_uses ?? '∞'}</td>
                  <td className="px-4 py-3">{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <Switch checked={promo.is_active} onCheckedChange={() => toggleActive(promo)} />
                      <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(promos ?? []).length === 0 && <tr><td colSpan={5} className="py-8 text-center" style={{ color: ADMIN_COLORS.mocha }}>No promo codes created.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Tab
// ---------------------------------------------------------------------------

function SettingsTab() {
  const queryClient = useQueryClient();
  const { data: settingsData, isLoading } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const saveMutation = useSaveSettings();
  
  const [settings, setSettings] = useState<Record<string, string>>({
    shop_name: "WALLPAPER.MINIMAL",
    tagline: "Dress your screen, softly.",
    contact_email: "",
    instagram_url: "",
    twitter_url: "",
    single_price: "4",
    pack_price: "22",
    full_access_price: "45",
    announcement_text: "Free worldwide shipping on all downloads",
    show_announcement: "true"
  });

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings(prev => ({ ...prev, ...settingsData }));
    }
  }, [settingsData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ data: settings }, {
      onSuccess: () => {
        toast.success("Settings saved");
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: (err: any) => toast.error(`Failed to save: ${err.message}`)
    });
  };

  const updateSetting = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  if (isLoading) return <div className="p-8 text-center" style={{ color: ADMIN_COLORS.mocha }}>Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8 p-8 border rounded-sm" style={{ backgroundColor: ADMIN_COLORS.card, borderColor: ADMIN_COLORS.border }}>
      <div className="space-y-4">
        <h3 className="font-serif italic text-2xl border-b pb-2" style={{ color: ADMIN_COLORS.text, borderColor: ADMIN_COLORS.border }}>Brand Info</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Shop Name</label>
            <input type="text" value={settings.shop_name} onChange={e => updateSetting('shop_name', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Tagline</label>
            <input type="text" value={settings.tagline} onChange={e => updateSetting('tagline', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Contact Email</label>
            <input type="email" value={settings.contact_email} onChange={e => updateSetting('contact_email', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif italic text-2xl border-b pb-2" style={{ color: ADMIN_COLORS.text, borderColor: ADMIN_COLORS.border }}>Social Links</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Instagram URL</label>
            <input type="url" value={settings.instagram_url} onChange={e => updateSetting('instagram_url', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Twitter URL</label>
            <input type="url" value={settings.twitter_url} onChange={e => updateSetting('twitter_url', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif italic text-2xl border-b pb-2" style={{ color: ADMIN_COLORS.text, borderColor: ADMIN_COLORS.border }}>Global Pricing Defaults</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Single Item ($)</label>
            <input type="number" value={settings.single_price} onChange={e => updateSetting('single_price', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Pack ($)</label>
            <input type="number" value={settings.pack_price} onChange={e => updateSetting('pack_price', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Full Access ($)</label>
            <input type="number" value={settings.full_access_price} onChange={e => updateSetting('full_access_price', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif italic text-2xl border-b pb-2" style={{ color: ADMIN_COLORS.text, borderColor: ADMIN_COLORS.border }}>Announcement Bar</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: ADMIN_COLORS.mocha }}>Text</label>
            <input type="text" value={settings.announcement_text} onChange={e => updateSetting('announcement_text', e.target.value)} className="w-full p-2.5 bg-transparent border outline-none" style={{ borderColor: ADMIN_COLORS.border }} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={settings.show_announcement === "true"} onCheckedChange={v => updateSetting('show_announcement', v ? "true" : "false")} />
            <span className="text-sm" style={{ color: ADMIN_COLORS.text }}>Show announcement bar on site</span>
          </div>
        </div>
      </div>

      <button type="submit" disabled={saveMutation.isPending} className="py-4 px-8 bg-black text-white text-xs uppercase tracking-[3px] hover:bg-black/80 transition-colors w-full md:w-auto disabled:opacity-50 flex items-center gap-2">
        {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
        Save All Settings
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Admin Component
// ---------------------------------------------------------------------------

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "minimal2025";
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      toast.error("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md p-10 bg-[#F7F5F2] rounded-sm border border-[#E8E4DF] shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif italic" style={{ color: ADMIN_COLORS.text }}>WALLPAPER.MINIMAL</h1>
            <p className="text-xs uppercase tracking-widest mt-2" style={{ color: ADMIN_COLORS.mocha }}>Admin Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: ADMIN_COLORS.mocha }}>Master Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white border border-[#E8E4DF] focus:border-black outline-none transition-colors text-center tracking-widest"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-black text-white text-xs uppercase tracking-[3px] hover:bg-black/80 transition-colors rounded-[2px]"
            >
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wallpapers", label: "Wallpapers", icon: ImageIcon },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "bundles", label: "Bundles", icon: Package },
    { id: "promos", label: "Promo Codes", icon: Tag },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r flex-shrink-0 bg-[#F7F5F2]" style={{ borderColor: ADMIN_COLORS.border }}>
        <div className="p-6 md:p-8">
          <h1 className="text-xl font-serif italic" style={{ color: ADMIN_COLORS.text }}>Admin</h1>
        </div>
        <nav className="px-4 md:px-6 space-y-1 pb-8 flex flex-row overflow-x-auto md:flex-col md:overflow-visible">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-sm transition-colors text-sm whitespace-nowrap ${
                  isActive ? 'bg-black text-white' : 'hover:bg-black/5 text-[#1A1A1A]'
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-[#9E8E78]"} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-6 mt-auto hidden md:block">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-[#9E8E78] hover:text-black transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-end">
            <h2 className="text-3xl font-serif italic" style={{ color: ADMIN_COLORS.text }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="md:hidden flex items-center gap-2 text-sm text-[#9E8E78]"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="min-h-[500px]">
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "wallpapers" && <WallpapersTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "bundles" && <BundlesTab />}
            {activeTab === "promos" && <PromosTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
