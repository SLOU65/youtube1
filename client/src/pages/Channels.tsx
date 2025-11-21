import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Loader2, Search, Users, Video, Eye, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

function ChannelVideos({ channelId }: { channelId: string }) {
  const { t } = useTranslation();
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [allVideos, setAllVideos] = useState<any[]>([]);

  const { data: videosData, isLoading, isFetching } = trpc.youtube.getChannelVideos.useQuery(
    { channelId, pageToken },
    { enabled: !!channelId }
  );

  // Update allVideos when new data arrives
  useEffect(() => {
    if (videosData?.items) {
      if (pageToken) {
        // Append new videos when loading more
        setAllVideos(prev => [...prev, ...videosData.items]);
      } else {
        // Replace all videos on first load
        setAllVideos(videosData.items);
      }
    }
  }, [videosData, pageToken]);

  const handleLoadMore = () => {
    if (videosData?.nextPageToken) {
      setPageToken(videosData.nextPageToken);
    }
  };

  const copyVideoLink = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard.writeText(url);
    toast.success(t('linkCopied'));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!allVideos.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('noResults')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allVideos.map((video: any) => (
          <Card key={video.id.videoId} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative w-full h-40 bg-muted overflow-hidden">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-foreground line-clamp-2">
                  {video.snippet.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {video.snippet.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyVideoLink(video.id.videoId)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t('copy')}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const url = `https://www.youtube.com/watch?v=${video.id.videoId}`;
                      window.open(url, '_blank');
                    }}
                  >
                    {t('watch')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videosData?.nextPageToken && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2" />
            )}
            {t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Channels() {
  const { t } = useTranslation();
  const [channelId, setChannelId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data: channelData, isLoading } = trpc.youtube.getChannel.useQuery(
    { channelId: searchId },
    { enabled: !!searchId }
  );

  const extractChannelId = (input: string): string => {
    const trimmed = input.trim();
    
    // Если уже ID (начинается с UC и имеет 24 символа)
    if (trimmed.startsWith('UC') && trimmed.length === 24) {
      return trimmed;
    }
    
    // Извлечение из URL youtube.com/channel/ID
    const channelMatch = trimmed.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]{24})/);
    if (channelMatch) return channelMatch[1];
    
    // Извлечение из URL youtube.com/@username
    const atMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/);
    if (atMatch) {
      // Для @username нужно использовать forUsername вместо ID
      return `@${atMatch[1]}`;
    }
    
    // Извлечение из URL youtube.com/c/name
    const cMatch = trimmed.match(/youtube\.com\/c\/([a-zA-Z0-9_.-]+)/);
    if (cMatch) {
      return `@${cMatch[1]}`;
    }
    
    // Если ничего не совпадает, вернуть как есть (может быть прямой ID)
    return trimmed;
  };

  const handleSearch = () => {
    const id = extractChannelId(channelId);
    if (id) {
      setSearchId(id);
    }
  };

  const copyLink = (id: string) => {
    const url = `https://www.youtube.com/channel/${id}`;
    navigator.clipboard.writeText(url);
    toast.success(t('linkCopied'));
  };

  const formatNumber = (num: string) => {
    const n = parseInt(num);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  };

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
            <h1 className="text-xl font-bold text-foreground">{t('channels')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Channel ID, URL, or @username"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!channelId.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !channelData?.items?.length && searchId && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noResults')}</p>
          </div>
        )}

        {channelData && channelData.items && channelData.items.length > 0 && (
          <div className="space-y-6">
            {channelData.items.map((channel: any) => (
              <div key={channel.id} className="space-y-6">
                {/* Channel Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Banner */}
                    {channel.brandingSettings?.image?.bannerExternalUrl && (
                      <div className="relative w-full h-32 md:h-48 bg-muted">
                        <img
                          src={channel.brandingSettings.image.bannerExternalUrl}
                          alt="Channel banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-6">
                      {/* Channel Info */}
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={channel.snippet.thumbnails.medium.url}
                              alt={channel.snippet.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2 min-w-0">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground break-words">
                              {channel.snippet.title}
                            </h2>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {channel.snippet.description}
                            </p>
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4 text-sm">
                          {channel.statistics && (
                            <>
                              <div className="flex flex-col items-center gap-1 p-3 bg-card rounded border border-border">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground text-center">{formatNumber(channel.statistics.subscriberCount)}</span>
                                <span className="text-xs text-muted-foreground text-center">{t('subscribers')}</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 p-3 bg-card rounded border border-border">
                                <Video className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground text-center">{formatNumber(channel.statistics.videoCount)}</span>
                                <span className="text-xs text-muted-foreground text-center">{t('videos')}</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 p-3 bg-card rounded border border-border">
                                <Eye className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground text-center">{formatNumber(channel.statistics.viewCount)}</span>
                                <span className="text-xs text-muted-foreground text-center">{t('views')}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          onClick={() => copyLink(channel.id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {t('copyLink')}
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => {
                            const url = `https://www.youtube.com/channel/${channel.id}`;
                            window.open(url, '_blank');
                          }}
                        >
                          {t('viewOnYouTube')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Channel Videos */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">{t('channelVideos')}</h3>
                  <ChannelVideos channelId={channel.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {channelData && channelData.items && channelData.items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('noResults')}
          </div>
        )}
      </main>
    </div>
  );
}
