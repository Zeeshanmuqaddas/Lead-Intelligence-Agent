import { useState } from 'react';
import { Target, MessageSquare, Loader2, Code2, Copy, Check, PieChart, ShieldAlert } from 'lucide-react';
import { analyzeLeadMessage, LeadAnalysis } from './services/geminiService';

export default function App() {
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<LeadAnalysis | null>(null);
  const [error, setError] = useState('');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    
    setAnalyzing(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeLeadMessage(message);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze the message. Please check if the API Key is valid and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'raw' | 'reply') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'raw') {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
      } else {
        setCopiedReply(true);
        setTimeout(() => setCopiedReply(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'inquiry': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'complaint': return 'bg-rose-100 text-rose-700 ring-rose-600/20';
      case 'spam': return 'bg-gray-100 text-gray-700 ring-gray-600/20';
      default: return 'bg-purple-100 text-purple-700 ring-purple-600/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Target className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Lead Intelligence Agent</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Active
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  Incoming Message
                </h2>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-4">
                <textarea
                  className="w-full h-64 resize-none rounded-xl border border-gray-200 p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none"
                  placeholder="Paste email, chat transcript, or form submission here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                
                {error && (
                  <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                    <p>{error}</p>
                  </div>
                )}
                
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !message.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Signal...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Analyze Lead
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Agent Instructions Active</h3>
               <p className="text-sm text-gray-600 mb-2 font-medium">This agent classifies user intent, detects language and sentiment, computes a lead score, and generates a sales-focused professional reply. It follows deep context instructions to convert input to an actionable structured signal.</p>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {!result && !analyzing && (
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
                <PieChart className="w-12 h-12 mb-4 text-gray-300" />
                <p className="font-medium text-sm">Awaiting incoming message...</p>
                <p className="text-xs mt-1">Output will populate structured CRM signals here.</p>
              </div>
            )}
            
            {result && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Score & Category Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-1 items-center justify-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Score</span>
                    <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(result.lead_score)}`}>
                      {result.lead_score}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-2 items-center justify-center text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</span>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold capitalize ring-1 ring-inset ${getCategoryColor(result.category)}`}>
                      {result.category}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-2 items-center justify-center text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sentiment</span>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-500/10 capitalize">
                      {result.sentiment}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-2 items-center justify-center text-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quality</span>
                    <div className="flex items-center gap-2">
                       {result.important === 'yes' && <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">Important</span>}
                       {result.lead === 'yes' && <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">Lead</span>}
                       {result.important !== 'yes' && result.lead !== 'yes' && <span className="text-sm font-medium text-gray-400">Low Priority</span>}
                    </div>
                  </div>
                </div>

                {/* Additional Metadata */}
                {(result.tags && result.tags.length > 0) || result.follow_up_required !== undefined && (
                  <div className="flex flex-wrap items-center gap-3">
                    {result.recommended_action && (
                       <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Action: <span className="capitalize">{result.recommended_action}</span>
                       </div>
                    )}
                    {result.follow_up_required && (
                       <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 shadow-sm">
                         Needs Follow Up
                       </span>
                    )}
                    {result.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Main Results */}
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                   
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Executive Summary</h3>
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Suggested Reply</h3>
                    <button 
                      onClick={() => copyToClipboard(result.reply, 'reply')}
                      className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-200 transition-colors"
                      title="Copy Reply"
                    >
                      {copiedReply ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-5 bg-white font-medium text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {result.reply}
                  </div>
                </div>

                {/* Developer / Output JSON View */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
                   <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                     <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                       <Code2 className="w-4 h-4 text-slate-400" />
                       Structured JSON Output
                     </h3>
                     <button 
                       onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'raw')}
                       className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700 transition-colors"
                     >
                       {copiedRaw ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                     </button>
                   </div>
                   <div className="p-5 overflow-auto max-h-[300px] text-xs font-mono text-slate-300">
                     <pre>{JSON.stringify(result, null, 2)}</pre>
                   </div>
                </div>

              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
