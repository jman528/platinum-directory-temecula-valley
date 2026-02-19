import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business Listing Terms",
};

const sections = [
  { id: "free-listings", title: "Free Listings" },
  { id: "claiming", title: "Claiming Your Listing" },
  { id: "consent", title: "Consent to Data Use" },
  { id: "responsibilities", title: "Your Responsibilities" },
  { id: "tiers", title: "Subscription Tiers" },
  { id: "smart-offers", title: "Smart Offers for Businesses" },
  { id: "media", title: "Image and Media Policy" },
  { id: "termination", title: "Termination" },
];

export default function BusinessListingTermsPage() {
  return (
    <div className="py-12">
      <div className="container">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            Home
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-sm text-gray-400">
            Business Listing Terms
          </span>
        </div>

        <h1 className="mb-2 font-heading text-3xl font-bold text-white md:text-4xl">
          PLATINUM DIRECTORY TEMECULA VALLEY
        </h1>
        <h2 className="mb-1 text-xl text-pd-purple-light">
          Business Listing Terms
        </h2>
        <p className="text-sm text-gray-500">Last Updated: February 19, 2026</p>

        <div className="mt-8 flex gap-8">
          {/* TOC Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="sticky top-24 space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="glass-card min-w-0 flex-1 p-6 md:p-8">
            <div className="prose prose-invert max-w-none [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-200 [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-gray-400 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:text-gray-400 [&_li]:mb-1">
              {/* 1. Free Listings */}
              <h2 id="free-listings">1. Free Listings</h2>
              <p>
                Platinum Directory may create free, unclaimed listings for
                businesses in the Temecula Valley region using publicly available
                information. These listings include:
              </p>
              <ul>
                <li>Business name</li>
                <li>Address and phone number</li>
                <li>Business category</li>
                <li>Hours of operation (if publicly available)</li>
                <li>Website URL (if publicly available)</li>
              </ul>
              <p>
                Free listings do not include photos, Smart Offers, or enhanced
                features. Unclaimed listings are clearly marked as such on the
                platform.
              </p>

              {/* 2. Claiming Your Listing */}
              <h2 id="claiming">2. Claiming Your Listing</h2>
              <p>
                Business owners or authorized representatives may claim their
                listing on Platinum Directory. The claiming process involves:
              </p>
              <ul>
                <li>
                  Creating a user account on Platinum Directory (or signing in
                  to an existing account).
                </li>
                <li>
                  Locating your business in the directory and initiating the
                  claim process.
                </li>
                <li>
                  Verifying your identity and authorization to represent the
                  business via phone, email, or document verification.
                </li>
                <li>
                  Accepting these Business Listing Terms and the platform&apos;s
                  general Terms of Service.
                </li>
              </ul>
              <p>
                By claiming your listing, you gain access to manage your
                business profile, add photos and descriptions, respond to
                inquiries, create Smart Offers, and access analytics.
              </p>

              {/* 3. Consent to Data Use */}
              <h2 id="consent">3. Consent to Data Use</h2>
              <p>
                By claiming your listing, you consent to the following:
              </p>
              <ul>
                <li>
                  Display of your business information on the Platinum Directory
                  platform and in search results.
                </li>
                <li>
                  Use of your business data for directory purposes, including
                  enrichment with publicly available information.
                </li>
                <li>
                  Receipt of platform communications regarding your listing,
                  including performance reports, lead notifications, and feature
                  updates.
                </li>
                <li>
                  Sharing of consumer inquiry data (name, email, phone, message)
                  when consumers contact your business through the platform.
                </li>
              </ul>

              {/* 4. Your Responsibilities */}
              <h2 id="responsibilities">4. Your Responsibilities</h2>
              <p>As a claimed business on Platinum Directory, you agree to:</p>
              <ul>
                <li>
                  Provide accurate and up-to-date business information.
                </li>
                <li>
                  Respond to consumer inquiries and Smart Offer redemptions in a
                  timely manner.
                </li>
                <li>
                  Honor all valid, unexpired Smart Offers purchased through the
                  platform.
                </li>
                <li>
                  Comply with all applicable local, state, and federal laws and
                  regulations.
                </li>
                <li>
                  Not submit misleading information, fake reviews, or fraudulent
                  offers.
                </li>
                <li>
                  Maintain a valid payment method on file for subscription
                  billing (if on a paid tier).
                </li>
              </ul>

              {/* 5. Subscription Tiers */}
              <h2 id="tiers">5. Subscription Tiers</h2>
              <p>
                Platinum Directory offers the following subscription tiers for
                businesses:
              </p>

              <h3>Free Tier</h3>
              <ul>
                <li>Basic listing with name, address, phone, and category</li>
                <li>No photos or enhanced features</li>
                <li>30% platform fee on Smart Offers</li>
              </ul>

              <h3>Silver Tier</h3>
              <ul>
                <li>Enhanced listing with photos and description</li>
                <li>Smart Offers enabled</li>
                <li>Basic analytics</li>
                <li>25% platform fee on Smart Offers</li>
              </ul>

              <h3>Gold Tier</h3>
              <ul>
                <li>All Silver features</li>
                <li>Priority placement in search results</li>
                <li>Advanced analytics and lead tracking</li>
                <li>20% platform fee on Smart Offers</li>
              </ul>

              <h3>Platinum Tier</h3>
              <ul>
                <li>All Gold features</li>
                <li>Featured placement on homepage and category pages</li>
                <li>Dedicated account support</li>
                <li>Sweepstakes and giveaway eligibility</li>
                <li>15% platform fee on Smart Offers</li>
              </ul>
              <p>
                Subscription fees are billed monthly or annually. You may
                upgrade, downgrade, or cancel your subscription at any time.
                Changes take effect at the start of the next billing cycle.
              </p>

              {/* 6. Smart Offers for Businesses */}
              <h2 id="smart-offers">6. Smart Offers for Businesses</h2>
              <ul>
                <li>
                  Businesses on paid tiers may create Smart Offers through the
                  platform dashboard.
                </li>
                <li>
                  You set the offer details, pricing, quantity limits, and
                  expiration dates.
                </li>
                <li>
                  Platform fees are deducted from each transaction before payout
                  (see Subscription Tiers for fee schedule).
                </li>
                <li>
                  Payouts are processed via Stripe Connect on a rolling basis,
                  typically within 2&ndash;7 business days after redemption.
                </li>
                <li>
                  You are responsible for honoring all valid Smart Offers and
                  providing the goods or services as described.
                </li>
                <li>
                  Platinum Directory reserves the right to remove Smart Offers
                  that are misleading, fraudulent, or in violation of these
                  terms.
                </li>
              </ul>

              {/* 7. Image and Media Policy */}
              <h2 id="media">7. Image and Media Policy</h2>
              <ul>
                <li>
                  Only claimed businesses that have accepted these Business
                  Listing Terms may have photos displayed on their listing.
                </li>
                <li>
                  By uploading images, you represent that you own the rights to
                  the content or have obtained permission to use it.
                </li>
                <li>
                  You grant Platinum Directory a non-exclusive, royalty-free
                  license to display, resize, and distribute your images on the
                  platform and in marketing materials.
                </li>
                <li>
                  Images must not contain offensive, misleading, or copyrighted
                  content belonging to third parties.
                </li>
                <li>
                  Platinum Directory reserves the right to remove images that
                  violate these policies without notice.
                </li>
              </ul>

              {/* 8. Termination */}
              <h2 id="termination">8. Termination</h2>
              <ul>
                <li>
                  You may unclaim your listing at any time through your account
                  dashboard. Unclaiming reverts your listing to its basic,
                  unclaimed state.
                </li>
                <li>
                  You may request full removal of your listing by contacting
                  support. Removal requests are processed within 5 business
                  days.
                </li>
                <li>
                  Platinum Directory may suspend or remove your listing if you
                  violate these terms, fail to honor Smart Offers, or engage in
                  fraudulent activity.
                </li>
                <li>
                  Cancellation of a paid subscription does not automatically
                  remove your listing. Your listing will revert to the free tier.
                </li>
                <li>
                  Outstanding Smart Offers must still be honored even after
                  subscription cancellation or listing removal.
                </li>
                <li>
                  Any pending payouts at the time of termination will be
                  processed according to the standard payout schedule.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
