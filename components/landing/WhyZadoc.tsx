import { CheckCircle2 } from 'lucide-react';
import Reveal from './Reveal';
import WhyZadocLoop from './WhyZadocLoop';
import type { Strings } from '@/lib/language';

interface WhyZadocProps {
  t: Strings;
}

export default function WhyZadoc({ t }: WhyZadocProps) {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal className="mb-10 text-center sm:mb-12">
          <span className="text-sm font-medium uppercase tracking-wide text-zadoc-muted">
            {t.why.eyebrow}
          </span>
          <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-zadoc-foreground sm:text-4xl">
            {t.why.title}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <WhyZadocLoop bullets={t.why.bullets} icon={CheckCircle2} />
        </Reveal>
      </div>
    </section>
  );
}