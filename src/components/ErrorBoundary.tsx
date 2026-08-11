import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndRestart = () => {
    try {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clearing issue:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-5 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg md:text-xl font-black text-slate-900">
                Application Recovered Safely
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                A temporary script mismatch occurred. Tap below to reload the latest DSSSB exam practice data.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left overflow-x-auto max-h-24 text-[10px] text-slate-600 font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload DSSSB App
              </button>

              <button
                onClick={this.handleClearAndRestart}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" /> Clear Local Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
