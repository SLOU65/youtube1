import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Key, Loader2, Search, Video, List, MessageSquare, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: apiKeyStatus, refetch: refetchApiKeyStatus } = trpc.youtube.hasApiKey.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const saveApiKeyMutation = trpc.youtube.saveApiKey.useMutation({
    onSuccess: () => {
      toast.success(t('apiKeyValid'));
      setApiKey("");
      refetchApiKeyStatus();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const deleteApiKeyMutation = trpc.youtube.deleteApiKey.useMutation({
    onSuccess: () => {
      toast.success(t('success'));
      refetchApiKeyStatus();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error(t('enterApiKey'));
      return;
    }

    setIsSubmitting(true);
    saveApiKeyMutation.mutate({ apiKey: apiKey.trim() });
  };

  const handleDeleteApiKey = () => {
    if (confirm(t('deleteApiKey') + '?')) {
      deleteApiKeyMutation.mutate();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">YouTube Manager</CardTitle>
            <CardDescription>
              Manage your YouTube content with powerful API features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>Sign In to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">YouTube Manager</h1>
                <p className="text-xs text-muted-foreground">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              >
                {language === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* API Key Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('apiKeyTitle')}</CardTitle>
                <CardDescription>{t('apiKeyDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeyStatus?.hasKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('apiKeyConnected')}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchApiKeyStatus()}
                    className="flex-1"
                  >
                    {t('reconnectApiKey')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteApiKey}
                    disabled={deleteApiKeyMutation.isPending}
                    className="hidden sm:inline-flex"
                  >
                    {deleteApiKeyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      t('deleteApiKey')
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-5 h-5" />
                  <span>{t('apiKeyNotConnected')}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t('enterApiKey')}</Label>
                  <Input
                    id="apiKey"
                    type="text"
                    placeholder={t('apiKeyPlaceholder')}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSubmitting || !apiKey.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('validatingApiKey')}
                    </>
                  ) : (
                    t('connectApiKey')
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        {apiKeyStatus?.hasKey && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/search">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('search')}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Search videos, channels, playlists
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/playlists">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <List className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('playlists')}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Browse and manage playlists
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/channels">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('channels')}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Explore channels and subscriptions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
