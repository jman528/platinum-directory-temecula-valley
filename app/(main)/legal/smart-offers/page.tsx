import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Offers Terms",
};

const sections = [
  { id: "what-are", title: "What Are Smart Offers" },
  { id: "purchasing", title: "Purchasing" },
  { id: "redeeming", title: "Redeeming" },
  { id: "expiration", title: "Expiration" },
  { id: "refunds", title: "Refund Policy" },
  { id: "merchant", title: "Merchant Responsibility" },
  { id: "rewards", title: "Rewards Points on Purchases" },
  { id: "split-testing", title: "Split Testing" },
  { id: "sweepstakes", title: "Sweepstakes Offers" },
  { id: "fees", title: "Platform Fees" },
];

export default function SmartOffersTermsPage() {
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
          <span className="text-sm text-gray-400">Smart Offers Terms</span>
        </div>

        <h1 className="mb-2 font-heading text-3xl font-bold text-white md:text-4xl">
          PLATINUM DIRECTORY TEMECULA VALLEY
        </h1>
        <h2 className="mb-1 text-xl text-pd-purple-light">
          Smart Offers Terms
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
              {/* 1. What Are Smart Offers */}
              <h2 id="what-are">1. What Are Smart Offers</h2>
              <p>
                Smart Offers are digital vouchers and deals offered by local
                businesses through the Platinum Directory Temecula Valley
                platform. They allow consumers to purchase discounted offers
                directly from the platform and redeem them at participating
                businesses.
              </p>
              <p>
                Smart Offers may include percentage discounts, dollar-off deals,
                buy-one-get-one promotions, free add-ons, or other promotional
                offers as configured by the participating business.
              </p>

              {/* 2. Purchasing */}
              <h2 id="purchasing">2. Purchasing</h2>
              <ul>
                <li>
                  Smart Offers are purchased through the Platinum Directory
                  platform using a valid payment method processed via Stripe.
                </li>
                <li>
                  All prices are displayed in US Dollars and include applicable
                  platform fees.
                </li>
                <li>
                  Upon successful purchase, you will receive a confirmation
                  email with your voucher code and redemption instructions.
                </li>
                <li>
                  Smart Offers are non-transferable unless explicitly stated
                  otherwise in the offer terms.
                </li>
                <li>
                  Quantity limits may apply. Each offer will specify any per-user
                  purchase limits.
                </li>
              </ul>

              {/* 3. Redeeming */}
              <h2 id="redeeming">3. Redeeming</h2>
              <ul>
                <li>
                  Present your Smart Offer voucher code at the participating
                  business at the time of redemption.
                </li>
                <li>
                  Redemption may be handled via a unique code, QR code, or
                  through the merchant&apos;s dashboard on the platform.
                </li>
                <li>
                  Each Smart Offer can only be redeemed once unless specified as
                  a multi-use offer.
                </li>
                <li>
                  Partial redemption is not permitted. The full value of the
                  offer must be used in a single transaction.
                </li>
                <li>
                  The business reserves the right to verify the validity of the
                  voucher before honoring the offer.
                </li>
              </ul>

              {/* 4. Expiration */}
              <h2 id="expiration">4. Expiration</h2>
              <ul>
                <li>
                  Each Smart Offer has a clearly stated expiration date displayed
                  at the time of purchase.
                </li>
                <li>
                  Expired Smart Offers cannot be redeemed and are not eligible
                  for a refund.
                </li>
                <li>
                  It is your responsibility to redeem your Smart Offer before
                  the expiration date.
                </li>
                <li>
                  Businesses may extend expiration dates at their discretion, but
                  are not required to do so.
                </li>
              </ul>

              {/* 5. Refund Policy */}
              <h2 id="refunds">5. Refund Policy</h2>
              <ul>
                <li>
                  Unredeemed Smart Offers may be eligible for a refund within 7
                  days of purchase.
                </li>
                <li>
                  Redeemed Smart Offers are not eligible for a refund.
                </li>
                <li>
                  Refund requests should be submitted through your account
                  dashboard or by contacting support.
                </li>
                <li>
                  If a business closes or is unable to honor a valid Smart Offer,
                  Platinum Directory will issue a full refund or platform credit.
                </li>
                <li>
                  Refunds are processed to the original payment method and may
                  take 5&ndash;10 business days to appear.
                </li>
              </ul>

              {/* 6. Merchant Responsibility */}
              <h2 id="merchant">6. Merchant Responsibility</h2>
              <ul>
                <li>
                  Participating businesses are solely responsible for honoring
                  all valid, unexpired Smart Offers.
                </li>
                <li>
                  Businesses must provide the goods or services as described in
                  the Smart Offer listing.
                </li>
                <li>
                  Disputes regarding the quality of goods or services should be
                  directed to the business first, and then to Platinum Directory
                  support if unresolved.
                </li>
                <li>
                  Platinum Directory acts as a marketplace facilitator and is not
                  the provider of the underlying goods or services.
                </li>
              </ul>

              {/* 7. Rewards Points on Purchases */}
              <h2 id="rewards">7. Rewards Points on Purchases</h2>
              <ul>
                <li>
                  Eligible Smart Offer purchases earn rewards points as
                  described in the Rewards &amp; Points Program section of our
                  Terms of Service.
                </li>
                <li>
                  Points are credited to your account after the Smart Offer is
                  redeemed, not at the time of purchase.
                </li>
                <li>
                  If a Smart Offer is refunded, any associated points will be
                  deducted from your account.
                </li>
                <li>
                  Bonus point promotions on select Smart Offers may be offered
                  from time to time at the platform&apos;s discretion.
                </li>
              </ul>

              {/* 8. Split Testing */}
              <h2 id="split-testing">8. Split Testing</h2>
              <p>
                Platinum Directory may conduct split testing (A/B testing) on
                Smart Offer pricing, presentation, and promotional strategies.
                This means:
              </p>
              <ul>
                <li>
                  Different users may see different offer prices, layouts, or
                  promotional messaging for the same underlying offer.
                </li>
                <li>
                  Split testing helps us optimize the platform experience and
                  improve offer performance for both consumers and businesses.
                </li>
                <li>
                  The final price you pay is the price shown to you at the time
                  of checkout.
                </li>
              </ul>

              {/* 9. Sweepstakes Offers */}
              <h2 id="sweepstakes">9. Sweepstakes Offers</h2>
              <ul>
                <li>
                  Some Smart Offers may include entry into sweepstakes or
                  giveaways as an added incentive.
                </li>
                <li>
                  Sweepstakes entries earned through Smart Offer purchases are
                  subject to the individual sweepstakes rules and eligibility
                  requirements.
                </li>
                <li>
                  No purchase is necessary to enter any sweepstakes. Free
                  alternate entry methods are available as described in the
                  official sweepstakes rules.
                </li>
                <li>
                  Sweepstakes are void where prohibited by law.
                </li>
              </ul>

              {/* 10. Platform Fees */}
              <h2 id="fees">10. Platform Fees</h2>
              <p>
                Platinum Directory charges a platform fee on each Smart Offer
                transaction. The fee varies based on the business&apos;s
                subscription tier:
              </p>
              <ul>
                <li>
                  <strong>Free tier:</strong> 30% platform fee
                </li>
                <li>
                  <strong>Silver tier:</strong> 25% platform fee
                </li>
                <li>
                  <strong>Gold tier:</strong> 20% platform fee
                </li>
                <li>
                  <strong>Platinum tier:</strong> 15% platform fee
                </li>
              </ul>
              <p>
                Platform fees are deducted from the transaction amount before
                payout to the business. Fees are subject to change with 30 days
                notice to participating businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
