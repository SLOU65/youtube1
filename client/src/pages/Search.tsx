import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Download, Loader2, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Search() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"video" | "channel" | "playlist">("video");
  const [order, setOrder] = useState<"relevance" | "date" | "rating" | "viewCount">("relevance");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading } = trpc.youtube.search.useQuery(
    {
      q: searchQuery,
      type,
      order,
      maxResults: 20,
    },
    {
      enabled: !!searchQuery,
    }
  );

  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="viewCount">View Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {searchResults && searchResults.items && searchResults.items.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {t('searchResults')} ({searchResults.pageInfo?.totalResults || 0})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.items.map((item: any) => (
                <Card key={item.id.videoId || item.id.channelId || item.id.playlistId} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
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
          </div>
        )}

        {searchResults && searchResults.items && searchResults.items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('noResults')}
          </div>
        )}
      </main>
    </div>
  );
}
