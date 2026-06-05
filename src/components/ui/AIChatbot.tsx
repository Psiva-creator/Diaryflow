'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Volume2, VolumeX } from 'lucide-react'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'నమస్కారం! నేను డెయిరీఫ్లో అసిస్టెంట్‌ని. మీకు ఎలా సహాయపడగలను?' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a Telugu voice
    const voices = window.speechSynthesis.getVoices()
    const teluguVoice = voices.find(v => v.lang.startsWith('te')) || voices.find(v => v.lang.includes('IN'))
    
    if (teluguVoice) {
      utterance.voice = teluguVoice
    }
    utterance.lang = 'te-IN'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    window.speechSynthesis.speak(utterance)
  }, [isVoiceEnabled])

  // Initial greeting speech (only once when opened)
  useEffect(() => {
    if (isOpen && messages.length === 1 && messages[0].role === 'model') {
      speak(messages[0].text)
    }
  }, [isOpen, messages, speak])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setIsLoading(true)
    
    // Stop speaking if user starts a new query
    window.speechSynthesis.cancel()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'model', text: data.text }])
      speak(data.text)
    } catch (error: any) {
      const errorMsg = 'క్షమించండి, సర్వర్‌లో ఏదో సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }])
      speak(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`w-[350px] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden pointer-events-auto mb-4 transition-all duration-300`}
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">డెయిరీఫ్లో అసిస్టెంట్</p>
                  <p className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">ఆన్‌లైన్</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} 
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title={isVoiceEnabled ? 'వాయిస్ ఆఫ్ చేయండి' : 'వాయిస్ ఆన్ చేయండి'}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--color-bg)] custom-scrollbar"
                >
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${m.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                          {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          m.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-none shadow-sm'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center bg-[var(--color-surface)] border border-[var(--color-border)] p-2 px-4 rounded-full shadow-sm">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">టైప్ చేస్తున్నారు...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSend()}
                      placeholder="మీ డౌట్లను ఇక్కడ అడగండి..."
                      className="input-field text-sm"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="btn-primary p-2 w-10 h-10 shrink-0 justify-center disabled:opacity-50 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`w-14 h-14 rounded-full gradient-primary shadow-2xl flex items-center justify-center text-white pointer-events-auto transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
        </span>
      </button>
    </div>
  )
}
