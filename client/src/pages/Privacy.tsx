import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="prose prose-neutral max-w-none text-foreground space-y-6">
          <section><h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2><p className="text-muted-foreground">We collect information you provide directly to us, such as your name and email address when you create an account or subscribe to our newsletter. We also collect usage data including curricula you generate, pages you visit, and features you use.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2><p className="text-muted-foreground">We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional and promotional communications, and comply with legal obligations.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2><p className="text-muted-foreground">We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our platform, including payment processors (Stripe) and analytics providers.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">4. Data Retention</h2><p className="text-muted-foreground">We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">5. Security</h2><p className="text-muted-foreground">We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">6. Your Rights</h2><p className="text-muted-foreground">Depending on your location, you may have rights to access, correct, or delete your personal information. Contact us at support@curriculumaipro.com to exercise these rights.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">7. Contact</h2><p className="text-muted-foreground">For privacy-related questions, contact us at support@curriculumaipro.com.</p></section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
