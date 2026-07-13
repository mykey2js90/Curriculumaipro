import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-5" />
          <h1 className="text-3xl font-bold mb-3">You are all set!</h1>
          <p className="text-muted-foreground mb-6">Your CurriculumAI Pro subscription is now active. Start generating unlimited curricula right away.</p>
          <Link href="/generate"><Button size="lg" className="w-full">Start Generating</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
