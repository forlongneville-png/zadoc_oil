import { Sparkles, Leaf, PiggyBank } from 'lucide-react';
import Reveal from './Reveal';
import type { Strings } from '@/lib/language';

interface WhyZadocProps {
  t: Strings;
}

export default function WhyZadoc({ t }: WhyZadocProps) {
  const cards = [
    { icon: Sparkles, title: t.why.card1title, body: t.why.card1body },
    { icon: Leaf, title: t.why.card2title, body: t.why.card2body },
    { icon: PiggyBank, title: t.why.card3title, body: t.why.card3body },
  ];

  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12 max-w-lg sm:mb-16">
          <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
            {t.why.eyebrow}
          </span>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
            {t.why.title}
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.1}>
                <div className="h-full rounded-card border border-zadoc-border bg-zadoc-background p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zadoc-success/10">
                    <Icon size={22} className="text-zadoc-success" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-zadoc-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-zadoc-muted">{card.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
