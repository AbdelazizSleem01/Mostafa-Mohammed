declare module 'react-player' {
  import { Component } from 'react';

  interface ReactPlayerProps {
    url?: string | string[];
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    stopOnUnmount?: boolean;
    light?: boolean | string;
    playIcon?: React.ReactNode;
    previewTabIndex?: number;
    fallback?: React.ReactNode;
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    config?: {
      youtube?: {
        playerVars?: Record<string, any>;
        embedOptions?: Record<string, any>;
      };
      vimeo?: {
        playerOptions?: Record<string, any>;
      };
      facebook?: {
        appId?: string;
      };
      soundcloud?: {
        options?: Record<string, any>;
      };
      wistia?: {
        options?: Record<string, any>;
      };
      mixcloud?: {
        options?: Record<string, any>;
      };
      dailymotion?: {
        params?: Record<string, any>;
      };
      twitch?: {
        options?: Record<string, any>;
      };
      vidyard?: {
        options?: Record<string, any>;
      };
    };
    onReady?: (player: any) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onEnded?: () => void;
    onError?: (error: any, data?: any) => void;
    onDuration?: (duration: number) => void;
    onSeek?: (seconds: number) => void;
    onProgress?: (state: {
      played: number;
      playedSeconds: number;
      loaded: number;
      loadedSeconds: number;
    }) => void;
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {
    static canPlay(url: string) {
      throw new Error('Method not implemented.');
    }
    seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
    getCurrentTime(): number;
    getDuration(): number;
    getInternalPlayer(key?: string): any;
    showPreview(): void;
  }
}