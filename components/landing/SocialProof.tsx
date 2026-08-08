import Image from 'next/image';
import { Play } from 'lucide-react';
import Reveal from './Reveal';
import { mockInfluencers } from '@/lib/mock/influencers';
import type { Strings } from '@/lib/language';

interface SocialProofProps {
  t: Strings;
}

export default function SocialProof({ t }: SocialProofProps) {
  const creators = [...mockInfluencers]
    .filter((inf) => inf.active)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="mb-10 max-w-lg sm:mb-12">
          <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
            {t.social.eyebrow}
          </span>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
            {t.social.title}
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-6 pb-2 sm:px-10">
          {creators.map((creator) => {
            const video = creator.videos[0];
            return (
              <div
                key={creator.id}
                className="w-[220px] shrink-0 overflow-hidden rounded-card border border-zadoc-border bg-white shadow-card sm:w-[250px]"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={video?.thumbnail_url ?? creator.image_url}
                    alt={`${creator.name} video`}
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <button
                    type="button"
                    aria-label={`Play ${creator.name}'s video`}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-transform active:scale-95">
                      <Play size={18} className="ml-0.5 fill-zadoc-foreground text-zadoc-foreground" />
                    </span>
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-3">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-white">
                      <Image
                        src={creator.image_url}
                        alt={creator.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{creator.name}</span>
                  </div>
                </div>

                {creator.bio && (
                  <p className="px-4 py-3 text-sm leading-snug text-zadoc-muted">{creator.bio}</p>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
