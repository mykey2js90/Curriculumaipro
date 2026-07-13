import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { BookOpen, Brain, CheckCircle, Clock, Download, GraduationCap, Layers, Sparkles, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const FEATURES = [
  { icon: Brain, title: "AI-Powered Generation", description: "Leverage advanced AI to create comprehensive, structured curricula in seconds." },
  { icon: Layers, title: "Modular Structure", description: "Every curriculum is organized into clear modules with learning objectives and topics." },
  { icon: Clock, title: "Save Hours of Work", description: "What takes days of planning is done in under a minute with CurriculumAI." },
  { icon: Download, title: "Export Anywhere", description: "Download your curriculum as JSON or CSV to use in any LMS or document editor." },
  { icon: Users, title: "For All Educators", description: "Perfect for teachers, corporate trainers, course creators, and instructional designers." },
  { icon: CheckCircle, title: "Structured Learning", description: "Each module includes objectives, topics, and estimated duration for complete clarity." },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Corporate Trainer", text: "CurriculumAI saved me 3 days of planning. The output was professional and ready to use immediately." },
  { name: "James K.", role: "University Professor", text: "I use it to draft semester outlines and then refine them. It has become an essential part of my workflow." },
  { name: "Priya L.", role: "Online Course Creator", text: "Built my entire Udemy course structure in 10 minutes. Absolutely incredible tool." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => { toast.success("You are subscribed!"); setEmail(""); setName(""); },
    onError: (err) => toast.error(err.message || "Subscription failed."),
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, name: name || undefined });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5"><Sparkles className="w-3.5 h-3.5" />AI-Powered Curriculum Design</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">Build Professional Curricula<span className="text-primary block mt-1">in Seconds with AI</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">Stop spending days planning courses. CurriculumAI generates structured, modular course outlines with learning objectives, topics, and timelines instantly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/generate"><Button size="lg" className="gap-2 text-base px-8"><Zap className="w-5 h-5" />Generate Curriculum</Button></Link>
            ) : (
              <a href={getLoginUrl("/generate")}><Button size="lg" className="gap-2 text-base px-8"><Zap className="w-5 h-5" />Get Started Free</Button></a>
            )}
            <Link href="/blog"><Button size="lg" variant="outline" className="gap-2 text-base px-8"><BookOpen className="w-5 h-5" />Read the Blog</Button></Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required. Free tier available.</p>
        </div>
      </section>
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything You Need to Design Great Courses</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">CurriculumAI combines the expertise of instructional design with the speed of AI.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border border-border/60 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><f.icon className="w-5 h-5 text-primary" /></div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{f.description}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold mb-3">Loved by Educators Worldwide</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border border-border/60">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground italic mb-4">{t.text}</p>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="border border-border/60">
              <CardHeader><CardTitle>Free</CardTitle><p className="text-3xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p></CardHeader>
              <CardContent className="space-y-3">
                {["3 curricula per month","Up to 8 modules","JSON export","Email support"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}</div>
                ))}
                <a href={getLoginUrl("/generate")} className="block mt-4"><Button variant="outline" className="w-full">Get Started</Button></a>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              <CardHeader><CardTitle>Pro</CardTitle><p className="text-3xl font-bold">$19<span className="text-base font-normal text-muted-foreground">/mo</span></p></CardHeader>
              <CardContent className="space-y-3">
                {["Unlimited curricula","Up to 20 modules","JSON + CSV export","Priority support","Advanced AI models","Curriculum history"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}</div>
                ))}
                <a href={getLoginUrl("/generate")} className="block mt-4"><Button className="w-full">Start Pro Trial</Button></a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="max-w-xl mx-auto px-4 text-center">
          <GraduationCap className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stay Updated on AI in Education</h2>
          <p className="text-muted-foreground mb-6 text-sm">Get weekly insights on curriculum design, AI tools, and instructional best practices.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <Input type="text" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
            <div className="flex gap-2">
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background" />
              <Button type="submit" disabled={subscribeMutation.isPending}>{subscribeMutation.isPending ? "..." : "Subscribe"}</Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
