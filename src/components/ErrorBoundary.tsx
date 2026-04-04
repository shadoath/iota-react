'use client'

import React, { Component, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.icon}>:(</div>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.message}>
            An unexpected error occurred. Your game progress may be lost,
            but you can try reloading.
          </p>
          <button className={styles.retryBtn} onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
