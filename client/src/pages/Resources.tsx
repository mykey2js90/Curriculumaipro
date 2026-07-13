import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, FileText, Video, Wrench } from "lucide-react";

const RESOURCES = [
  { category: "Guides", icon: FileText, items: [
    { title: "Instructional Design 101", description: "A beginner guide to designing effective learning experiences.", link: "#", badge: "Free" },
    { title: "Writing Learning Objectives", description: "How to write SMART learning objectives using Bloom Taxonomy.", link: "#", badge: "Free" },
    { title: "Course Structure Best Practices", description: "How to organize modules, lessons, and assessments for maximum retention.", link: "#", badge: "Free" },
  ]},
  { category: "Video Tutorials", icon: Video, items: [
    { title: "Getting Started with CurriculumAI", description: "A 5-minute walkthrough of generating your first curriculum.", link: "#", badge: "Video" },
    { title: "Exporting to Your LMS", description: "How to import your JSON/CSV curriculum into popular LMS platforms.", link: "#", badge: "Video" },
  ]},
  { category: "Tools and Templates", icon: Wrench, items: [
    { title: "Course Outline Template", description: "A ready-to-use Google Docs template for manual curriculum planning.", link: "#", badge: "Template" },
    { title: "Learning Objectives Worksheet", description: "A worksheet to help you define clear, measurable objectives.", link: "#", badge: "Template" },
  ]},
];

export default function Resources() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3"><BookOpen className="w-9 h-9 text-primary" />Resources</h1>
          <p className="text-muted-foreground text-lg">Guides, templates, and tools to help you design better courses.</p>
        </div>
        <div className="space-y-12">
          {RESOURCES.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-5">
                <section.icon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {section.items.map((item) => (
                  <Card key={item.title} className="hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <Badge variant="secondary" className="shrink-0 text-xs">{item.badge}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                      <Button variant="outline" size="sm" className="gap-1.5 w-full" asChild>
                        <a href={item.link}><ExternalLink className="w-3.5 h-3.5" />Access Resource</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
