import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const guideSections = [
  { title: "Platform Overview", path: "/how-it-works/overview" },
  { title: "Analyze a Single Video", path: "/how-it-works/analyze-video" },
  { title: "Compare Multiple Videos", path: "/how-it-works/compare-videos" },
  { title: "Interact with AI Chat", path: "/how-it-works/ai-chat" },
  { title: "Explore Libraries & AI Copilots", path: "/how-it-works/libraries" },
  { title: "Download PDF Reports", path: "/how-it-works/pdf-export" },
];

const HowItWorksSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Card className="w-full md:w-64 flex-shrink-0 p-4 md:sticky md:top-20 md:h-[calc(100vh-80px)] overflow-y-auto bg-sidebar text-sidebar-foreground border-sidebar-border">
      <h3 className="text-lg font-semibold mb-4">Guide Sections</h3>
      <nav className="space-y-2">
        {guideSections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === section.path
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {section.title}
          </Link>
        ))}
      </nav>
    </Card>
  );
};

export default HowItWorksSidebar;