import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface SentimentDelta {
  video_a_sentiment: string;
  video_b_sentiment: string;
  delta_description: string | { theme: string; weight: string; explanation: string } | null | undefined;
}

interface EmotionalTone {
  emotion: string;
  video_a_frequency: number;
  video_b_frequency: number;
  comparison: string;
}

interface TopThemesIntersection {
  common_themes: string[];
  unique_to_video_a: string[];
  unique_to_video_b: string[];
  summary_shift: string;
}

interface ComparisonData {
  sentiment_delta?: SentimentDelta;
  emotional_tone_breakdown?: EmotionalTone[];
  top_themes_intersection?: TopThemesIntersection;
  weighted_influence_shift?: string;
  keyword_diff_summary?: string;
}

interface ComparisonDataDisplayProps {
  data: ComparisonData;
}

const ComparisonDataDisplay: React.FC<ComparisonDataDisplayProps> = ({ data }) => {
  if (!data) {
    return <p className="text-muted-foreground">No comparison data available.</p>;
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">{sentiment}</Badge>;
      case 'negative':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">{sentiment}</Badge>;
      case 'neutral':
        return <Badge variant="secondary">{sentiment}</Badge>;
      default:
        return <Badge>{sentiment}</Badge>;
    }
  };

  // This function MUST always return a string.
  const renderDeltaDescription = (deltaDescription: SentimentDelta['delta_description']): string => {
    if (deltaDescription === null || deltaDescription === undefined) {
      return ''; // Explicitly return empty string for null/undefined
    }
    if (typeof deltaDescription === 'object') {
      // If it's an object, try to get 'explanation', otherwise stringify the whole object
      if ('explanation' in deltaDescription && typeof deltaDescription.explanation === 'string') {
        return deltaDescription.explanation;
      }
      // Fallback to stringifying the entire object if 'explanation' is missing or not a string
      try {
        return JSON.stringify(deltaDescription);
      } catch (e) {
        console.error("Failed to stringify delta_description object:", deltaDescription, e);
        return 'Invalid description object';
      }
    }
    // For any other type (string, number, boolean), convert to string
    return String(deltaDescription);
  };

  // This function can return ReactNode (which includes null or ReactElement)
  const getDeltaIcon = (deltaDescription: SentimentDelta['delta_description']): React.ReactNode => {
    if (deltaDescription === null || deltaDescription === undefined) {
      return null; // No icon for null/undefined
    }
    // Use the same logic as renderDeltaDescription to get a string representation for comparison
    const descriptionText = renderDeltaDescription(deltaDescription); // Always get a string here

    if (descriptionText.toLowerCase().includes('increase') || descriptionText.toLowerCase().includes('positive shift')) {
      return <ArrowUp className="h-4 w-4 text-green-500 inline-block mr-1" />;
    }
    if (descriptionText.toLowerCase().includes('decline') || descriptionText.toLowerCase().includes('negative shift')) {
      return <ArrowDown className="h-4 w-4 text-red-500 inline-block mr-1" />;
    }
    return <Minus className="h-4 w-4 text-gray-500 inline-block mr-1" />;
  };

  return (
    <div className="space-y-6">
      {data.sentiment_delta && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sentiment Delta Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Video A overall sentiment: {getSentimentBadge(data.sentiment_delta.video_a_sentiment)}
            </p>
            <p>
              Video B overall sentiment: {getSentimentBadge(data.sentiment_delta.video_b_sentiment)}
            </p>
            <p className="font-semibold flex items-center">
              {getDeltaIcon(data.sentiment_delta.delta_description)} {renderDeltaDescription(data.sentiment_delta.delta_description)}
            </p>
          </CardContent>
        </Card>
      )}

      {data.emotional_tone_breakdown && data.emotional_tone_breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Emotional Tone Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.emotional_tone_breakdown.map((tone, index) => (
                <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                  <span className="font-medium capitalize">{tone.emotion}:</span>
                  <p className="text-sm text-muted-foreground ml-2">{tone.comparison}</p>
                  <p className="text-xs text-muted-foreground ml-2">
                    (Video A: {(tone.video_a_frequency * 100).toFixed(0)}%, Video B: {(tone.video_b_frequency * 100).toFixed(0)}%)
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data.top_themes_intersection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Top Themes Intersection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.top_themes_intersection.common_themes && data.top_themes_intersection.common_themes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Themes in both videos:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.top_themes_intersection.common_themes.map((theme, index) => (
                    <Badge key={index} variant="default">{theme}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.top_themes_intersection.unique_to_video_a && data.top_themes_intersection.unique_to_video_a.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Unique to Video A:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.top_themes_intersection.unique_to_video_a.map((theme, index) => (
                    <Badge key={index} variant="outline">{theme}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.top_themes_intersection.unique_to_video_b && data.top_themes_intersection.unique_to_video_b.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Unique to Video B:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.top_themes_intersection.unique_to_video_b.map((theme, index) => (
                    <Badge key={index} variant="outline">{theme}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.top_themes_intersection.summary_shift && (
              <p className="italic text-muted-foreground mt-2">{data.top_themes_intersection.summary_shift}</p>
            )}
          </CardContent>
        </Card>
      )}

      {data.weighted_influence_shift && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Weighted Influence Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.weighted_influence_shift}</p>
          </CardContent>
        </Card>
      )}

      {data.keyword_diff_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Keyword Difference Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.keyword_diff_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonDataDisplay;