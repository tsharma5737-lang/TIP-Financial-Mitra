import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="mobile-container bg-background flex flex-col items-center justify-center min-h-dvh">
      <div className="text-center px-8">
        <div className="w-16 h-16 rounded-2xl gold-shimmer mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          TIP
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The Intelligent Payment
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
