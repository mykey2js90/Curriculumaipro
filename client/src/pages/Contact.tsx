import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast.success("Message sent! We will get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3"><MessageSquare className="w-9 h-9 text-primary" />Contact Us</h1>
          <p className="text-muted-foreground text-lg">Have a question or feedback? We would love to hear from you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-1.5"><Label htmlFor="subject">Subject</Label><Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
                  <div className="space-y-1.5"><Label htmlFor="message">Message</Label><Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
                  <Button type="submit" className="w-full" disabled={sending}>{sending ? "Sending..." : "Send Message"}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card><CardContent className="pt-6"><Mail className="w-6 h-6 text-primary mb-2" /><h3 className="font-semibold mb-1">Email</h3><p className="text-sm text-muted-foreground">support@curriculumaipro.com</p></CardContent></Card>
            <Card><CardContent className="pt-6"><MessageSquare className="w-6 h-6 text-primary mb-2" /><h3 className="font-semibold mb-1">Response Time</h3><p className="text-sm text-muted-foreground">We typically respond within 24 hours on business days.</p></CardContent></Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
