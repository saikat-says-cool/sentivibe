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
            At SentiVibe, our mission is to decode the voice of the crowd, transforming unstructured online reactions into clear, actionable insights. We believe in empowering content creators, marketers, and researchers with the tools they need to truly understand their audience.
          </p>
          <p>
            Founded on principles of **insightful, factual, transparent, modern, and minimal** AI, SentiVibe goes beyond surface-level analysis. We leverage advanced artificial intelligence to meticulously analyze YouTube video comments, extracting crucial data on overall sentiment, emotional tones, and key discussion themes.
          </p>
          <p>
            From single video analyses to comprehensive multi-video comparisons, our platform provides detailed reports, generates SEO-optimized blog posts, and offers an interactive, context-aware AI chat. We're committed to continuous innovation, ensuring you always have access to the freshest, most relevant audience insights.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Thank you for choosing SentiVibe to help you see what the crowd really feels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUs;