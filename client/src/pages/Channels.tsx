import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Loader2, Search, Users, Video, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

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
              <Card key={channel.id} className="overflow-hidden">
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
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={channel.snippet.thumbnails.medium.url}
                          alt={channel.snippet.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">
                          {channel.snippet.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {channel.snippet.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {channel.statistics && (
                            <>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{formatNumber(channel.statistics.subscriberCount)} {t('channelSubscribers')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                <span>{formatNumber(channel.statistics.videoCount)} {t('channelVideos')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{formatNumber(channel.statistics.viewCount)} {t('videoViews')}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
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
                        View on YouTube
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
