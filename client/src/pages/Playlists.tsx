import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Download, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Playlists() {
  const { t } = useTranslation();
  const [playlistId, setPlaylistId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data: playlistData, isLoading } = trpc.youtube.getPlaylistItems.useQuery(
    { playlistId: searchId, maxResults: 50 },
    { enabled: !!searchId }
  );

  const handleSearch = () => {
    if (playlistId.trim()) {
      setSearchId(playlistId.trim());
    }
  };

  const copyLink = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
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
            <h1 className="text-xl font-bold text-foreground">{t('playlists')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Playlist ID (e.g., PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf)"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
                      <button
                onClick={handleSearch}
                disabled={!playlistId.trim() || isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {playlistData && playlistData.items && playlistData.items.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Playlist Videos ({playlistData.items.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlistData.items.map((item: any, index: number) => (
                <Card key={item.id} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                  <CardContent className="p-0">
                    <div className="relative aspect-video w-full bg-muted">
                      <img
                        src={item.snippet.thumbnails.medium.url}
                        alt={item.snippet.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                        {item.snippet.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.snippet.channelTitle}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyLink(item.snippet.resourceId.videoId)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {t('copyLink')}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const url = `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`;
                            toast.info(t('downloadInBot') + ': ' + url);
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {playlistData && playlistData.items && playlistData.items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('noResults')}
          </div>
        )}
      </main>
    </div>
  );
}
