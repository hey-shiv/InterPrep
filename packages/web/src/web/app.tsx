import { AnimatePresence, motion } from 'framer-motion'
import { Switch, Route, useLocation } from 'wouter'
import { Provider } from './components/provider'
import { pageVariants, slideRight, slideUp } from '../lib/motion'
import { AgentFeedback, RunableBadge } from '@runablehq/website-runtime'
import { AlertTriangle } from 'lucide-react'
import Landing from './pages/index'
import Setup from './pages/setup'
import Calibration from './pages/calibration'
import Interview from './pages/interview'
import Report from './pages/report'

function MobileWarning() {
  return (
    <div className="min-h-screen bg-bg0 flex flex-col items-center justify-center px-8 text-center">
      <AlertTriangle size={48} className="text-warning mb-6" />
      <h1 className="text-display-md text-t1 font-bold mb-4">Desktop Only</h1>
      <p className="text-body-lg text-t2 max-w-sm leading-relaxed">
        The interview requires camera and microphone access.
        Please open this on a desktop browser.
      </p>
      <div className="flex gap-4 mt-8 text-mono-sm text-t3 font-mono">
        {['Chrome', 'Firefox', 'Safari', 'Edge'].map(b => (
          <span key={b} className="bg-bg2 border border-border rounded-chip px-3 py-1">{b}</span>
        ))}
      </div>
    </div>
  )
}

const routeVariants: Record<string, typeof pageVariants> = {
  '/': pageVariants,
  '/setup': slideRight,
  '/calibration': slideRight,
  '/interview': slideRight,
  '/report': slideUp,
}

function AppRoutes() {
  const [location] = useLocation()
  const variants = routeVariants[location] || pageVariants

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Switch location={location}>
          <Route path="/" component={Landing} />
          <Route path="/setup" component={Setup} />
          <Route path="/calibration" component={Calibration} />
          <Route path="/interview" component={Interview} />
          <Route path="/report" component={Report} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (isMobile) {
    return <MobileWarning />
  }

  return (
    <Provider>
      <AppRoutes />
      {import.meta.env.DEV && <AgentFeedback />}
      {<RunableBadge />}
    </Provider>
  )
}

export default App
