import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutUs = () => {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">About SentiVibe</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p className="text-lg text-muted-foreground mb-4">
            SentiVibe is dedicated to decoding the voice of the crowd, transforming unstructured online reactions into clear, actionable insights.
          </p>
          <p>
            Our mission is to empower content creators, marketers, and researchers with AI-powered tools to understand audience sentiment, emotional tones, and key themes from YouTube video comments. We believe in providing factual, transparent, and modern insights to help you connect with your audience on a deeper level.
          </p>
          <p>
            With SentiVibe, you can analyze individual videos, compare multiple videos, generate SEO-optimized blog posts, and chat with our AI copilot to explore your data. We're constantly evolving to bring you the most insightful and user-friendly experience.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Thank you for being a part of the SentiVibe journey!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUs;