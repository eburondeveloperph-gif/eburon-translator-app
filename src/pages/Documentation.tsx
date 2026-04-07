import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { ArrowLeft, AlertCircle, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SwaggerUI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center space-y-4 bg-zinc-50 rounded-2xl border border-zinc-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-zinc-900">Failed to load documentation</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            There was an error rendering the API documentation. This is often caused by legacy lifecycle methods in the Swagger UI library.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom plugin to render an audio player for components containing audioInput or audioOutput
const AudioPlaybackPlugin = () => {
  const AudioPlayer = ({ base64, label }: { base64: string; label: string }) => (
    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
      <div className="flex items-center gap-2 mb-2">
        <Volume2 className="w-4 h-4 text-indigo-600" />
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{label}</span>
      </div>
      <audio controls src={`data:audio/wav;base64,${base64}`} className="w-full h-10" />
    </div>
  );

  const wrapWithAudio = (Original: any, type: 'Input' | 'Output') => (props: any) => {
    const { content, contentType } = props;
    if (contentType === 'application/json' && content) {
      try {
        const data = JSON.parse(content);
        const audioKey = type === 'Input' ? 'audioInput' : 'audioOutput';
        const label = type === 'Input' ? 'Audio Input Playback' : 'Audio Translation Playback';
        
        if (data[audioKey] && typeof data[audioKey] === 'string' && data[audioKey].length > 10) {
          return (
            <div className="swagger-ui-audio-wrapper">
              <Original {...props} />
              <AudioPlayer base64={data[audioKey]} label={label} />
            </div>
          );
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return <Original {...props} />;
  };

  return {
    wrapComponents: {
      ResponseBody: (Original: any) => wrapWithAudio(Original, 'Output'),
      RequestBody: (Original: any) => wrapWithAudio(Original, 'Input')
    }
  };
};

export default function Documentation() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-[#0a0a0c] text-white p-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">API Documentation</h1>
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            v1.0.0 • OpenAPI 3.0
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-zinc-200 shadow-xl"
        >
          <ErrorBoundary>
            <SwaggerUI url="/openapi" plugins={[AudioPlaybackPlugin]} />
          </ErrorBoundary>
        </motion.div>
      </main>

      <footer className="max-w-5xl mx-auto py-12 px-6 text-center text-zinc-400 text-sm">
        &copy; {new Date().getFullYear()} Eburon AI. All rights reserved.
      </footer>
    </div>
  );
}
