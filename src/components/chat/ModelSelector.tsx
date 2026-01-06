import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AIModel } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModelOption {
  value: AIModel;
  label: string;
  description: string;
}

const modelOptions: ModelOption[] = [
  {
    value: 'claude-4.5',
    label: 'Claude 4.5',
    description: 'Most capable model',
  },
  {
    value: 'gemini-3-pro',
    label: 'Gemini 3 Pro',
    description: 'Fast and efficient',
  },
  {
    value: 'gpt-5',
    label: 'GPT-5',
    description: 'Advanced reasoning',
  },
];

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentModel = modelOptions.find((m) => m.value === selectedModel);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-2.5 text-xs font-medium text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="Switch AI Model"
        >
          <span>{currentModel?.label}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {modelOptions.map((model) => (
          <DropdownMenuItem
            key={model.value}
            onClick={() => {
              onModelChange(model.value);
              setOpen(false);
            }}
            className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{model.label}</span>
                {selectedModel === model.value && (
                  <Check size={14} className="text-indigo-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

