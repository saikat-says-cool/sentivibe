import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Youtube, GitCompare, MessageSquare, BookOpen, Download } from 'lucide-react';
import { useEffect } from 'react';

const HowItWorks = () => {
  useEffect(() => {
    document.title = "How SentiVibe Works - Hands-on Guide";
  }, []);

  const guideSections = [
    {
      title: "Platform Overview",
      description: "Get a quick introduction to SentiVibe's core mission and capabilities.",
      icon: BookOpen,
      link: "/how-it-works/overview",
    },
    {
      title: "Analyze a Single Video",
      description: "A step-by-step guide to performing sentiment analysis on individual YouTube videos.",
      icon: Youtube,
      link: "/how-it-works/analyze-video",
    },
    {
      title: "Compare Multiple Videos",
      description: "Learn how to conduct multi-video comparisons and understand audience sentiment across content.",
      icon: GitCompare,
      link: "/how-it-works/compare-videos",
    },
    {
      title: "Interact with AI Chat",
      description: "Master the context-aware AI chat, personas, and precise response length control.",
      icon: MessageSquare,
      link: "/how-it-works/ai-chat",
    },
    {
      title: "Explore Libraries & AI Copilots",
      description: "Discover how to navigate the analysis and comparison libraries and leverage AI Copilots.",
      icon: BookOpen,
      link: "/how-it-works/libraries",
    },
    {
      title: "Download PDF Reports",
      description: "Understand how to export professional, branded PDF reports of your analyses and comparisons.",
      icon: Download,
      link: "/how-it-works/pdf-export",
    },
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center mb-4">SentiVibe Hands-on Guide</CardTitle>
          <p className="text-lg text-muted-foreground text-center">
            Dive deep into every feature of SentiVibe with our comprehensive guides.
            Learn how to unlock powerful video insights, compare content, and interact with our AI.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guideSections.map((section, index) => (
            <Link to={section.link} key={index} className="block">
              <Card className="h-full flex flex-col justify-between p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <section.icon className="h-8 w-8 text-accent mr-4" />
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground mb-4 flex-grow">{section.description}</p>
                <div className="flex items-center text-accent hover:underline">
                  Read Guide <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HowItWorks;