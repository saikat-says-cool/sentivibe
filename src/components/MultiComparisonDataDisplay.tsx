import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remarkGfm

interface VideoSummary {
  title: string;
  sentiment: string;
  themes: string[];
}

interface MultiComparisonData {
  overall_sentiment_trend?: string;
  common_emotional_tones?: string[];
  divergent_emotional_tones?: { [key: string]: string[] };
  common_themes?: string[];
  unique_themes?: { [key: string]: string[] };
  summary_insights?: string;
  video_summaries?: VideoSummary[];
}

interface MultiComparisonDataDisplayProps {
  data: MultiComparisonData;
}

const MultiComparisonDataDisplay: React.FC<MultiComparisonDataDisplayProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-muted-foreground">No detailed multi-comparison data available.</p>;
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <Badge className="bg-sentiment-positive hover:bg-sentiment-positive/80 text-white">{sentiment}</Badge>;
      case 'negative':
        return <Badge className="bg-sentiment-negative hover:bg-sentiment-negative/80 text-white">{sentiment}</Badge>;
      case 'neutral':
        return <Badge className="bg-sentiment-neutral hover:bg-sentiment-neutral/80 text-white">{sentiment}</Badge>;
      default:
        return <Badge variant="secondary">{sentiment}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {data.overall_sentiment_trend && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Overall Sentiment Trend</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.overall_sentiment_trend}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {data.common_emotional_tones && data.common_emotional_tones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Common Emotional Tones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.common_emotional_tones.map((tone, index) => (
                <Badge key={index} variant="default">{tone}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.divergent_emotional_tones && Object.keys(data.divergent_emotional_tones).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Divergent Emotional Tones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.divergent_emotional_tones).map(([videoTitle, tones], index) => (
              <div key={index}>
                <h4 className="font-semibold">{videoTitle}:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tones.map((tone, tIndex) => (
                    <Badge key={tIndex} variant="outline">{tone}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.common_themes && data.common_themes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Common Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.common_themes.map((theme, index) => (
                <Badge key={index} variant="default">{theme}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.unique_themes && Object.keys(data.unique_themes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Unique Themes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.unique_themes).map(([videoTitle, themes], index) => (
              <div key={index}>
                <h4 className="font-semibold">{videoTitle}:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {themes.map((theme, tIndex) => (
                    <Badge key={tIndex} variant="outline">{theme}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.summary_insights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Summary Insights</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.summary_insights}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {data.video_summaries && data.video_summaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Individual Video Summaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.video_summaries.map((summary, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-lg mb-1">{summary.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">Sentiment: {getSentimentBadge(summary.sentiment)}</p>
                <div className="flex flex-wrap gap-1">
                  {summary.themes.map((theme, tIndex) => (
                    <Badge key={tIndex} variant="secondary">{theme}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiComparisonDataDisplay;