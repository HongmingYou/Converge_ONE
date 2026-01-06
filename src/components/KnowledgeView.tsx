import { Plus, MoreHorizontal, Image as ImageIcon, FileText } from 'lucide-react';
import { MOCK_KNOWLEDGE_ITEMS } from '@/data/mock';

export function KnowledgeView() {
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto px-10 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Knowledge Base</h2>
            <p className="text-slate-500 text-lg">Centralized hub for all your assets.</p>
          </div>
          <button className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-500/20">
            <Plus size={20} /> Upload
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_KNOWLEDGE_ITEMS.filter(item => !item.isDeleted).map(item => (
            <div key={item.id} className="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-white rounded-full shadow-sm hover:text-indigo-600"><MoreHorizontal size={16} /></button>
              </div>

              <div className={`
                w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-xl shadow-inner
                ${item.type === 'pdf' || item.type === 'doc' ? 'bg-rose-50 text-rose-600' :
                  item.type === 'markdown' || item.type === 'code' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
              `}>
                <FileText />
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{item.tag || item.type}</span>
              </div>
              <h3 className="font-bold text-slate-800 truncate mb-1 text-lg">{item.title}</h3>
              <p className="text-sm text-slate-400">{formatDate(item.uploadedAt)} • {item.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
