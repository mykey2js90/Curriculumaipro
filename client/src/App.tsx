import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Spinner } from "@/components/ui/spinner";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Resources = lazy(() => import("./pages/Resources"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCancel = lazy(() => import("./pages/SubscriptionCancel"));
const NewsletterPreferences = lazy(() => import("./pages/NewsletterPreferences"));
const NewsletterAnalytics = lazy(() => import("./pages/admin/NewsletterAnalytics"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminSponsors = lazy(() => import("./pages/admin/AdminSponsors"));
const Generate = lazy(() => import("./pages/Generate"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="w-8 h-8 text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/resources" component={Resources} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/generate" component={Generate} />
        <Route path="/subscription-success" component={SubscriptionSuccess} />
        <Route path="/subscription-cancel" component={SubscriptionCancel} />
        <Route path="/newsletter/preferences" component={NewsletterPreferences} />
        <Route path="/newsletter/analytics" component={NewsletterAnalytics} />
        <Route path="/admin/newsletter" component={AdminNewsletter} />
        <Route path="/admin/sponsors" component={AdminSponsors} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
