import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Download, Eye, Loader2, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Videos() {
  const { t } = useTranslation();

  const { data: videosData, isLoading } = trpc.youtube.getMostPopular.useQuery({
    regionCode: 'US',
    maxResults: 24,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
            <h1 className="text-xl font-bold text-foreground">{t('videos')}</h1>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {videosData && videosData.items && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videosData.items.map((video: any) => (
              <Card key={video.id} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                <CardContent className="p-0">
                  <div className="relative aspect-video w-full bg-muted">
                    <img
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 space-y-3">
                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                      {video.snippet.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {video.snippet.channelTitle}
                    </p>
                    {video.statistics && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(parseInt(video.statistics.viewCount))}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{formatNumber(parseInt(video.statistics.likeCount || 0))}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{formatNumber(parseInt(video.statistics.commentCount || 0))}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyLink(video.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {t('copyLink')}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const url = `https://www.youtube.com/watch?v=${video.id}`;
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
        )}
      </main>
    </div>
  );
}
