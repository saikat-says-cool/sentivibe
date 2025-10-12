import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import HowItWorksSidebar from '@/components/HowItWorksSidebar'; // Import the sidebar

const HowItWorks = () => {
  useEffect(() => {
    document.title = "How SentiVibe Works - Hands-on Guide";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6">
      <HowItWorksSidebar /> {/* Render sidebar */}
      <Card className="flex-1 mb-6">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center mb-4">SentiVibe Hands-on Guide</CardTitle>
          <p className="text-lg text-muted-foreground text-center">
            Welcome to the comprehensive guide for SentiVibe. Use the sidebar to navigate through detailed explanations of every feature, optimal usage tips, and architectural insights.
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p className="text-xl font-semibold text-foreground mb-4">
            Select a section from the left sidebar to begin your deep dive into SentiVibe's capabilities.
          </p>
          <p className="text-muted-foreground">
            Each guide is meticulously crafted to ensure you leave no stone unturned in mastering our platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowItWorks;