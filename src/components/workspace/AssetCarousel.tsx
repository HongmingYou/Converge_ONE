import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AgentAssetData } from '@/types/project';
import { AgentAssetCard } from './AgentAssetCard';
import { ActionCard } from './ActionCard';

interface AssetCarouselProps {
  assets: AgentAssetData[];
  onTrace?: (conversationId: string, messageId: string) => void;
  onRemix?: (asset: AgentAssetData) => void;
  onSave?: (asset: AgentAssetData) => void;
  onPin?: (assetId: string, pinned: boolean) => void;
  onAskAgent?: () => void;
}

export function AssetCarousel({
  assets,
  onTrace,
  onRemix,
  onSave,
  onPin,
  onAskAgent,
}: AssetCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth',
      });
    }
  };

  // Limit to recent 15 assets
  const recentAssets = assets.slice(0, 15);
  const showActionCard = recentAssets.length < 3;

  return (
    <div className="relative">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
        style={{
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: '0',
          scrollPaddingRight: '0',
        }}
      >
        {recentAssets.map((asset) => (
          <div
            key={asset.id}
            className="flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <AgentAssetCard
              data={asset}
              onTrace={onTrace}
              onRemix={onRemix}
              onSave={onSave}
              onPin={onPin}
            />
          </div>
        ))}
        
        {/* Action Card at the end */}
        {showActionCard && (
          <div
            className="flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ActionCard onAskAgent={onAskAgent} />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {recentAssets.length > 3 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-stone-600" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-stone-600" />
          </button>
        </>
      )}
    </div>
  );
}

