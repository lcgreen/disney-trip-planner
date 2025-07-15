'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, DollarSign, Package, MapPin, Star, Crown, Sparkles } from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'
import TripPlanner from '@/components/TripPlanner'
import BudgetTracker from '@/components/BudgetTracker'
import PackingChecklist from '@/components/PackingChecklist'
import { Modal, PremiumBadge } from '@/components/ui'

interface Tool {
  id: string
  title: string
  description: string
  icon: any
  color: string
  isPremium: boolean
  component: any
}

const tools: Tool[] = [
  {
    id: 'countdown',
    title: 'Disney Countdown',
    description: 'Count down the magical days until your Disney adventure begins!',
    icon: Clock,
    color: 'from-disney-blue to-disney-purple',
    isPremium: false,
    component: CountdownTimer,
  },
  {
    id: 'planner',
    title: 'Trip Planner',
    description: 'Plan your perfect Disney days with our interactive itinerary builder',
    icon: Calendar,
    color: 'from-park-magic to-park-epcot',
    isPremium: true,
    component: TripPlanner,
  },
  {
    id: 'budget',
    title: 'Budget Tracker',
    description: 'Keep track of your Disney spending and stay within your magical budget',
    icon: DollarSign,
    color: 'from-disney-gold to-disney-orange',
    isPremium: true,
    component: BudgetTracker,
  },
  {
    id: 'packing',
    title: 'Packing Checklist',
    description: 'Never forget the essentials with our Disney-optimized packing lists',
    icon: Package,
    color: 'from-disney-green to-disney-teal',
    isPremium: false,
    component: PackingChecklist,
  },
]

export default function HomePage() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const handleToolClick = (tool: Tool) => {
    if (tool.isPremium && !isPremiumUser()) {
      setShowPremiumModal(true)
      return
    }
    setActiveTool(tool.id)
  }

  const isPremiumUser = () => {
    // This would check actual subscription status
    return false
  }

  const ActiveComponent = activeTool ? tools.find(t => t.id === activeTool)?.component : null

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-disney p-6 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4 disney-shadow">
              ✨ Disney Trip Planner ✨
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Your ultimate suite of magical tools for planning the perfect Disney vacation
            </p>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10">
          <Sparkles className="text-disney-gold w-8 h-8" />
        </div>
        <div className="absolute top-20 right-20">
          <Star className="text-disney-pink w-6 h-6" />
        </div>
        <div className="absolute bottom-10 left-1/4">
          <Crown className="text-disney-gold w-10 h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {!activeTool ? (
          <>
            {/* Tools Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12"
            >
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${tool.isPremium ? 'tool-card-premium' : 'tool-card'} p-8 cursor-pointer relative`}
                  onClick={() => handleToolClick(tool)}
                >
                  {tool.isPremium && (
                    <div className="absolute top-4 right-4">
                      <PremiumBadge />
                    </div>
                  )}

                  <div className={`bg-gradient-to-br ${tool.color} p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                    <tool.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{tool.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{tool.description}</p>

                  <div className="mt-6">
                    <span className={`btn-${tool.isPremium ? 'premium' : 'disney'} inline-block px-6 py-2 text-sm`}>
                      {tool.isPremium ? 'Upgrade to Use' : 'Try Now Free'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
                Why Choose Our Disney Planner?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-disney-blue to-disney-purple p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Detailed Planning</h3>
                  <p className="text-gray-600">Plan every moment of your Disney adventure with our comprehensive tools</p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-disney-gold to-disney-orange p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Magical Experience</h3>
                  <p className="text-gray-600">Get the most out of your Disney vacation with insider tips and strategies</p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-disney-green to-disney-teal p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Save Money</h3>
                  <p className="text-gray-600">Budget effectively and find ways to save on your Disney vacation</p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          /* Tool View */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b">
              <button
                onClick={() => setActiveTool(null)}
                className="btn-disney mb-4"
              >
                ← Back to Tools
              </button>
              <h2 className="text-3xl font-bold gradient-text">
                {tools.find(t => t.id === activeTool)?.title}
              </h2>
            </div>

            <div className="p-6">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </motion.div>
        )}
      </main>

      {/* Premium Modal */}
      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Upgrade to Premium"
        size="md"
      >
        <div className="text-center">
          <div className="premium-badge p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-disney-blue" />
          </div>

          <p className="text-gray-600 mb-6">
            Unlock all premium tools including the Trip Planner and Budget Tracker for just £9.99/month
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-disney-gold" />
              <span>Unlimited trip planning</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-disney-gold" />
              <span>Advanced budget tracking</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-disney-gold" />
              <span>Priority support</span>
            </div>
          </div>

          <button className="btn-premium w-full mb-3">
            Start Free Trial
          </button>
          <button
            onClick={() => setShowPremiumModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Maybe later
          </button>
        </div>
      </Modal>
    </div>
  )
}