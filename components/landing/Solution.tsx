import { Camera, ScanFace, Droplets } from 'lucide-react';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface SolutionProps {
  t: Strings;
}

export default function Solution({ t }: SolutionProps) {
  const steps = [
    { icon: Camera, title: t.solution.step1title, body: t.solution.step1body },
    { icon: ScanFace, title: t.solution.step2title, body: t.solution.step2body },
    { icon: Droplets, title: t.solution.step3title, body: t.solution.step3body },
  ];

  return (
    <section className="px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 max-w-lg sm:mb-16">
          <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
            {t.solution.eyebrow}
          </span>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
            {t.solution.title}
          </h2>
        </Reveal>

        <div className="relative grid gap-5 sm:grid-cols-3 sm:gap-6">
          {/* Connecting line, desktop only — echoes the flowing curve in the leaf mark */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px sm:block"
            style={{
              background:
                'repeating-linear-gradient(to right, var(--zadoc-border) 0, var(--zadoc-border) 8px, transparent 8px, transparent 16px)',
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.12}>
                <div className="relative rounded-card border border-zadoc-border bg-white p-7 shadow-card">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zadoc-background">
                    <Icon size={24} className="text-zadoc-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-zadoc-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-zadoc-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-zadoc-muted">{step.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
