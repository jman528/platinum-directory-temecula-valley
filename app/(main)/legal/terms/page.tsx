import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Description of Service" },
  { id: "accounts", title: "User Accounts" },
  { id: "communications", title: "Communications Consent" },
  { id: "rewards", title: "Rewards & Points Program" },
  { id: "referral", title: "Referral Program" },
  { id: "prohibited", title: "Prohibited Conduct" },
  { id: "ip", title: "Intellectual Property" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsOfServicePage() {
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
          <span className="text-sm text-gray-400">Terms of Service</span>
        </div>

        <h1 className="mb-2 font-heading text-3xl font-bold text-white md:text-4xl">
          PLATINUM DIRECTORY TEMECULA VALLEY
        </h1>
        <h2 className="mb-1 text-xl text-pd-purple-light">
          Terms of Service
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
              {/* 1. Acceptance of Terms */}
              <h2 id="acceptance">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Platinum Directory Temecula Valley
                (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;), you agree
                to be bound by these Terms of Service. If you do not agree, do
                not use the Platform.
              </p>

              {/* 2. Description of Service */}
              <h2 id="description">2. Description of Service</h2>
              <p>
                Platinum Directory is an online business directory and marketing
                platform serving the Temecula Valley region. We provide business
                listings, Smart Offers (digital vouchers and deals), a rewards
                and referral program, and related marketing services.
              </p>

              {/* 3. User Accounts */}
              <h2 id="accounts">3. User Accounts</h2>
              <ul>
                <li>You must be 18 or older to create an account.</li>
                <li>
                  You are responsible for maintaining the security of your
                  account credentials.
                </li>
                <li>
                  You must provide accurate information when creating your
                  account.
                </li>
                <li>
                  One account per person. Multiple accounts may result in
                  termination.
                </li>
              </ul>

              {/* 4. Communications Consent */}
              <h2 id="communications">4. Communications Consent</h2>
              <p>
                By creating an account and checking the communications consent
                box, you expressly consent to receive:
              </p>
              <h3>Transactional Messages</h3>
              <ul>
                <li>Account confirmations</li>
                <li>Purchase receipts</li>
                <li>Security alerts</li>
              </ul>
              <h3>Marketing Communications</h3>
              <ul>
                <li>Promotions</li>
                <li>Newsletters</li>
                <li>Local deals</li>
                <li>Platform updates</li>
              </ul>
              <p>
                Via email and SMS/text message to the contact information you
                provide.
              </p>
              <h3>Opting Out</h3>
              <p>
                You may opt out of marketing communications at any time by:
              </p>
              <ul>
                <li>
                  Clicking &quot;unsubscribe&quot; in any marketing email.
                </li>
                <li>Replying STOP to any SMS message.</li>
                <li>
                  Updating your preferences in your account dashboard.
                </li>
              </ul>
              <p>
                Standard message and data rates may apply to SMS communications.
                Opting out of marketing communications does not affect
                transactional messages related to your account or purchases.
              </p>

              {/* 5. Rewards & Points Program */}
              <h2 id="rewards">5. Rewards &amp; Points Program</h2>
              <ul>
                <li>
                  Points have no cash value except as redeemable through our
                  platform.
                </li>
                <li>Minimum redemption: 5,000 points ($5.00).</li>
                <li>
                  Points expire after 12 months of account inactivity.
                </li>
                <li>
                  We reserve the right to modify, suspend, or terminate the
                  rewards program with 30 days notice.
                </li>
                <li>
                  Points are non-transferable and have no value outside the
                  platform.
                </li>
                <li>
                  Fraudulent activity will result in forfeiture of all points
                  and account termination.
                </li>
              </ul>

              {/* 6. Referral Program */}
              <h2 id="referral">6. Referral Program</h2>
              <ul>
                <li>
                  Referral commissions are paid only on legitimate referred
                  purchases.
                </li>
                <li>
                  We reserve the right to reverse commissions for refunded or
                  fraudulent transactions.
                </li>
                <li>Referral codes may not be used for self-referral.</li>
                <li>
                  Attempting to manipulate the referral system will result in
                  account termination.
                </li>
              </ul>

              {/* 7. Prohibited Conduct */}
              <h2 id="prohibited">7. Prohibited Conduct</h2>
              <p>You may not:</p>
              <ul>
                <li>Use the platform for any unlawful purpose.</li>
                <li>Submit false or misleading information.</li>
                <li>
                  Attempt to manipulate reviews, ratings, or the rewards system.
                </li>
                <li>
                  Scrape or copy platform content without permission.
                </li>
                <li>
                  Interfere with platform security or functionality.
                </li>
              </ul>

              {/* 8. Intellectual Property */}
              <h2 id="ip">8. Intellectual Property</h2>
              <p>
                All platform content, design, and technology is owned by
                Platinum Directory or its licensors. You may not reproduce or
                distribute platform content without written permission.
              </p>

              {/* 9. Disclaimers */}
              <h2 id="disclaimers">9. Disclaimers</h2>
              <p>
                The platform is provided &quot;as is.&quot; We do not guarantee
                the accuracy of business listings or user-submitted content. We
                are not responsible for transactions between users and listed
                businesses.
              </p>

              {/* 10. Limitation of Liability */}
              <h2 id="liability">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Platinum Directory shall
                not be liable for indirect, incidental, or consequential damages
                arising from your use of the platform.
              </p>

              {/* 11. Governing Law */}
              <h2 id="governing-law">11. Governing Law</h2>
              <p>
                These terms are governed by the laws of the State of California.
                Disputes shall be resolved in Riverside County, California.
              </p>

              {/* 12. Changes to Terms */}
              <h2 id="changes">12. Changes to Terms</h2>
              <p>
                We may update these terms at any time. Continued use of the
                platform after changes constitutes acceptance of the new terms.
                Material changes will be communicated via email.
              </p>

              {/* 13. Contact */}
              <h2 id="contact">13. Contact</h2>
              <p>
                Platinum Directory Temecula Valley
                <br />
                Temecula, CA 92590
                <br />
                <a
                  href="mailto:support@platinumdirectorytemeculavalley.com"
                  className="text-pd-purple-light hover:underline"
                >
                  support@platinumdirectorytemeculavalley.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
