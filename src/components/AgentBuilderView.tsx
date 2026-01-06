import { Bot } from 'lucide-react';
import { MOCK_AGENTS } from '@/data/mock';

export function AgentBuilderView() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-6 transition-transform duration-500">
          <Bot size={48} className="text-white" />
        </div>
        <h2 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">Agent Studio</h2>
        <p className="text-xl text-slate-500 mb-12 font-light">
          Describe your ideal AI assistant, and we'll build it instantly.
        </p>

        <div className="relative group max-w-xl mx-auto">
          <input
            type="text"
            placeholder="e.g., 'A witty copywriter for social media'..."
            className="w-full bg-white text-slate-900 pl-8 pr-32 py-6 rounded-3xl border-2 border-transparent focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/10 shadow-2xl shadow-emerald-500/10 transition-all text-lg placeholder:text-slate-300"
          />
          <button className="absolute right-3 top-3 bottom-3 bg-slate-900 hover:bg-emerald-500 text-white px-8 rounded-2xl font-bold transition-all shadow-lg">
            Create
          </button>
        </div>
        <div className="mt-20 grid grid-cols-2 gap-6 text-left">
          {MOCK_AGENTS.slice(0, 2).map(agent => (
            <div key={agent.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white text-xl mb-4 shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                {agent.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{agent.name}</h3>
              <p className="text-sm text-slate-400">{agent.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
