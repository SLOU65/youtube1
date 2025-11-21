import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Download, Loader2, Search as SearchIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Search() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"video" | "channel" | "playlist">("video");
  const [order, setOrder] = useState<"relevance" | "date" | "rating" | "viewCount">("relevance");
  
  // Simplified filters
  const [showFilters, setShowFilters] = useState(false);
  const [videoDefinition, setVideoDefinition] = useState<"any" | "high" | "standard">("any");
  const [videoType, setVideoType] = useState<"any" | "episode" | "movie">("any");
  const [publishedAfter, setPublishedAfter] = useState<"any" | "hour" | "day" | "week" | "month" | "year">("any");

  const [searchParams, setSearchParams] = useState<any>(null);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [maxReached, setMaxReached] = useState(false);

  const { data: searchData, isLoading, refetch } = trpc.youtube.search.useQuery(
    searchParams || { q: "", maxResults: 50 },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (searchData) {
      if (searchParams?.pageToken) {
        // Loading more results
        setAllResults(prev => [...prev, ...(searchData.items || [])]);
        setTotalLoaded(prev => prev + (searchData.items?.length || 0));
      } else {
        // New search
        setAllResults(searchData.items || []);
        setTotalLoaded(searchData.items?.length || 0);
      }
      setNextPageToken(searchData.nextPageToken || null);
      
      // Check if we reached 500 limit
      if ((totalLoaded + (searchData.items?.length || 0)) >= 500) {
        setMaxReached(true);
      }
    }
  }, [searchData]);

  // Extract ID from URL if user pastes a link
  const extractIdFromUrl = (url: string): string => {
    // YouTube video: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
    const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoMatch) return videoMatch[1];
    
    // YouTube channel: https://www.youtube.com/c/CHANNEL_NAME or https://www.youtube.com/@CHANNEL_NAME
    const channelMatch = url.match(/youtube\.com\/(?:c\/|@)([a-zA-Z0-9_-]+)/);
    if (channelMatch) return channelMatch[1];
    
    // YouTube playlist: https://www.youtube.com/playlist?list=PLAYLIST_ID
    const playlistMatch = url.match(/youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/);
    if (playlistMatch) return playlistMatch[1];
    
    // If no URL pattern matches, return the original string (might be a direct ID)
    return url.trim();
  };

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error(t('enterApiKey'));
      return;
    }

    // Extract ID if user pasted a URL
    const searchQuery = extractIdFromUrl(query);

    const params: any = {
      q: searchQuery,
      type,
      order,
      maxResults: 50,
    };

    // Add filters only if they're not 'any'
    if (videoDefinition !== 'any') params.videoDefinition = videoDefinition;
    if (videoType !== 'any') params.videoType = videoType;
    if (publishedAfter !== 'any') {
      const now = new Date();
      let publishedAfterDate = new Date();
      
      switch (publishedAfter) {
        case 'hour':
          publishedAfterDate.setHours(publishedAfterDate.getHours() - 1);
          break;
        case 'day':
          publishedAfterDate.setDate(publishedAfterDate.getDate() - 1);
          break;
        case 'week':
          publishedAfterDate.setDate(publishedAfterDate.getDate() - 7);
          break;
        case 'month':
          publishedAfterDate.setMonth(publishedAfterDate.getMonth() - 1);
          break;
        case 'year':
          publishedAfterDate.setFullYear(publishedAfterDate.getFullYear() - 1);
          break;
      }
      params.publishedAfter = publishedAfterDate.toISOString();
    }

    setSearchParams(params);
    setAllResults([]);
    setNextPageToken(null);
    setTotalLoaded(0);
    setMaxReached(false);
    
    // Trigger search
    setTimeout(() => refetch(), 100);
  };

  const handleLoadMore = () => {
    if (!nextPageToken || isLoading || maxReached) return;

    setSearchParams({
      ...searchParams,
      pageToken: nextPageToken,
    });
    
    setTimeout(() => refetch(), 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copied'));
  };

  const getResultIcon = (item: any) => {
    if (item.id?.videoId) return <SearchIcon className="w-4 h-4" />;
    if (item.id?.channelId) return <SearchIcon className="w-4 h-4" />;
    if (item.id?.playlistId) return <SearchIcon className="w-4 h-4" />;
    return <SearchIcon className="w-4 h-4" />;
  };

  const getResultUrl = (item: any) => {
    if (item.id?.videoId) return `https://www.youtube.com/watch?v=${item.id.videoId}`;
    if (item.id?.channelId) return `https://www.youtube.com/channel/${item.id.channelId}`;
    if (item.id?.playlistId) return `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
    return '#';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">{t('search')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Search Card */}
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isLoading}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SearchIcon className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {(['video', 'channel', 'playlist'] as const).map((t_type) => (
                <button
                  key={t_type}
                  onClick={() => setType(t_type)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    type === t_type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-foreground hover:bg-accent/80'
                  }`}
                >
                  {t_type === 'video' ? t('videoType') : t_type === 'channel' ? t('channelType') : t('playlistType')}
                </button>
              ))}
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('advancedFilters')}
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('sortBy')}</label>
                  <Select value={order} onValueChange={(value: any) => setOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">{t('relevance')}</SelectItem>
                      <SelectItem value="date">{t('date')}</SelectItem>
                      <SelectItem value="viewCount">{t('viewCount')}</SelectItem>
                      <SelectItem value="rating">{t('rating')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Published After */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('publishedAfter')}</label>
                  <Select value={publishedAfter} onValueChange={(value: any) => setPublishedAfter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('any')}</SelectItem>
                      <SelectItem value="hour">{t('lastHour')}</SelectItem>
                      <SelectItem value="day">{t('today')}</SelectItem>
                      <SelectItem value="week">{t('thisWeek')}</SelectItem>
                      <SelectItem value="month">{t('thisMonth')}</SelectItem>
                      <SelectItem value="year">{t('thisYear')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Video Definition */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('definition')}</label>
                  <Select value={videoDefinition} onValueChange={(value: any) => setVideoDefinition(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('any')}</SelectItem>
                      <SelectItem value="high">{t('definitionHigh')}</SelectItem>
                      <SelectItem value="standard">{t('definitionStandard')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Video Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('videoType')}</label>
                  <Select value={videoType} onValueChange={(value: any) => setVideoType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('any')}</SelectItem>
                      <SelectItem value="episode">{t('episode')}</SelectItem>
                      <SelectItem value="movie">{t('movie')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {allResults.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {totalLoaded} {t('resultsCount')}
            </div>

            <div className="space-y-3">
              {allResults.map((item, idx) => (
                <Card key={idx} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {item.snippet?.thumbnails?.medium && (
                        <img
                          src={item.snippet.thumbnails.medium.url}
                          alt={item.snippet.title}
                          className="w-24 h-24 rounded object-cover flex-shrink-0"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {item.snippet?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.snippet?.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs bg-accent px-2 py-1 rounded">
                            {item.id?.videoId ? 'Video' : item.id?.channelId ? 'Channel' : 'Playlist'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(getResultUrl(item))}
                          className="p-2 hover:bg-accent rounded transition-colors"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={getResultUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-accent rounded transition-colors"
                          title="Open on YouTube"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {!maxReached && nextPageToken && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="w-full py-3 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    {t('loadingMore')}
                  </>
                ) : (
                  t('loadMore')
                )}
              </button>
            )}

            {maxReached && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {t('allLoaded')}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allResults.length === 0 && searchParams && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">{t('noResults')}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
