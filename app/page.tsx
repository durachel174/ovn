import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="text-xs font-medium tracking-widest text-mauve-400 uppercase mb-4">
          Bay Area · Home Bakers
        </p>
        <h1 className="text-5xl font-bold font-serif text-stone-800 leading-tight mb-6">
          Baked with love,<br />shared with neighbors.
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed max-w-md mx-auto mb-10">
          Ovn is a small marketplace for home bakers in the Bay Area to share and sell their goods with the people around them.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="px-6 py-3 bg-mauve-400 hover:bg-mauve-500 text-white font-semibold rounded-full text-sm transition-colors"
          >
            Start sharing
          </Link>
          <Link
            href="/listings"
            className="px-6 py-3 bg-white border border-stone-200 hover:border-stone-400 text-stone-700 font-medium rounded-full text-sm transition-colors"
          >
            Browse listings
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6">
        <hr className="border-stone-200" />
      </div>

      {/* What is Ovn */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-3xl border border-stone-100 p-6">
            <div className="text-3xl mb-4">🍞</div>
            <h3 className="font-bold font-serif text-stone-800 text-lg mb-2">List your bakes</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Post what you've made — bread, pastries, cakes, cookies — with a photo, price, and your neighborhood.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-stone-100 p-6">
            <div className="text-3xl mb-4">📍</div>
            <h3 className="font-bold font-serif text-stone-800 text-lg mb-2">Discover nearby</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Browse a map of baked goods available in your area. Filter by category and find something fresh today.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-stone-100 p-6">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="font-bold font-serif text-stone-800 text-lg mb-2">Connect directly</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Message bakers directly to arrange a pickup. No middlemen, no delivery fees — just neighbors helping neighbors.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6">
        <hr className="border-stone-200" />
      </div>

      {/* Community Guide */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <div className="max-w-lg">
          <p className="text-xs font-medium tracking-widest text-mauve-400 uppercase mb-3">
            Community Guide
          </p>
          <h2 className="text-3xl font-bold font-serif text-stone-800 mb-4">
            Sharing food, responsibly.
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">
            Ovn is built on trust. Because we're dealing with food, we ask every member of our community to keep these principles in mind.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              icon: '🧼',
              title: 'Practice good hygiene',
              body: 'Always wash your hands before baking and handling food. Keep your workspace clean and use food-safe packaging.',
            },
            {
              icon: '🌡️',
              title: 'Label allergens clearly',
              body: 'Always disclose common allergens in your listing description — nuts, dairy, gluten, eggs. Buyers deserve to know what they\'re eating.',
            },
            {
              icon: '📦',
              title: 'Package with care',
              body: 'Use clean, sealed containers or bags. Make sure baked goods are properly cooled before packaging to prevent moisture and spoilage.',
            },
            {
              icon: '🕐',
              title: 'Be honest about freshness',
              body: 'List when items were baked and set a realistic expiration. Freshness builds trust — and repeat customers.',
            },
            {
              icon: '🤝',
              title: 'Meet safely',
              body: 'Arrange pickups in public or familiar locations. Communicate clearly and be punctual. Treat every exchange like you\'re representing the whole community.',
            },
          ].map(item => (
            <div key={item.title} className="flex gap-4 bg-white rounded-2xl border border-stone-100 p-5">
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div>
                <h4 className="font-semibold font-serif text-stone-800 text-sm mb-1">{item.title}</h4>
                <p className="text-stone-400 text-xs leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6">
        <hr className="border-stone-200" />
      </div>

      {/* Footer CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold font-serif text-stone-800 mb-4">
          Ready to share something?
        </h2>
        <p className="text-stone-400 text-sm mb-8">
          Join home bakers across the Bay Area on Ovn.
        </p>
        <Link
          href="/signup"
          className="px-8 py-3 bg-mauve-400 hover:bg-mauve-500 text-white font-semibold rounded-full text-sm transition-colors"
        >
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8">
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-between">
          <p className="text-stone-400 text-xs font-serif">ovn — Bay Area</p>
          <p className="text-stone-300 text-xs">Made with care</p>
        </div>
      </footer>

    </div>
  )
}