'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useAnimationControls } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import Reveal from './Reveal';
import { mockInfluencers } from '@/lib/mock/influencers';
import type { Strings } from '@/lib/language';
import type { Influencer } from '@/types/zadoc';

interface SocialProofProps {
  t: Strings;
}

// A video counts as "hosted" (a real file we can play natively) when its
// URL points at an actual media file — e.g. something you uploaded to the
// influencer-media Supabase bucket. Anything else (a tiktok.com/instagram.com
// page link) falls back to an outbound "watch" card instead.
function isHostedVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

export default function SocialProof({ t }: SocialProofProps) {
  const [creators, setCreators] = useState<Influencer[]>([]);
  const controls = useAnimationControls();

  useEffect(() => {
    let cancelled = false;

    fetch('/api/influencers')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then((data: { influencers: Influencer[] }) => {
        if (cancelled) return;
        setCreators(data.influencers?.length ? data.influencers : mockInfluencers.filter((c) => c.active));
      })
      .catch(() => {
        if (!cancelled) setCreators(mockInfluencers.filter((c) => c.active));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!creators.length) return;
    controls.start({ x: ['0%', '-50%'], transition: { duration: 32, ease: 'linear', repeat: Infinity } });
  }, [creators, controls]);

  const track = [...creators, ...creators];

  return (
    <section className="overflow-hidden py-16 sm:py-24">
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

      {creators.length > 0 && (
        <Reveal delay={0.1}>
          <motion.div
            className="no-scrollbar flex gap-4 px-6 pb-2 sm:px-10"
            animate={controls}
            onHoverStart={() => controls.stop()}
            onHoverEnd={() =>
              controls.start({ x: ['0%', '-50%'], transition: { duration: 32, ease: 'linear', repeat: Infinity } })
            }
            onTapStart={() => controls.stop()}
          >
            {track.map((creator, idx) => {
              const video = creator.videos[0];
              const hosted = video ? isHostedVideo(video.video_url) : false;

              return (
                <div
                  key={`${creator.id}-${idx}`}
                  className="w-[220px] shrink-0 overflow-hidden rounded-card border border-zadoc-border bg-white shadow-card sm:w-[250px]"
                >
                  <div className="relative aspect-[3/4] w-full bg-black">
                    {video && hosted ? (
                      <video
                        src={video.video_url}
                        poster={video.thumbnail_url || creator.image_url}
                        controls
                        playsInline
                        muted
                        loop
                        preload="metadata"
                        className="h-full w-full object-cover"
                      >
                        Your browser does not support embedded video.
                      </video>
                    ) : (
                      
                        href={video?.video_url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 block"
                        aria-label={`Watch ${creator.name}'s video`}
                      >
                        <Image
                          src={video?.thumbnail_url || creator.image_url}
                          alt={`${creator.name} video`}
                          fill
                          className="object-cover"
                          sizes="250px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-transform active:scale-95">
                            {video ? (
                              <Play size={18} className="ml-0.5 fill-zadoc-foreground text-zadoc-foreground" />
                            ) : (
                              <ExternalLink size={16} className="text-zadoc-foreground" />
                            )}
                          </span>
                        </span>
                      </a>
                    )}

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center gap-2 p-3">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-white">
                        <Image
                          src={creator.image_url}
                          alt={creator.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-sm font-medium text-white drop-shadow">{creator.name}</span>
                    </div>
                  </div>

                  {creator.bio && (
                    <p className="px-4 py-3 text-sm leading-snug text-zadoc-muted">{creator.bio}</p>
                  )}
                </div>
              );
            })}
          </motion.div>
        </Reveal>
      )}
    </section>
  );
}