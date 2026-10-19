import { Component } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

function ErrorFallback({ error, onReset }) {
  const { t } = useTranslation()
  const isDev = import.meta.env.DEV
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>{t('errors.boundaryTitle')}</CardTitle>
          <CardDescription>{t('errors.boundaryBody')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {isDev && error?.message ? (
            <pre className="max-h-40 w-full overflow-auto rounded-md bg-muted p-3 text-start text-xs text-muted-foreground">
              {String(error.message)}
            </pre>
          ) : null}
          <div className="flex gap-2">
            <Button onClick={onReset}>
              <RefreshCw />
              {t('common.retry')}
            </Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              {t('errors.goHome')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Catches render-time crashes below it so one broken subtree can't blank the
 * whole app. Pass `resetKeys` to auto-clear the error when e.g. the route
 * changes.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  componentDidUpdate(prevProps) {
    if (!this.state.error) return
    const prevKeys = prevProps.resetKeys || []
    const nextKeys = this.props.resetKeys || []
    if (prevKeys.length !== nextKeys.length || prevKeys.some((k, i) => k !== nextKeys[i])) {
      this.reset()
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error, this.reset)
      }
      if (this.props.fallback) return this.props.fallback
      return <ErrorFallback error={error} onReset={this.reset} />
    }
    return this.props.children
  }
}
