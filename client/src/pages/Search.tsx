import { Button } from "@/components/ui/button";
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
  
  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [videoDuration, setVideoDuration] = useState<"any" | "short" | "medium" | "long">("any");
  const [videoDefinition, setVideoDefinition] = useState<"any" | "high" | "standard">("any");
  const [videoDimension, setVideoDimension] = useState<"any" | "2d" | "3d">("any");
  const [videoEmbeddable, setVideoEmbeddable] = useState<"any" | "true">("any");
  const [videoLicense, setVideoLicense] = useState<"any" | "creativeCommon" | "youtube">("any");
  const [videoType, setVideoType] = useState<"any" | "episode" | "movie">("any");
  const [safeSearch, setSafeSearch] = useState<"moderate" | "none" | "strict">("moderate");

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

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error(t('enterApiKey'));
      return;
    }

    const params: any = {
      q: query.trim(),
      type,
      order,
      maxResults: 50,
    };

    // Add advanced filters only if they're not 'any'
    if (videoDuration !== 'any') params.videoDuration = videoDuration;
    if (videoDefinition !== 'any') params.videoDefinition = videoDefinition;
    if (videoDimension !== 'any') params.videoDimension = videoDimension;
    if (videoEmbeddable !== 'any') params.videoEmbeddable = videoEmbeddable;
    if (videoLicense !== 'any') params.videoLicense = videoLicense;
    if (videoType !== 'any') params.videoType = videoType;
    if (safeSearch !== 'moderate') params.safeSearch = safeSearch;

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

  const copyLink = (id: string, itemType: string) => {
    let url = "";
    if (itemType === "video") {
      url = `https://www.youtube.com/watch?v=${id}`;
    } else if (itemType === "channel") {
      url = `https://www.youtube.com/channel/${id}`;
    } else if (itemType === "playlist") {
      url = `https://www.youtube.com/playlist?list=${id}`;
    }
    navigator.clipboard.writeText(url);
    toast.success(t('linkCopied'));
  };

  const canLoadMore = nextPageToken && !maxReached && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">{t('search')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SearchIcon className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('filterBy')}</label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">{t('videoType')}</SelectItem>
                    <SelectItem value="channel">{t('channelType')}</SelectItem>
                    <SelectItem value="playlist">{t('playlistType')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('sortBy')}</label>
                <Select value={order} onValueChange={(v: any) => setOrder(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t('sortRelevance')}</SelectItem>
                    <SelectItem value="date">{t('sortDate')}</SelectItem>
                    <SelectItem value="rating">{t('sortRating')}</SelectItem>
                    <SelectItem value="viewCount">{t('sortViewCount')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('safeSearch')}</label>
                <Select value={safeSearch} onValueChange={(v: any) => setSafeSearch(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderate">{t('safeSearchModerate')}</SelectItem>
                    <SelectItem value="none">{t('safeSearchNone')}</SelectItem>
                    <SelectItem value="strict">{t('safeSearchStrict')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {t('advancedFilters')}
              {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('duration')}</label>
                  <Select value={videoDuration} onValueChange={(v: any) => setVideoDuration(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('durationAny')}</SelectItem>
                      <SelectItem value="short">{t('durationShort')}</SelectItem>
                      <SelectItem value="medium">{t('durationMedium')}</SelectItem>
                      <SelectItem value="long">{t('durationLong')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('definition')}</label>
                  <Select value={videoDefinition} onValueChange={(v: any) => setVideoDefinition(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('definitionAny')}</SelectItem>
                      <SelectItem value="high">{t('definitionHigh')}</SelectItem>
                      <SelectItem value="standard">{t('definitionStandard')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('dimension')}</label>
                  <Select value={videoDimension} onValueChange={(v: any) => setVideoDimension(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('dimensionAny')}</SelectItem>
                      <SelectItem value="2d">{t('dimension2d')}</SelectItem>
                      <SelectItem value="3d">{t('dimension3d')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('embeddable')}</label>
                  <Select value={videoEmbeddable} onValueChange={(v: any) => setVideoEmbeddable(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('embeddableAny')}</SelectItem>
                      <SelectItem value="true">{t('embeddableTrue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('license')}</label>
                  <Select value={videoLicense} onValueChange={(v: any) => setVideoLicense(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('licenseAny')}</SelectItem>
                      <SelectItem value="youtube">{t('licenseYoutube')}</SelectItem>
                      <SelectItem value="creativeCommon">{t('licenseCreativeCommon')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('videoTypeFilter')}</label>
                  <Select value={videoType} onValueChange={(v: any) => setVideoType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('videoTypeAny')}</SelectItem>
                      <SelectItem value="episode">{t('videoTypeEpisode')}</SelectItem>
                      <SelectItem value="movie">{t('videoTypeMovie')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && allResults.length === 0 && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {allResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {t('searchResults')} ({totalLoaded} {t('resultsCount')})
              </h2>
              {maxReached && (
                <span className="text-sm text-muted-foreground">{t('allLoaded')} (500 max)</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResults.map((item: any, index: number) => (
                <Card key={`${item.id.videoId || item.id.channelId || item.id.playlistId}-${index}`} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                  <CardContent className="p-0">
                    {item.snippet.thumbnails?.medium?.url && (
                      <div className="relative aspect-video w-full bg-muted">
                        <img
                          src={item.snippet.thumbnails.medium.url}
                          alt={item.snippet.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                        {item.snippet.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.snippet.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyLink(
                            item.id.videoId || item.id.channelId || item.id.playlistId,
                            item.id.kind.split('#')[1]
                          )}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {t('copyLink')}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const url = item.id.videoId
                              ? `https://www.youtube.com/watch?v=${item.id.videoId}`
                              : item.id.channelId
                              ? `https://www.youtube.com/channel/${item.id.channelId}`
                              : `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
                            toast.info(t('downloadInBot') + ': ' + url);
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {t('downloadInBot')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {canLoadMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loadingMore')}
                    </>
                  ) : (
                    t('loadMore')
                  )}
                </Button>
              </div>
            )}

            {!canLoadMore && totalLoaded > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {maxReached ? `${t('allLoaded')} (500 max)` : t('allLoaded')}
              </div>
            )}
          </div>
        )}

        {allResults.length === 0 && !isLoading && searchParams && (
          <div className="text-center py-12 text-muted-foreground">
            {t('noResults')}
          </div>
        )}
      </main>
    </div>
  );
}
