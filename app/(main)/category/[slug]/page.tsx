import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Star, Shield, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return {
    title: cat ? `${cat.name} in Temecula Valley` : "Category",
    description: cat ? `Find verified ${cat.name.toLowerCase()} businesses in Temecula Valley.` : undefined,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the category first to get the ID
  const { data: cat } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!cat) notFound();

  // Fetch businesses by category_id
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

  return (
    <div className="container py-8">
      <div className="mb-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{cat.name}</span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-white">{cat.name}</h1>
      <p className="mt-2 text-gray-400">{bizList.length} verified businesses in Temecula Valley</p>

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
              </div>
              {biz.description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{biz.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
