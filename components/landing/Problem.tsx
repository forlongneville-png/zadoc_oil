import Image from 'next/image';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface ProblemProps {
  t: Strings;
}

export default function Problem({ t }: ProblemProps) {
  return (
    <section className="px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-2 sm:gap-14">
        <Reveal>
          <div className="relative aspect-square w-full overflow-hidden rounded-card border border-zadoc-border shadow-card">
            <Image
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1000&h=1000&fit=crop&q=80"
              alt="Several skincare oil bottles lined up, representing too many choices"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 480px"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
            {t.problem.eyebrow}
          </span>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
            {t.problem.title}
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-zadoc-muted">{t.problem.body}</p>

          <div className="mt-8 flex gap-8">
            <div>
              <div className="text-3xl font-semibold tracking-tight text-zadoc-foreground">70%</div>
              <div className="mt-1 text-sm text-zadoc-muted">{t.problem.stat1}</div>
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight text-zadoc-foreground">1 in 3</div>
              <div className="mt-1 text-sm text-zadoc-muted">{t.problem.stat2}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
