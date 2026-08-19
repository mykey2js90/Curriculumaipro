import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX } from "lucide-react";

export default function NewsletterAnalytics() {
  const { user } = useAuth();
  const { data, isLoading } = trpc.newsletter.analytics.useQuery(undefined, { enabled: user?.role === "admin" });

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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-8">Newsletter Analytics</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-32 rounded-xl"/>)}</div>
        ) : data ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Total Subscribers", value: data.total, icon: Users, color: "text-blue-500" },
              { label: "Active Subscribers", value: data.active, icon: UserCheck, color: "text-green-500" },
              { label: "Unsubscribed", value: data.inactive, icon: UserX, color: "text-red-500" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className={"w-5 h-5 " + stat.color} />
                </CardHeader>
                <CardContent><p className="text-3xl font-bold">{stat.value}</p></CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
