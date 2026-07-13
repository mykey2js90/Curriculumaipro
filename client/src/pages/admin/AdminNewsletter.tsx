import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function AdminNewsletter() {
  const { user } = useAuth();
  const { data: subscribers, isLoading } = trpc.newsletter.list.useQuery({ activeOnly: false }, { enabled: user?.role === "admin" });

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
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          {subscribers && <Badge variant="secondary">{subscribers.length} total</Badge>}
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div>
            ) : subscribers && subscribers.length > 0 ? (
              <div className="divide-y divide-border">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium">{sub.email}</p>
                      {sub.name && <p className="text-xs text-muted-foreground">{sub.name}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={sub.isActive ? "default" : "secondary"} className="text-xs">{sub.isActive ? "Active" : "Unsubscribed"}</Badge>
                      <p className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">No subscribers yet.</div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
