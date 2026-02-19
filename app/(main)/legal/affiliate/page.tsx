import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Program Terms",
};

const sections = [
  { id: "overview", title: "Program Overview" },
  { id: "eligibility", title: "Eligibility & Approval" },
  { id: "commissions", title: "Commission Structure" },
  { id: "payment", title: "Payment" },
  { id: "prohibited", title: "Prohibited Activities" },
  { id: "taxes", title: "Taxes" },
  { id: "changes", title: "Program Changes" },
];

export default function AffiliateTermsPage() {
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
            Affiliate Program Terms
          </span>
        </div>

        <h1 className="mb-2 font-heading text-3xl font-bold text-white md:text-4xl">
          PLATINUM DIRECTORY TEMECULA VALLEY
        </h1>
        <h2 className="mb-1 text-xl text-pd-purple-light">
          Affiliate Program Terms
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
              {/* 1. Program Overview */}
              <h2 id="overview">1. Program Overview</h2>
              <p>
                The Platinum Directory Temecula Valley Affiliate Program allows
                approved participants (&quot;Affiliates&quot;) to earn
                commissions by referring new customers and businesses to the
                platform. Affiliates receive a unique referral link and tracking
                code to share with their audience.
              </p>
              <p>
                The program is designed for content creators, local influencers,
                community leaders, business consultants, and anyone who wants to
                promote Platinum Directory to the Temecula Valley community.
              </p>

              {/* 2. Eligibility & Approval */}
              <h2 id="eligibility">2. Eligibility &amp; Approval</h2>
              <ul>
                <li>
                  You must be at least 18 years old and a legal resident of the
                  United States to participate.
                </li>
                <li>
                  You must have an active Platinum Directory account in good
                  standing.
                </li>
                <li>
                  All affiliate applications are subject to review and approval
                  by Platinum Directory.
                </li>
                <li>
                  We reserve the right to reject any application or revoke
                  affiliate status at any time, with or without cause.
                </li>
                <li>
                  Businesses listed on the platform may also participate as
                  affiliates, but may not earn commissions on their own
                  purchases or subscriptions.
                </li>
              </ul>

              {/* 3. Commission Structure */}
              <h2 id="commissions">3. Commission Structure</h2>

              <h3>Smart Offer Commissions</h3>
              <ul>
                <li>
                  Earn <strong>5% commission</strong> on every Smart Offer
                  purchased by a customer you referred.
                </li>
                <li>
                  Commission is calculated on the net sale amount (after any
                  platform fees).
                </li>
                <li>
                  Commission is earned when the Smart Offer is redeemed, not at
                  the time of purchase.
                </li>
              </ul>

              <h3>Subscription Commissions</h3>
              <ul>
                <li>
                  Earn <strong>5% recurring commission</strong> on subscription
                  fees paid by businesses you refer to the platform.
                </li>
                <li>
                  Recurring commissions continue for as long as the referred
                  business maintains an active paid subscription.
                </li>
                <li>
                  Commission is calculated on the subscription amount actually
                  paid (after any discounts or credits).
                </li>
              </ul>

              <h3>Cookie Duration</h3>
              <ul>
                <li>
                  Referral tracking uses a <strong>90-day cookie</strong>{" "}
                  window.
                </li>
                <li>
                  If a referred user makes a purchase within 90 days of clicking
                  your referral link, you earn the commission.
                </li>
                <li>
                  First-click attribution applies: the first affiliate link
                  clicked by the user receives credit for the referral.
                </li>
              </ul>

              {/* 4. Payment */}
              <h2 id="payment">4. Payment</h2>
              <ul>
                <li>
                  <strong>Minimum payout:</strong> $25.00. Commissions below the
                  minimum threshold will roll over to the next payment period.
                </li>
                <li>
                  Payments are processed monthly, on or around the 15th of each
                  month, for commissions earned in the prior month.
                </li>
                <li>
                  <strong>Payment methods:</strong> Stripe, PayPal, or platform
                  credit. You may select your preferred payment method in your
                  affiliate dashboard.
                </li>
                <li>
                  If a referred purchase is refunded, the associated commission
                  will be deducted from your next payout.
                </li>
                <li>
                  Platinum Directory reserves the right to withhold payment if
                  fraudulent or suspicious activity is detected, pending
                  investigation.
                </li>
              </ul>

              {/* 5. Prohibited Activities */}
              <h2 id="prohibited">5. Prohibited Activities</h2>
              <p>Affiliates may not engage in any of the following:</p>
              <ul>
                <li>
                  <strong>Self-referral:</strong> Using your own referral link to
                  earn commissions on your own purchases or subscriptions.
                </li>
                <li>
                  <strong>Cookie stuffing:</strong> Attempting to set referral
                  cookies without genuine user interaction.
                </li>
                <li>
                  <strong>Misleading promotion:</strong> Making false or
                  exaggerated claims about Platinum Directory, its services, or
                  potential earnings.
                </li>
                <li>
                  <strong>Spam:</strong> Sending unsolicited bulk emails, text
                  messages, or social media messages promoting your referral
                  link.
                </li>
                <li>
                  <strong>Trademark bidding:</strong> Bidding on &quot;Platinum
                  Directory&quot; or related branded keywords in paid search
                  advertising without written permission.
                </li>
                <li>
                  <strong>Incentivized clicks:</strong> Offering rewards,
                  payments, or other incentives solely for clicking your
                  referral link (as opposed to making a genuine purchase).
                </li>
                <li>
                  <strong>Impersonation:</strong> Representing yourself as an
                  employee, agent, or official representative of Platinum
                  Directory.
                </li>
              </ul>
              <p>
                Violation of any prohibited activity will result in immediate
                termination of your affiliate account, forfeiture of unpaid
                commissions, and potential legal action.
              </p>

              {/* 6. Taxes */}
              <h2 id="taxes">6. Taxes</h2>
              <ul>
                <li>
                  Affiliates are solely responsible for reporting and paying all
                  applicable taxes on commissions earned.
                </li>
                <li>
                  Platinum Directory will issue a <strong>1099-NEC</strong> form
                  to any affiliate who earns $600 or more in commissions in a
                  calendar year, as required by the IRS.
                </li>
                <li>
                  You may be required to provide a valid W-9 form before
                  receiving your first payout.
                </li>
                <li>
                  Platinum Directory does not withhold taxes from commission
                  payments. It is your responsibility to set aside appropriate
                  amounts for tax obligations.
                </li>
                <li>
                  International affiliates (if applicable) are responsible for
                  complying with tax laws in their jurisdiction.
                </li>
              </ul>

              {/* 7. Program Changes */}
              <h2 id="changes">7. Program Changes</h2>
              <ul>
                <li>
                  Platinum Directory reserves the right to modify, suspend, or
                  terminate the Affiliate Program at any time.
                </li>
                <li>
                  Changes to commission rates, cookie duration, payment terms, or
                  program rules will be communicated via email with at least 30
                  days notice.
                </li>
                <li>
                  Continued participation in the program after changes take
                  effect constitutes acceptance of the updated terms.
                </li>
                <li>
                  If the program is terminated, affiliates will receive payment
                  for all commissions earned up to the termination date,
                  provided the minimum payout threshold has been met.
                </li>
                <li>
                  Platinum Directory is not liable for any lost earnings or
                  damages resulting from program modifications or termination.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
