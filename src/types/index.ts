import type { VideoConfig, SequenceProps } from 'remotion';
import type { Video, Img, Audio } from 'remotion';
import React from 'react';

export type ClipType = 'video' | 'image' | 'audio';

export type ClipPropsMap = {
  video: React.ComponentProps<typeof Video>;
  image: React.ComponentProps<typeof Img>;
  audio: React.ComponentProps<typeof Audio>;
};

export type Clip<T extends ClipType = ClipType> = {
  id: string;
  type: T;
  sequenceProps: Omit<SequenceProps, 'children'>;
  mediaProps: ClipPropsMap[T];
};

export interface Track {
  id: string;
  name: string;
  clips: Clip<any>[];
}

export interface RemotionProjectJson extends Pick<VideoConfig, 'fps' | 'durationInFrames' | 'width' | 'height'> {
  tracks: Track[];
}
