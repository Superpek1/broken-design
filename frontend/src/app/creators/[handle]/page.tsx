// Creator profile — cover and photo, stats, the creator's models and a Donate box.
// Public, read-only view for visitors; there are no edit controls.
// Donations are UI only for now (no payments yet).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ModelCard from '@/components/gallery/ModelCard';
import DonateCard from '@/components/profile/DonateCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { fetchCreator } from '@/lib/api';

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const creator = await fetchCreator((await params).handle);
  return { title: creator ? `${creator.name} — Lixyte` : 'Creator not found — Lixyte' };
}

export default async function CreatorProfilePage({ params }: Props) {
  const creator = await fetchCreator((await params).handle);
  if (!creator) notFound();

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-24 md:px-6">
      <ProfileHeader
        name={creator.name}
        handle={creator.handle}
        bio={creator.bio}
        modelCount={creator.models.length}
        downloads={creator.totalDownloads}
        likes={creator.totalLikes}
      />

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <DonateCard creator={creator.name} />
        </aside>

        <section aria-labelledby="models-title" className="lg:col-start-1 lg:row-start-1">
          <h2 id="models-title" className="border-b border-white/10 pb-2 text-white">
            Models <span className="font-mono text-[12px] text-white/65">{creator.models.length}</span>
          </h2>
          {creator.models.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {creator.models.map((m) => (
                <li key={m.id}>
                  <ModelCard model={m} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-white/65">No models yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
