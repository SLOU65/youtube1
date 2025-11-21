import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTelegram } from "@/hooks/useTelegram";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Key, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TelegramAuth() {
  const { user: telegramUser, isTelegramApp, hapticFeedback } = useTelegram();
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: apiKeyStatus, refetch: refetchApiKeyStatus } = trpc.youtube.hasApiKey.useQuery(
    undefined,
    { enabled: !!telegramUser }
  );

  const saveApiKeyMutation = trpc.youtube.saveApiKey.useMutation({
    onSuccess: () => {
      hapticFeedback('light');
      toast.success(t('apiKeyValid'));
      setApiKey("");
      refetchApiKeyStatus();
      setIsSubmitting(false);
    },
    onError: (error) => {
      hapticFeedback('heavy');
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const deleteApiKeyMutation = trpc.youtube.deleteApiKey.useMutation({
    onSuccess: () => {
      hapticFeedback('light');
      toast.success(t('success'));
      refetchApiKeyStatus();
    },
    onError: (error) => {
      hapticFeedback('heavy');
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

  if (!telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <CardTitle>{t('loading')}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">YouTube Manager</h1>
              <p className="text-xs text-muted-foreground">
                {telegramUser.first_name} {telegramUser.last_name || ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
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
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchApiKeyStatus()}
                    className="w-full"
                  >
                    {t('reconnectApiKey')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteApiKey}
                    disabled={deleteApiKeyMutation.isPending}
                    className="w-full"
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
                    className="font-mono text-sm"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-600 dark:text-blue-400">
                  <p className="font-semibold mb-2">{t('howToGetApiKey')}</p>
                  <ol className="space-y-1 text-xs list-decimal list-inside">
                    <li>{t('step1Title')}</li>
                    <li>{t('step2Title')}</li>
                    <li>{t('step3Title')}</li>
                    <li>{t('step4Title')}</li>
                    <li>{t('step5Title')}</li>
                  </ol>
                </div>

                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSubmitting || !apiKey.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('validatingApiKey')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('connectApiKey')}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        {apiKeyStatus?.hasKey && (
          <div className="grid grid-cols-1 gap-3">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{t('search')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('searchDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">👥</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{t('channels')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('channelsDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
