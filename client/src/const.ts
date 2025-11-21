export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Translations
export const translations = {
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    videos: 'Videos',
    channels: 'Channels',
    playlists: 'Playlists',
    comments: 'Comments',
    subscriptions: 'Subscriptions',
    settings: 'Settings',
    
    // API Key Management
    apiKeyTitle: 'YouTube API Key',
    apiKeyDescription: 'Connect your YouTube API key to access all features',
    enterApiKey: 'Enter your YouTube API key',
    apiKeyPlaceholder: 'AIzaSy...',
    connectApiKey: 'Connect API Key',
    reconnectApiKey: 'Reconnect API Key',
    deleteApiKey: 'Delete API Key',
    apiKeyConnected: 'API Key Connected',
    apiKeyNotConnected: 'No API Key Connected',
    validatingApiKey: 'Validating API key...',
    apiKeyValid: 'API key is valid',
    apiKeyInvalid: 'Invalid API key',
    
    // Search
    searchPlaceholder: 'Search videos, channels, playlists...',
    searchButton: 'Search',
    searchResults: 'Search Results',
    noResults: 'No results found',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    videoType: 'Video',
    channelType: 'Channel',
    playlistType: 'Playlist',
    loadMore: 'Load More',
    loadingMore: 'Loading...',
    allLoaded: 'All results loaded',
    resultsCount: 'results',
    
    // Advanced filters
    advancedFilters: 'Advanced Filters',
    duration: 'Duration',
    durationAny: 'Any',
    durationShort: 'Short (< 4 min)',
    durationMedium: 'Medium (4-20 min)',
    durationLong: 'Long (> 20 min)',
    definition: 'Definition',
    definitionAny: 'Any',
    definitionHigh: 'HD',
    definitionStandard: 'SD',
    dimension: 'Dimension',
    dimensionAny: 'Any',
    dimension2d: '2D',
    dimension3d: '3D',
    embeddable: 'Embeddable',
    embeddableAny: 'Any',
    embeddableTrue: 'Yes',
    license: 'License',
    licenseAny: 'Any',
    licenseYoutube: 'Standard YouTube',
    licenseCreativeCommon: 'Creative Commons',
    videoTypeFilter: 'Video Type',
    videoTypeAny: 'Any',
    videoTypeEpisode: 'Episode',
    videoTypeMovie: 'Movie',
    safeSearch: 'Safe Search',
    safeSearchModerate: 'Moderate',
    safeSearchNone: 'None',
    safeSearchStrict: 'Strict',
    sortRelevance: 'Relevance',
    sortDate: 'Date',
    sortRating: 'Rating',
    sortViewCount: 'View Count',
    relevance: 'Relevance',
    date: 'Date',
    rating: 'Rating',
    viewCount: 'View Count',
    publishedAfter: 'Upload Date',
    lastHour: 'Last Hour',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    any: 'Any',
    episode: 'Episode',
    movie: 'Movie',
    copied: 'Copied to clipboard',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // Video
    videoViews: 'views',
    videoLikes: 'likes',
    videoComments: 'comments',
    channelSubscribers: 'subscribers',
    channelVideos: 'videos',
    
    // Actions
    copyLink: 'Copy Link',
    downloadInBot: 'Download in Bot',
    linkCopied: 'Link copied to clipboard',
  },
  ru: {
    // Navigation
    home: 'Главная',
    search: 'Поиск',
    videos: 'Видео',
    channels: 'Каналы',
    playlists: 'Плейлисты',
    comments: 'Комментарии',
    subscriptions: 'Подписки',
    settings: 'Настройки',
    
    // API Key Management
    apiKeyTitle: 'API-ключ YouTube',
    apiKeyDescription: 'Подключите свой API-ключ YouTube для доступа ко всем функциям',
    enterApiKey: 'Введите ваш API-ключ YouTube',
    apiKeyPlaceholder: 'AIzaSy...',
    connectApiKey: 'Подключить API-ключ',
    reconnectApiKey: 'Переподключить API-ключ',
    deleteApiKey: 'Удалить API-ключ',
    apiKeyConnected: 'API-ключ подключен',
    apiKeyNotConnected: 'API-ключ не подключен',
    validatingApiKey: 'Проверка API-ключа...',
    apiKeyValid: 'API-ключ действителен',
    apiKeyInvalid: 'Недействительный API-ключ',
    
    // Search
    searchPlaceholder: 'Поиск видео, каналов, плейлистов...',
    searchButton: 'Поиск',
    searchResults: 'Результаты поиска',
    noResults: 'Результаты не найдены',
    filterBy: 'Фильтр',
    sortBy: 'Сортировка',
    videoType: 'Видео',
    channelType: 'Канал',
    playlistType: 'Плейлист',
    loadMore: 'Загрузить ещё',
    loadingMore: 'Загрузка...',
    allLoaded: 'Все результаты загружены',
    resultsCount: 'результатов',
    
    // Advanced filters
    advancedFilters: 'Расширенные фильтры',
    duration: 'Продолжительность',
    durationAny: 'Любая',
    durationShort: 'Короткие (< 4 мин)',
    durationMedium: 'Средние (4-20 мин)',
    durationLong: 'Длинные (> 20 мин)',
    definition: 'Качество',
    definitionAny: 'Любое',
    definitionHigh: 'HD',
    definitionStandard: 'SD',
    dimension: 'Измерение',
    dimensionAny: 'Любое',
    dimension2d: '2D',
    dimension3d: '3D',
    embeddable: 'Встраиваемое',
    embeddableAny: 'Любое',
    embeddableTrue: 'Да',
    license: 'Лицензия',
    licenseAny: 'Любая',
    licenseYoutube: 'Стандартная YouTube',
    licenseCreativeCommon: 'Creative Commons',
    videoTypeFilter: 'Тип видео',
    videoTypeAny: 'Любой',
    videoTypeEpisode: 'Эпизод',
    videoTypeMovie: 'Фильм',
    safeSearch: 'Безопасный поиск',
    safeSearchModerate: 'Умеренный',
    safeSearchNone: 'Отключен',
    safeSearchStrict: 'Строгий',
    sortRelevance: 'По релевантности',
    sortDate: 'По дате',
    sortRating: 'По рейтингу',
    sortViewCount: 'По просмотрам',
    relevance: 'По релевантности',
    date: 'По дате загрузки',
    rating: 'По рейтингу',
    viewCount: 'По числу просмотров',
    publishedAfter: 'По дате загрузки',
    lastHour: 'За последний час',
    today: 'Сегодня',
    thisWeek: 'За эту неделю',
    thisMonth: 'За этот месяц',
    thisYear: 'За этот год',
    any: 'Любое',
    episode: 'Эпизод',
    movie: 'Фильм',
    copied: 'Скопировано в буфер обмена',
    
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Изменить',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущая',
    
    // Video
    videoViews: 'просмотров',
    videoLikes: 'лайков',
    videoComments: 'комментариев',
    channelSubscribers: 'подписчиков',
    channelVideos: 'видео',
    
    // Actions
    copyLink: 'Копировать ссылку',
    downloadInBot: 'Скачать в боте',
    linkCopied: 'Ссылка скопирована в буфер обмена',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
