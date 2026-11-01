import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error('ErrorBoundary caught:', error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="alert alert-warning mb-0">
                    Something went wrong while displaying this section.
                    <button className="btn btn-sm btn-outline-secondary ms-3" onClick={() => this.setState({ hasError: false })}>
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
