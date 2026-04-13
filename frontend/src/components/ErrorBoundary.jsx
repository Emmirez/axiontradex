import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '16px 24px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12,
          color: '#f87171',
          fontSize: '0.8rem',
          textAlign: 'center',
        }}>
          Something went wrong loading this section.{' '}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}