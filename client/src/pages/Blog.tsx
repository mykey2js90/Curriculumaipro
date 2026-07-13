import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Blog</h1>
          <p className="text-muted-foreground text-lg">Insights on AI, curriculum design, and education.</p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={"/blog/" + post.slug}>
                <Card className="h-full hover:border-primary/40 transition-colors cursor-pointer">
                  {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover rounded-t-xl" />}
                  <CardHeader>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                    <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.publishedAt).toLocaleDateString()}</span>}
                      {post.readingTimeMinutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readingTimeMinutes} min read</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No posts published yet. Check back soon!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
