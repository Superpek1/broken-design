import Link from 'next/link';

export default function CreatorNotFound() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-24 md:px-6">
      <div className="rounded-lg border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-white">That creator does not exist.</p>
        <Link
          href="/gallery"
          className="mt-4 inline-flex rounded-lg bg-white px-3.5 py-1.5 text-[15px] font-medium text-black transition-colors hover:bg-white/85"
        >
          Back to gallery
        </Link>
      </div>
    </main>
  );
}
