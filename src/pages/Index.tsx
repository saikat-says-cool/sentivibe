import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to SentiVibe</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Unlock insights from YouTube comments with AI-powered sentiment analysis.
        </p>
        <Button asChild size="lg">
          <Link to="/analyze">Start Analyzing a Video</Link>
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;