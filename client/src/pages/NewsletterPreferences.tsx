import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NewsletterPreferences() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const unsubscribeMutation = trpc.newsletter.unsubscribe.useMutation({
    onSuccess: () => { toast.success("You have been unsubscribed."); setSubmitted(true); },
    onError: (err) => toast.error(err.message || "Failed to unsubscribe."),
  });

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    unsubscribeMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader><Mail className="w-8 h-8 text-primary mb-2" /><CardTitle>Newsletter Preferences</CardTitle></CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-muted-foreground">You have been unsubscribed from the CurriculumAI newsletter. You can re-subscribe at any time from the homepage.</p>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div className="space-y-1.5"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <Button type="submit" variant="destructive" className="w-full" disabled={unsubscribeMutation.isPending}>{unsubscribeMutation.isPending ? "Processing..." : "Unsubscribe"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
