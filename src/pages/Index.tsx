import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";

function Index() {
  const { session } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-8">
      <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-gray-50">
        SentiVibe
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Unlock the true sentiment behind YouTube comments. Analyze, understand, and gain insights into audience reactions with AI-powered sentiment analysis.
      </p>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
        {session ? (
          <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            <Link to="/analyze-video">Analyze a Video</Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            <Link to="/login">Get Started</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default Index;