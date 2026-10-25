import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-6">
          <div className="bg-[#131b26] border border-rose-500/40 max-w-lg w-full rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white">Simulation Engine Error</h2>
            <p className="text-sm text-slate-400 mt-2">
              An unexpected rendering or domain error occurred. The simulator state has been protected.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-3 bg-black/40 rounded-lg text-xs text-rose-300 font-mono text-left overflow-x-auto max-h-36">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Simulator
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
