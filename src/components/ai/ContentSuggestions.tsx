import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  id: string;
  content: string;
  category: string;
  rating: number;
  createdAt: string;
}

interface ContentSuggestionsProps {
  context: string;
  category: string;
  onSelect: (content: string) => void;
}

const ContentSuggestions = ({ context, category, onSelect }: ContentSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("");
  const { toast } = useToast();

  const fetchSuggestions = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('resume-ai-helper', {
        body: {
          section: category,
          context,
          page: pageNum,
          filter,
        }
      });

      if (response.error) throw new Error(response.error.message);

      const newSuggestions = response.data.suggestions || [];
      setSuggestions(prev => pageNum === 1 ? newSuggestions : [...prev, ...newSuggestions]);
      setHasMore(newSuggestions.length === 10); // Assuming 10 items per page
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [context, category, filter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSuggestions(nextPage);
  };

  const handleFeedback = async (suggestionId: string, isPositive: boolean) => {
    try {
      await supabase.functions.invoke('resume-ai-helper', {
        body: {
          action: 'feedback',
          suggestionId,
          feedback: isPositive ? 1 : -1,
        }
      });

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, rating: s.rating + (isPositive ? 1 : -1) }
            : s
        )
      );

      toast({
        title: "Thank you!",
        description: "Your feedback helps improve our suggestions.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="border-b-2 border-black bg-yellow-400">
        <CardTitle className="text-xl font-bold">AI Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <Label htmlFor="filter">Filter Suggestions</Label>
          <Input
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Type to filter..."
            className="border-2 border-black"
          />
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="border-2 border-black p-4">
              <div className="flex justify-between items-start gap-4">
                <p className="flex-1">{suggestion.content}</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(suggestion.id, true)}
                    className="border-2 border-black"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(suggestion.id, false)}
                    className="border-2 border-black"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Rating: {suggestion.rating}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelect(suggestion.content)}
                  className="border-2 border-black"
                >
                  Use This
                </Button>
              </div>
            </Card>
          ))}

          {loading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && hasMore && (
            <Button
              onClick={handleLoadMore}
              className="w-full mt-4 border-2 border-black"
            >
              Load More
            </Button>
          )}

          {!loading && suggestions.length === 0 && (
            <p className="text-center text-gray-500">
              No suggestions found. Try adjusting your filter.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentSuggestions;