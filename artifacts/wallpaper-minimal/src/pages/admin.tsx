import { useState } from "react";
import { 
  useListWallpapers, 
  useCreateWallpaper, 
  useUpdateWallpaper, 
  useDeleteWallpaper,
  getListWallpapersQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Image as ImageIcon } from "lucide-react";

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "minimal2025";
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      toast.error("Incorrect password");
    }
  };

  const { data: wallpapers, isLoading } = useListWallpapers(
    {}, 
    { query: { queryKey: getListWallpapersQueryKey(), enabled: isAuthenticated } }
  );

  const createMutation = useCreateWallpaper();
  const updateMutation = useUpdateWallpaper();
  const deleteMutation = useDeleteWallpaper();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 4,
    image_url: "",
    featured: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: 4,
      image_url: "",
      featured: false
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            toast.success("Wallpaper updated");
            queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
            resetForm();
          },
          onError: () => toast.error("Failed to update wallpaper")
        }
      );
    } else {
      createMutation.mutate(
        { data: formData },
        {
          onSuccess: () => {
            toast.success("Wallpaper created");
            queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
            resetForm();
          },
          onError: () => toast.error("Failed to create wallpaper")
        }
      );
    }
  };

  const handleEdit = (wallpaper: any) => {
    setFormData({
      name: wallpaper.name,
      category: wallpaper.category,
      price: wallpaper.price,
      image_url: wallpaper.image_url,
      featured: wallpaper.featured
    });
    setEditingId(wallpaper.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this wallpaper?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast.success("Wallpaper deleted");
            queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
          },
          onError: () => toast.error("Failed to delete wallpaper")
        }
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md p-8 bg-card rounded-sm border border-border shadow-sm">
          <h1 className="text-3xl font-serif italic mb-6 text-center">Admin Portal</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-background border border-border focus:border-primary outline-none transition-colors"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground text-xs uppercase tracking-[3px] hover:bg-secondary transition-colors rounded-[2px]"
            >
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif italic">Inventory Management</h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-sm underline text-muted-foreground hover:text-primary"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-sm border border-border sticky top-32">
              <h2 className="text-xl font-serif mb-6">{editingId ? 'Edit Wallpaper' : 'Add New Wallpaper'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2.5 text-sm bg-background border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Minimalist, Japan, Cozy"
                    className="w-full p-2.5 text-sm bg-background border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full p-2.5 text-sm bg-background border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Image URL</label>
                  <input 
                    type="url" 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2.5 text-sm bg-background border border-border focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="featured" className="text-sm cursor-pointer select-none">
                    Feature on Homepage Mockup
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-[3px] hover:bg-secondary transition-colors rounded-[2px]"
                  >
                    {editingId ? 'Update' : 'Save'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="py-3 px-4 border border-primary text-primary text-xs uppercase tracking-[3px] hover:bg-muted transition-colors rounded-[2px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[9/16] bg-muted animate-pulse rounded-sm" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {wallpapers?.map((wallpaper) => (
                  <div key={wallpaper.id} className="group relative bg-card border border-border rounded-sm overflow-hidden flex flex-col">
                    <div className="aspect-[9/16] bg-muted relative">
                      {wallpaper.image_url ? (
                        <img 
                          src={wallpaper.image_url} 
                          alt={wallpaper.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-muted-foreground/30 w-8 h-8" />
                        </div>
                      )}
                      
                      {wallpaper.featured && (
                        <div className="absolute top-2 left-2 bg-secondary text-primary text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">
                          Featured
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-primary text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {wallpaper.category}
                      </div>

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                        <button 
                          onClick={() => handleEdit(wallpaper)}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-secondary hover:text-white transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(wallpaper.id)}
                          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-serif text-lg leading-tight truncate">{wallpaper.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">${wallpaper.price}</p>
                    </div>
                  </div>
                ))}
                
                {wallpapers?.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-sm">
                    No wallpapers found. Create one to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
