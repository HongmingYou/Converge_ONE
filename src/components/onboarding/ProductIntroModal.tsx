import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const APP_ICONS = {
  Framia: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
  Enter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
  Hunter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
  Combos: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
};

const APPS = [
  {
    name: 'Framia',
    icon: APP_ICONS.Framia,
    description: 'AI-powered design tool for creating visuals and graphics',
  },
  {
    name: 'Enter',
    icon: APP_ICONS.Enter,
    description: 'Build applications and websites with AI-generated code',
  },
  {
    name: 'Hunter',
    icon: APP_ICONS.Hunter,
    description: 'Research and analyze market trends and competitors',
  },
  {
    name: 'Combos',
    icon: APP_ICONS.Combos,
    description: 'Automate workflows and streamline your processes',
  },
];

interface ProductIntroModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProductIntroModal({ open, onClose }: ProductIntroModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Converge ONE
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your unified AI project that brings together design, development, research, and automation in one powerful platform.
            </p>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              One Platform, Infinite Possibilities
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Converge ONE integrates four powerful AI tools, allowing you to seamlessly move from idea to execution. 
              No more switching between different platforms—everything you need is right here.
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {APPS.map((app) => (
              <div
                key={app.name}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{app.name}</h4>
                    <p className="text-sm text-gray-600">{app.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Ready to get started?</h3>
                <p className="text-sm text-gray-600">
                  Try a quick action or type your request in the chat
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                Start Using
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

