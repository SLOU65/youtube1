import { useState, useCallback, useMemo } from 'react';
import { translations, Language, TranslationKey } from '@/const';
import { trpc } from '@/lib/trpc';

export function useTranslation() {
  const { data: preferences } = trpc.preferences.get.useQuery();
  const [language, setLanguageState] = useState<Language>((preferences?.language as Language) || 'en');
  
  const setLanguageMutation = trpc.preferences.setLanguage.useMutation();

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      setLanguageState(newLanguage);
      try {
        await setLanguageMutation.mutateAsync({ language: newLanguage });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    },
    [setLanguageMutation]
  );

  return useMemo(
    () => ({
      t,
      language,
      setLanguage,
    }),
    [t, language, setLanguage]
  );
}
