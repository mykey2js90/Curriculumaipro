import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="prose prose-neutral max-w-none text-foreground space-y-6">
          <section><h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2><p className="text-muted-foreground">By accessing or using CurriculumAI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">2. Use of Service</h2><p className="text-muted-foreground">You may use CurriculumAI for lawful purposes only. You agree not to use the service to generate content that is harmful, deceptive, or violates any applicable laws.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">3. Intellectual Property</h2><p className="text-muted-foreground">The curricula you generate using CurriculumAI are yours to use. CurriculumAI retains rights to the platform, underlying models, and technology.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">4. Subscriptions and Payments</h2><p className="text-muted-foreground">Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel at any time; cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">5. Disclaimer of Warranties</h2><p className="text-muted-foreground">CurriculumAI is provided as-is without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2><p className="text-muted-foreground">To the maximum extent permitted by law, CurriculumAI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2><p className="text-muted-foreground">We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p></section>
          <section><h2 className="text-xl font-semibold mb-2">8. Contact</h2><p className="text-muted-foreground">For questions about these terms, contact us at support@curriculumaipro.com.</p></section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
