import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.get.useQuery({ slug: slug ?? "" }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </main><Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog"><Button variant="outline">Back to Blog</Button></Link>
        </main><Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8 gap-1.5 -ml-2"><ArrowLeft className="w-4 h-4" />Back to Blog</Button>
        </Link>
        {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-8" />}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          {post.authorName && <span className="font-medium text-foreground">{post.authorName}</span>}
          {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.publishedAt).toLocaleDateString()}</span>}
          {post.readingTimeMinutes && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readingTimeMinutes} min read</span>}
        </div>
        <article className="prose prose-neutral max-w-none">
          <Streamdown>{post.content}</Streamdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}
