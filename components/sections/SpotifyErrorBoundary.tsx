"use client";

import { Component, ReactNode } from "react";
import GlassCard from "@/components/ui/GlassCard";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class SpotifyErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error("Spotify section error", error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <GlassCard className="p-8 text-center">
          <h3 className="text-xl font-semibold text-stone-800">Spotify player unavailable</h3>
          <p className="mt-2 text-stone-500">Please refresh the page or reconnect Spotify.</p>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}
