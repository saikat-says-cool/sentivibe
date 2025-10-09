import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center p-6 bg-card rounded-lg shadow-lg">
        {/* Replaced image logo with a grand word logo */}
        <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-foreground">SentiVibe</h1>
        <p className="text-xl text-muted-foreground mb-6">
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