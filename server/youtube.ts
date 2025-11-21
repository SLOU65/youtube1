import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeSearchParams {
  q?: string;
  type?: 'video' | 'channel' | 'playlist';
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long' | 'any';
  videoDefinition?: 'high' | 'standard' | 'any';
  videoDimension?: '2d' | '3d' | 'any';
  videoEmbeddable?: 'true' | 'any';
  videoLicense?: 'creativeCommon' | 'youtube' | 'any';
  videoSyndicated?: 'true' | 'any';
  videoType?: 'episode' | 'movie' | 'any';
  videoCategoryId?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  safeSearch?: 'moderate' | 'none' | 'strict';
  maxResults?: number;
  pageToken?: string;
}

export class YouTubeAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}${endpoint}`, {
        params: {
          ...params,
          key: this.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`YouTube API Error: ${error.response.data.error?.message || error.message}`);
      }
      throw error;
    }
  }

  // Search
  async search(params: YouTubeSearchParams) {
    const searchParams: Record<string, any> = {
      part: 'snippet',
      maxResults: params.maxResults || 50,
    };

    // Add all optional parameters
    if (params.q) searchParams.q = params.q;
    if (params.type) searchParams.type = params.type;
    if (params.order) searchParams.order = params.order;
    if (params.publishedAfter) searchParams.publishedAfter = params.publishedAfter;
    if (params.publishedBefore) searchParams.publishedBefore = params.publishedBefore;
    if (params.videoDuration && params.videoDuration !== 'any') searchParams.videoDuration = params.videoDuration;
    if (params.videoDefinition && params.videoDefinition !== 'any') searchParams.videoDefinition = params.videoDefinition;
    if (params.videoDimension && params.videoDimension !== 'any') searchParams.videoDimension = params.videoDimension;
    if (params.videoEmbeddable && params.videoEmbeddable !== 'any') searchParams.videoEmbeddable = params.videoEmbeddable;
    if (params.videoLicense && params.videoLicense !== 'any') searchParams.videoLicense = params.videoLicense;
    if (params.videoSyndicated && params.videoSyndicated !== 'any') searchParams.videoSyndicated = params.videoSyndicated;
    if (params.videoType && params.videoType !== 'any') searchParams.videoType = params.videoType;
    if (params.videoCategoryId) searchParams.videoCategoryId = params.videoCategoryId;
    if (params.regionCode) searchParams.regionCode = params.regionCode;
    if (params.relevanceLanguage) searchParams.relevanceLanguage = params.relevanceLanguage;
    if (params.safeSearch) searchParams.safeSearch = params.safeSearch;
    if (params.pageToken) searchParams.pageToken = params.pageToken;

    return this.request('/search', searchParams);
  }

  // Videos
  async getVideo(videoId: string) {
    return this.request('/videos', {
      part: 'snippet,contentDetails,statistics,status',
      id: videoId,
    });
  }

  async getVideos(videoIds: string[]) {
    return this.request('/videos', {
      part: 'snippet,contentDetails,statistics,status',
      id: videoIds.join(','),
    });
  }

  async getMostPopularVideos(regionCode: string = 'US', maxResults: number = 25) {
    return this.request('/videos', {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode,
      maxResults,
    });
  }

  async updateVideo(videoId: string, snippet: any, status?: any) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Video update requires OAuth2 authentication');
  }

  async deleteVideo(videoId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Video deletion requires OAuth2 authentication');
  }

  async rateVideo(videoId: string, rating: 'like' | 'dislike' | 'none') {
    // Note: This requires OAuth2, not just API key
    throw new Error('Video rating requires OAuth2 authentication');
  }

  // Channels
  async getChannel(channelId: string) {
    return this.request('/channels', {
      part: 'snippet,contentDetails,statistics,brandingSettings',
      id: channelId,
    });
  }

  async getChannelsByUsername(username: string) {
    return this.request('/channels', {
      part: 'snippet,contentDetails,statistics',
      forUsername: username,
    });
  }

  // Playlists
  async getPlaylist(playlistId: string) {
    return this.request('/playlists', {
      part: 'snippet,contentDetails,status',
      id: playlistId,
    });
  }

  async getPlaylistItems(playlistId: string, maxResults?: number, pageToken?: string) {
    const params: Record<string, any> = {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: maxResults || 50,
    };
    if (pageToken) params.pageToken = pageToken;
    return this.request('/playlistItems', params);
  }

  async createPlaylist(title: string, description: string, privacyStatus: 'public' | 'private' | 'unlisted') {
    // Note: This requires OAuth2, not just API key
    throw new Error('Playlist creation requires OAuth2 authentication');
  }

  async updatePlaylist(playlistId: string, title: string, description: string, privacyStatus: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Playlist update requires OAuth2 authentication');
  }

  async deletePlaylist(playlistId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Playlist deletion requires OAuth2 authentication');
  }

  async addVideoToPlaylist(playlistId: string, videoId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Adding video to playlist requires OAuth2 authentication');
  }

  async removeVideoFromPlaylist(playlistItemId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Removing video from playlist requires OAuth2 authentication');
  }

  // Comments
  async getVideoComments(videoId: string, maxResults: number = 100, pageToken?: string) {
    return this.request('/commentThreads', {
      part: 'snippet,replies',
      videoId,
      maxResults,
      pageToken,
      textFormat: 'plainText',
    });
  }

  async getCommentReplies(parentId: string, maxResults: number = 100, pageToken?: string) {
    return this.request('/comments', {
      part: 'snippet',
      parentId,
      maxResults,
      pageToken,
      textFormat: 'plainText',
    });
  }

  async createComment(channelId: string, videoId: string, text: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Comment creation requires OAuth2 authentication');
  }

  async replyToComment(parentId: string, text: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Comment reply requires OAuth2 authentication');
  }

  async updateComment(commentId: string, text: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Comment update requires OAuth2 authentication');
  }

  async deleteComment(commentId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Comment deletion requires OAuth2 authentication');
  }

  // Search channel videos
  async searchChannelVideos(channelId: string, maxResults: number = 12, pageToken?: string) {
    const params: Record<string, any> = {
      part: 'snippet',
      type: 'video',
      channelId,
      maxResults,
      order: 'date',
    };
    if (pageToken) params.pageToken = pageToken;
    return this.request('/search', params);
  }

  // Subscriptions
  async getSubscriptions(channelId: string, maxResults: number = 50, pageToken?: string) {
    return this.request('/subscriptions', {
      part: 'snippet,contentDetails',
      channelId,
      maxResults,
      pageToken,
    });
  }

  async subscribeToChannel(channelId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Channel subscription requires OAuth2 authentication');
  }

  async unsubscribeFromChannel(subscriptionId: string) {
    // Note: This requires OAuth2, not just API key
    throw new Error('Channel unsubscription requires OAuth2 authentication');
  }

  // Validate API key
  async validateApiKey(): Promise<boolean> {
    try {
      await this.request('/search', {
        part: 'snippet',
        q: 'test',
        maxResults: 1,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
