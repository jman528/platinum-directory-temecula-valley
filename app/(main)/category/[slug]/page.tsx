import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Star, Shield, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import { DirectoryBreadcrumbSchema } from "@/components/seo/StructuredData";

// Category-specific FAQ content for rich snippets
const CATEGORY_FAQS: Record<string, { q: string; a: string }[]> = {
  wineries: [
    { q: 'How many wineries are in Temecula Valley?', a: 'Temecula Valley is home to over 40 wineries and tasting rooms, making it one of Southern California\'s premier wine regions. The area produces award-winning wines including Rhône-style reds, Bordeaux blends, and crisp whites.' },
    { q: 'What is Temecula Valley wine country known for?', a: 'Temecula Valley is renowned for its Mediterranean climate, ideal for growing grapes. The region is particularly known for Syrah, Cabernet Sauvignon, Viognier, and sparkling wines, along with beautiful vineyard views and world-class tasting experiences.' },
    { q: 'Do Temecula wineries require reservations?', a: 'Many Temecula wineries recommend reservations, especially on weekends and during peak seasons. Some offer walk-in tastings during weekdays, but booking ahead ensures the best experience and availability.' },
  ],
  restaurants: [
    { q: 'What types of restaurants are in Temecula Valley?', a: 'Temecula Valley offers diverse dining options including farm-to-table, Italian, Mexican, sushi, steakhouses, gastropubs, and winery restaurants. Old Town Temecula alone has over 30 dining establishments.' },
    { q: 'Where is the best area to eat in Temecula?', a: 'Old Town Temecula along Front Street is the most popular dining district with the highest concentration of restaurants. Wine country also offers excellent dining at many wineries with vineyard-view restaurants.' },
    { q: 'Are there fine dining options in Temecula?', a: 'Yes, Temecula has several fine dining options, particularly in wine country. Many wineries feature upscale restaurants with chef-curated menus and wine pairings in beautiful vineyard settings.' },
  ],
  spas: [
    { q: 'What spa services are available in Temecula Valley?', a: 'Temecula Valley offers a wide range of spa services including vineyard-infused treatments, hot stone massages, facials, body wraps, couples treatments, and full-day spa packages at resort and boutique spas.' },
    { q: 'Are there resort spas in Temecula wine country?', a: 'Yes, several Temecula wine country resorts feature full-service spas offering luxurious treatments with vineyard views, including day-use packages for visitors who are not staying overnight.' },
  ],
  hotels: [
    { q: 'Where should I stay in Temecula Valley?', a: 'Temecula Valley offers accommodation options ranging from luxury wine country resorts and boutique hotels to cozy bed and breakfasts and vacation rentals. Wine country, Old Town, and the Promenade area are popular locations.' },
    { q: 'What are the best hotels near Temecula wineries?', a: 'Several hotels and resorts are located directly in Temecula wine country, offering vineyard views and easy access to tasting rooms. Many include spa services, fine dining, and complimentary wine tasting.' },
  ],
}

// Category intro paragraphs for SEO
const CATEGORY_INTROS: Record<string, string> = {
  wineries: 'Explore the best wineries and tasting rooms in Temecula Valley, CA — Southern California\'s premier wine region. From award-winning estates to intimate family vineyards, discover world-class wines, stunning vineyard views, and unforgettable tasting experiences. Each winery listed here is verified by Platinum Directory.',
  restaurants: 'Discover the best restaurants and dining experiences in Temecula Valley, CA. From Old Town Temecula eateries to wine country fine dining, explore verified local restaurants offering everything from craft burgers and tacos to Michelin-worthy cuisine with vineyard views.',
  spas: 'Find the top spas and wellness centers in Temecula Valley, CA. Whether you\'re looking for a relaxing vineyard-side massage, a full-day spa retreat, or rejuvenating facial treatments, our verified spa listings help you find the perfect escape in wine country.',
  hotels: 'Discover the best hotels, resorts, and accommodations in Temecula Valley, CA. From luxury wine country resorts with vineyard views to charming Old Town boutique hotels, find the perfect place to stay during your Temecula Valley visit.',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const catName = cat?.name || 'Category';
  return {
    title: `Best ${catName} in Temecula Valley, CA`,
    description: `Find the best verified ${catName.toLowerCase()} in Temecula Valley, California. Read reviews, compare ratings, and discover local favorites on Platinum Directory.`,
    openGraph: {
      title: `Best ${catName} in Temecula Valley, CA | Platinum Directory`,
      description: `Discover top-rated ${catName.toLowerCase()} in Temecula Valley. Verified listings with reviews, photos, and exclusive deals.`,
    },
    alternates: {
      canonical: `https://platinumdirectorytemeculavalley.com/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!cat) notFound();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*, categories(name, slug)")
    .eq("is_active", true)
    .eq("category_id", cat.id)
    .order("tier", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("average_rating", { ascending: false })
    .range(0, 23);

  const bizList = (businesses as any[]) || [];
  const faqs = CATEGORY_FAQS[slug] || [];
  const intro = CATEGORY_INTROS[slug] || `Discover the best ${cat.name.toLowerCase()} in Temecula Valley, CA. Browse verified local businesses with ratings, reviews, and exclusive deals on Platinum Directory.`;

  // FAQ Schema for rich snippets
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  // ItemList schema for the business listings
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${cat.name} in Temecula Valley`,
    itemListElement: bizList.slice(0, 10).map((biz: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: biz.name,
      url: `https://platinumdirectorytemeculavalley.com/business/${biz.slug}`,
    })),
  };

  return (
    <div className="container py-8">
      <DirectoryBreadcrumbSchema category={cat.name} />
      {faqSchema && (
        <Script
          id={`faq-schema-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Script
        id={`itemlist-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Breadcrumbs */}
      <nav className="mb-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="hover:text-white">Directory</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{cat.name}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white">
        Best {cat.name} in Temecula Valley, CA
      </h1>
      <p className="mt-3 max-w-3xl text-gray-400 leading-relaxed">{intro}</p>
      <p className="mt-2 text-sm text-gray-500">{bizList.length} verified businesses</p>

      {bizList.length === 0 ? (
        <div className="mt-8 glass-card p-12 text-center">
          <p className="text-lg text-gray-400">No businesses in this category yet</p>
          <Link href="/claim" className="mt-4 inline-block text-pd-blue hover:text-pd-blue-light">
            Add your business →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bizList.map((biz: any) => (
            <Link key={biz.id} href={`/business/${biz.slug}`} className="glass-card group p-4">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-heading font-semibold text-white group-hover:text-pd-gold">{biz.name}</h3>
                {biz.tier !== "free" && <Shield className="h-4 w-4 shrink-0 text-pd-gold" />}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                {biz.average_rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-pd-gold text-pd-gold" />
                    {biz.average_rating}
                  </span>
                )}
                {biz.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.city}</span>}
                {biz.price_range && <span>{biz.price_range}</span>}
              </div>
              {biz.description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{biz.description}</p>}
            </Link>
          ))}
        </div>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-white">
            Frequently Asked Questions About {cat.name} in Temecula Valley
          </h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card p-5">
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Categories */}
      <section className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-white">Explore More Categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {['wineries', 'restaurants', 'spas', 'hotels', 'shopping', 'entertainment', 'services'].filter(s => s !== slug).map(s => (
            <Link key={s} href={`/category/${s}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm capitalize text-gray-300 hover:border-pd-gold/30 hover:text-pd-gold">
              {s}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
