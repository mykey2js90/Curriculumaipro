import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { BookOpen, CheckCircle, Clock, Download, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CurriculumModule = { moduleNumber: number; title: string; description: string; learningObjectives: string[]; estimatedDuration: string; topics: string[] };
type Curriculum = { courseTitle: string; courseDescription: string; targetAudience: string; prerequisites: string[]; totalDuration: string; modules: CurriculumModule[] };

export default function Generate() {
  const { isAuthenticated } = useAuth();
  const [topic, setTopic] = useState("");
  const [numModules, setNumModules] = useState(8);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);

  const generateMutation = trpc.curriculum.generate.useMutation({
    onSuccess: (data) => { setCurriculum(data as Curriculum); toast.success("Curriculum generated!"); },
    onError: (err) => toast.error(err.message || "Generation failed. Please try again."),
  });

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error("Please enter a topic."); return; }
    generateMutation.mutate({ topic: topic.trim(), numModules, level });
  };

  const downloadJSON = () => {
    if (!curriculum) return;
    const blob = new Blob([JSON.stringify(curriculum, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = curriculum.courseTitle.replace(/\s+/g, "_") + ".json"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!curriculum) return;
    const rows = [["Module", "Title", "Description", "Duration", "Topics", "Objectives"]];
    curriculum.modules.forEach((m) => {
      rows.push([String(m.moduleNumber), m.title, m.description, m.estimatedDuration, m.topics.join("; "), m.learningObjectives.join("; ")]);
    });
    const csv = rows.map((r) => r.map((c) => '"' + c.replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = curriculum.courseTitle.replace(/\s+/g, "_") + ".csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in to Generate Curricula</h1>
            <p className="text-muted-foreground mb-6">Create a free account to start generating AI-powered course curricula.</p>
            <a href={getLoginUrl("/generate")}><Button size="lg">Sign In / Sign Up</Button></a>
          </div>
        </main><Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Sparkles className="w-7 h-7 text-primary" />Generate Curriculum</h1>
          <p className="text-muted-foreground">Enter a topic and let AI build a complete course structure for you.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="topic">Course Topic</Label>
                  <Input id="topic" placeholder="e.g. Introduction to Machine Learning" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Modules: <span className="text-primary font-semibold">{numModules}</span></Label>
                  <Slider min={3} max={20} step={1} value={[numModules]} onValueChange={([v]) => setNumModules(v)} />
                </div>
                <Button className="w-full gap-2" onClick={handleGenerate} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate</>}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {curriculum ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{curriculum.courseTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{curriculum.courseDescription}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={downloadJSON} className="gap-1.5"><Download className="w-4 h-4" />JSON</Button>
                        <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-1.5"><Download className="w-4 h-4" />CSV</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-4 h-4" />{curriculum.totalDuration}</div>
                      <div className="flex items-center gap-1.5 text-muted-foreground"><BookOpen className="w-4 h-4" />{curriculum.modules.length} modules</div>
                    </div>
                    {curriculum.prerequisites.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Prerequisites</p>
                        <div className="flex flex-wrap gap-1">{curriculum.prerequisites.map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  {curriculum.modules.map((mod) => (
                    <Card key={mod.moduleNumber}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Module {mod.moduleNumber}</Badge>
                          <CardTitle className="text-base">{mod.title}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">{mod.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold mb-2">Learning Objectives</p>
                            <ul className="space-y-1">{mod.learningObjectives.map((o, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground"><CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />{o}</li>)}</ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-2">Topics</p>
                            <div className="flex flex-wrap gap-1">{mod.topics.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{mod.estimatedDuration}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl p-12 text-center">
                <div>
                  <Sparkles className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter a topic and click Generate to create your curriculum.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
