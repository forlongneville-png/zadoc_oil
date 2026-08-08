import Image from 'next/image';
import type { SkinAnalysis, ZadocProfile } from '@/types/zadoc';

const ROUTINE_LABEL: Record<NonNullable<ZadocProfile['routine_level']>, string> = {
  none: 'No routine yet',
  simple: 'Simple routine',
  moderate: 'Moderate routine',
  detailed: 'Detailed routine',
};

const GENDER_LABEL: Record<NonNullable<ZadocProfile['gender']>, string> = {
  female: 'Female',
  male: 'Male',
  prefer_not_to_say: 'Prefer not to say',
};

export function ProfileCard({
  profile,
  analysis,
}: {
  profile: ZadocProfile;
  analysis: SkinAnalysis;
}) {
  return (
    <div className="rounded-zadoc border border-zadoc-border bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-full border border-zadoc-border sm:mx-0 sm:h-28 sm:w-28">
          {profile.image_url ? (
            <Image
              src={profile.image_url}
              alt={profile.name}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zadoc-background text-zadoc-muted">
              No photo
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-semibold">{profile.name}</h1>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zadoc-muted sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide">Age</dt>
              <dd className="text-zadoc-foreground">{profile.age ?? 'Not shared'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Gender</dt>
              <dd className="text-zadoc-foreground">
                {profile.gender ? GENDER_LABEL[profile.gender] : 'Not shared'}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-xs uppercase tracking-wide">Condition</dt>
              <dd className="text-zadoc-foreground">{profile.reported_condition || 'None reported'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Routine</dt>
              <dd className="text-zadoc-foreground">
                {profile.routine_level ? ROUTINE_LABEL[profile.routine_level] : 'Not shared'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-zadoc-border bg-zadoc-background px-5 py-4">
        <span className="text-sm text-zadoc-muted">Your profile match</span>
        <span className="text-2xl font-semibold">
          {profile.skin_score ?? '—'}
          <span className="text-sm font-normal text-zadoc-muted">/100</span>
        </span>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zadoc-muted">
          Your skin profile
        </h2>
        <ul className="mt-3 space-y-2">
          {analysis.insights_json.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zadoc-foreground" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
