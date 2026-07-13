import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Heart, Lightbulb, Target } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-primary/5 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <GraduationCap className="w-14 h-14 text-primary mx-auto mb-5" />
            <h1 className="text-4xl font-bold mb-4">About CurriculumAI</h1>
            <p className="text-xl text-muted-foreground">We believe every educator deserves world-class tools to design impactful learning experiences.</p>
          </div>
        </section>
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-muted-foreground space-y-4 mb-10">
            <p className="text-lg">CurriculumAI was built by educators and technologists who were frustrated by how long it takes to design a good course. Hours spent outlining modules, writing objectives, and organizing topics — time that could be spent actually teaching.</p>
            <p className="text-lg">We combined the latest advances in AI with deep expertise in instructional design to create a tool that generates professional, structured course curricula in seconds.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Our Mission", text: "Make professional curriculum design accessible to every educator, anywhere in the world." },
              { icon: Lightbulb, title: "Our Approach", text: "Combine AI efficiency with instructional design best practices for outputs that are both fast and pedagogically sound." },
              { icon: Heart, title: "Our Values", text: "We believe in education as a fundamental human right and build tools that lower the barrier to creating great learning." },
            ].map((v) => (
              <Card key={v.title}>
                <CardContent className="pt-6">
                  <v.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
