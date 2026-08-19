import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-5" />
          <h1 className="text-3xl font-bold mb-3">Checkout Cancelled</h1>
          <p className="text-muted-foreground mb-6">No worries, your subscription was not charged. You can upgrade whenever you are ready.</p>
          <div className="flex flex-col gap-3">
            <Link href="/generate"><Button size="lg" className="w-full">Continue with Free Plan</Button></Link>
            <Link href="/"><Button variant="outline" size="lg" className="w-full">Back to Home</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
