import React from 'react';
import { LibraryArtifact } from '@/types';
import { LibraryAssetCard } from './LibraryAssetCard';

interface LibraryViewProps {
  artifacts: LibraryArtifact[];
  onTraceBack: (sessionId: string) => void;
  onChatWithAsset: (artifact: LibraryArtifact) => void;
  onViewAsset: (artifact: LibraryArtifact) => void;
}

export function LibraryView({
  artifacts,
  onTraceBack,
  onChatWithAsset,
  onViewAsset,
}: LibraryViewProps) {
  // Filter out deleted artifacts
  const visibleArtifacts = artifacts.filter(a => !a.isDeleted);

  return (
    <div className="h-full overflow-y-auto bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Library</h1>
          <p className="text-gray-600">
            All generated artifacts and outputs from your conversations
          </p>
        </div>

        {/* Grid View */}
        {visibleArtifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No artifacts yet
            </h3>
            <p className="text-gray-500 max-w-md">
              Start a conversation and generate content to see it appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleArtifacts.map(artifact => (
              <LibraryAssetCard
                key={artifact.id}
                artifact={artifact}
                onTraceBack={() => onTraceBack(artifact.sessionId)}
                onChatWithAsset={() => onChatWithAsset(artifact)}
                onView={() => onViewAsset(artifact)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


