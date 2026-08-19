import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TIER_COLORS: Record<string, string> = { bronze: "bg-orange-100 text-orange-800", silver: "bg-gray-100 text-gray-800", gold: "bg-yellow-100 text-yellow-800", platinum: "bg-blue-100 text-blue-800" };

export default function AdminSponsors() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: sponsors, isLoading } = trpc.sponsors.listAll.useQuery(undefined, { enabled: user?.role === "admin" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", logoUrl: "", websiteUrl: "", description: "", tier: "bronze" as "bronze" | "silver" | "gold" | "platinum" });

  const createMutation = trpc.sponsors.create.useMutation({
    onSuccess: () => { toast.success("Sponsor created!"); utils.sponsors.listAll.invalidate(); setOpen(false); setForm({ name: "", logoUrl: "", websiteUrl: "", description: "", tier: "bronze" }); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.sponsors.update.useMutation({
    onSuccess: () => { toast.success("Sponsor updated!"); utils.sponsors.listAll.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <main className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Access denied.</p></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold">Sponsors</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-1.5"><Plus className="w-4 h-4" />Add Sponsor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Sponsor</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Logo URL</Label><Input value={form.logoUrl} onChange={(e) => setForm({...form, logoUrl: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Website URL</Label><Input value={form.websiteUrl} onChange={(e) => setForm({...form, websiteUrl: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Tier</Label>
                  <Select value={form.tier} onValueChange={(v) => setForm({...form, tier: v as typeof form.tier})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["bronze","silver","gold","platinum"].map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name}>
                  {createMutation.isPending ? "Creating..." : "Create Sponsor"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-20 w-full"/>)}</div>
        ) : sponsors && sponsors.length > 0 ? (
          <div className="space-y-4">
            {sponsors.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-4">
                    {s.logoUrl && <img src={s.logoUrl} alt={s.name} className="w-10 h-10 object-contain rounded" />}
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      {s.websiteUrl && <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{s.websiteUrl}</a>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + (TIER_COLORS[s.tier] || "")}>{s.tier}</span>
                    <div className="text-xs text-muted-foreground text-right">
                      <p>{s.impressions} impressions</p>
                      <p>{s.clicks} clicks</p>
                    </div>
                    <Button variant={s.isActive ? "outline" : "default"} size="sm" onClick={() => updateMutation.mutate({ id: s.id, isActive: !s.isActive })}>
                      {s.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No sponsors yet. Add your first sponsor above.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
