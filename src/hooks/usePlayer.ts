import { useState, useRef, useCallback, useEffect } from "react";
import type { Track, WorkSummary, Work } from "../types";

export interface PlayerState {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentWork: WorkSummary | Work | null;
  tracks: Track[];
  currentTime: number;
  duration: number;
  volume: number;
  loop: boolean;
  showFullPlayer: boolean;
}

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef(false);
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTrackIndex: -1,
    currentWork: null,
    tracks: [],
    currentTime: 0,
    duration: 0,
    volume: 75,
    loop: false,
    showFullPlayer: false,
  });

  // Keep loopRef in sync with state
  loopRef.current = state.loop;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume / 100;
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    };
    const onDurationChange = () => {
      setState((s) => ({ ...s, duration: audio.duration || 0 }));
    };
    const onEnded = () => {
      if (loopRef.current) {
        audio.currentTime = 0;
        audio.play();
      } else {
        // Auto-advance to next track
        setState((prev) => {
          if (prev.currentTrackIndex < prev.tracks.length - 1) {
            return { ...prev, currentTrackIndex: prev.currentTrackIndex + 1 };
          }
          return { ...prev, isPlaying: false };
        });
      }
    };
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load and play when track index changes
  useEffect(() => {
    if (
      state.currentTrackIndex >= 0 &&
      state.currentTrackIndex < state.tracks.length &&
      state.currentWork &&
      audioRef.current
    ) {
      const track = state.tracks[state.currentTrackIndex];
      const workPath = state.currentWork.physicalPath;
      const audioPath = `${workPath}/${track.file}`;
      // Tauri asset protocol: encode each path segment but keep slashes
      const assetUrl = window.__TAURI__
        ? `asset://localhost/${audioPath.split("/").map(encodeURIComponent).join("/")}`
        : audioPath;

      audioRef.current.src = assetUrl;

      if (track.start !== undefined) {
        audioRef.current.currentTime = track.start;
      }

      audioRef.current.play().catch(() => {
        // Playback may fail if file doesn't exist
      });
    }
  }, [state.currentTrackIndex, state.tracks, state.currentWork]);

  const play = useCallback(
    (work: WorkSummary | Work, tracks: Track[], trackIndex: number = 0) => {
      setState((prev) => ({
        ...prev,
        currentWork: work,
        tracks,
        currentTrackIndex: trackIndex,
        isPlaying: true,
      }));
    },
    []
  );

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTrackIndex: -1,
      currentWork: null,
      tracks: [],
    }));
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const seekRelative = useCallback((delta: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.duration, audioRef.current.currentTime + delta)
      );
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const v = Math.max(0, Math.min(100, vol));
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
    setState((prev) => ({ ...prev, volume: v }));
  }, []);

  const setLoop = useCallback((loop: boolean) => {
    setState((prev) => ({ ...prev, loop }));
  }, []);

  const nextTrack = useCallback(() => {
    setState((prev) => {
      if (prev.currentTrackIndex < prev.tracks.length - 1) {
        return { ...prev, currentTrackIndex: prev.currentTrackIndex + 1 };
      }
      return prev;
    });
  }, []);

  const prevTrack = useCallback(() => {
    setState((prev) => {
      if (prev.currentTrackIndex > 0) {
        return { ...prev, currentTrackIndex: prev.currentTrackIndex - 1 };
      }
      return prev;
    });
  }, []);

  const setTrackIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentTrackIndex: index }));
  }, []);

  const setShowFullPlayer = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showFullPlayer: show }));
  }, []);

  return {
    state,
    play,
    togglePlay,
    stop,
    seek,
    seekRelative,
    setVolume,
    setLoop,
    nextTrack,
    prevTrack,
    setTrackIndex,
    setShowFullPlayer,
  };
}

// Helper to format seconds to time string
export function formatTime(sec: number): string {
  if (!sec || !isFinite(sec)) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(totalSec: number): string {
  if (!totalSec) return "0:00";
  return formatTime(totalSec);
}
