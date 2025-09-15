export type Mood = 'happy' | 'ok' | 'sick' | 'sos';
export type Activity = 'idle' | 'eating' | 'playing' | 'sleeping' | 'goingToSleep';

export type Decoration = never;

export interface PetState {
  id: number;
  name: string;
  type: 'clownfish' | 'basslet';
  age: number; // in hours
  hunger: number; // 0-100
  happiness: number; // 0-100
  health: number; // 0-100
  cleanliness: number; // 0-100
  energy: number; // 0-100
  mood: Mood;
  activity: Activity;
  lastFed: number;
  lastPlayed: number;
  lastCleaned: number;
  lastSlept: number;
  lastBubbleAt: number;
  lastAteAt: number;
  lastToyInteraction?: number;
  isAlive: boolean;
  isSleeping: boolean;
  sleepProgress?: number; // For fade animation
  // Fish movement properties
  x: number;
  y: number;
  vx: number;
  vy: number;
  target: { x: number; y: number; isFood?: boolean, isToy?: boolean, isFriend?: boolean } | null;
  facing: number; // visual scale for horizontal flip
  phase: number;
  rotation: number;
  state: 'swimming';
  scale: number;
}

export interface Food {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: 'falling' | 'sinking' | 'settled';
  life: number;
  color: string;
}

export interface Poop {
  id: number;
  x: number;
  y: number;
}

export interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  a: number;
}

export interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  life: number;
}

export interface Sprite {
  img: HTMLImageElement | null;
  fw: number;
  fh: number;
  isReady: boolean;
}