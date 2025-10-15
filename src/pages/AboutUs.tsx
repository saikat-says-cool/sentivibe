import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

const AboutUs = () => {
  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "About Us - SentiVibe: Your Audience, Understood.";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-background text-foreground">
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">About SentiVibe</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p className="text-lg text-muted-foreground mb-4">
            At SentiVibe, our mission is to decode the voice of the crowd, transforming unstructured online reactions into clear, actionable insight. We empower data-driven content creators, marketers, and researchers to truly understand audience reception and public opinion on YouTube.
          </p>
          <p className="text-muted-foreground">
            SentiVibe is an AI-powered insight platform that transforms unstructured video comments into a living, interactive intelligence hub. Unlike static sentiment analysis tools and manual comment review, we provide a dynamic, conversational AI that answers your specific questions, automates the creation of SEO-optimized content from its findings, and ensures insights are always fresh and relevant.
          </p>
          <p className="text-muted-foreground">
            We focus on **unrivaled clarity and depth**, ensuring you hear the most influential voices, not just the loudest, through weighted sentiment analysis and multi-video comparisons. Our **generous insight tool** approach means you get real value, right now, for free, with unlimited questions and AI interactions on any plan.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Thank you for choosing SentiVibe to help you see what the crowd really feels. Then ask it anything.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUs;