import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const sections = [
  { id: "info-collect", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "business-data", title: "Business Data & Media" },
  { id: "sharing", title: "Sharing Your Information" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "ccpa", title: "California Privacy Rights (CCPA)" },
  { id: "retention", title: "Data Retention" },
  { id: "security", title: "Security" },
  { id: "children", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPolicyPage() {
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
          <span className="text-sm text-gray-400">Privacy Policy</span>
        </div>

        <h1 className="mb-2 font-heading text-3xl font-bold text-white md:text-4xl">
          PLATINUM DIRECTORY TEMECULA VALLEY
        </h1>
        <h2 className="mb-1 text-xl text-pd-purple-light">Privacy Policy</h2>
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
              {/* 1. Information We Collect */}
              <h2 id="info-collect">1. Information We Collect</h2>

              <h3>Information You Provide</h3>
              <ul>
                <li>Account information (name, email, phone, password)</li>
                <li>Profile info (city, photo)</li>
                <li>Business info (if claiming a listing)</li>
                <li>Payment info (processed via Stripe)</li>
                <li>Communications</li>
              </ul>

              <h3>Information We Collect Automatically</h3>
              <ul>
                <li>Usage data</li>
                <li>Device info</li>
                <li>
                  Cookies and tracking (visitor ID, session data, referral
                  source)
                </li>
                <li>UTM parameters</li>
                <li>Click IDs (gclid, fbclid)</li>
              </ul>

              <h3>Information From Third Parties</h3>
              <ul>
                <li>Google/Facebook/Apple OAuth data</li>
                <li>Business data enrichment from public sources</li>
              </ul>

              {/* 2. How We Use Your Information */}
              <h2 id="how-we-use">2. How We Use Your Information</h2>
              <ul>
                <li>Provide and improve the platform</li>
                <li>Process purchases</li>
                <li>Send transactional and marketing communications</li>
                <li>Calculate rewards and commissions</li>
                <li>Detect fraud</li>
                <li>Analyze usage</li>
                <li>Legal compliance</li>
              </ul>

              {/* 3. Business Data & Media */}
              <h2 id="business-data">3. Business Data &amp; Media</h2>
              <ul>
                <li>
                  We display publicly available business information.
                </li>
                <li>We enrich listings using public data.</li>
                <li>
                  Images are only displayed for claimed businesses that accepted
                  Business Terms.
                </li>
                <li>Unclaimed listings show basic info only.</li>
              </ul>

              {/* 4. Sharing Your Information */}
              <h2 id="sharing">4. Sharing Your Information</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>
                  Service providers (Supabase, Stripe, Postmark, Twilio, Mapbox,
                  Vercel)
                </li>
                <li>Business owners (for contacts/offers)</li>
                <li>Analytics (anonymized)</li>
                <li>Legal requirements</li>
              </ul>
              <p>We do not sell personal information.</p>

              {/* 5. Cookies & Tracking */}
              <h2 id="cookies">5. Cookies &amp; Tracking</h2>
              <ul>
                <li>
                  <strong>pd_visitor_id</strong> &mdash; 2-year duration
                </li>
                <li>
                  <strong>pd_tracking</strong> &mdash; session/30-day duration
                </li>
                <li>
                  <strong>pd_ref</strong> &mdash; 90-day duration
                </li>
                <li>
                  <strong>Authentication cookies</strong> &mdash; session-based
                </li>
                <li>
                  <strong>GTM</strong> &mdash; when enabled
                </li>
              </ul>

              {/* 6. California Privacy Rights (CCPA) */}
              <h2 id="ccpa">6. California Privacy Rights (CCPA)</h2>
              <p>
                California residents have the following rights under the
                California Consumer Privacy Act:
              </p>
              <ul>
                <li>
                  <strong>Right to know</strong> &mdash; You may request
                  information about the categories and specific pieces of
                  personal information we have collected about you.
                </li>
                <li>
                  <strong>Right to delete</strong> &mdash; You may request
                  deletion of your personal information.
                </li>
                <li>
                  <strong>Right to opt out</strong> &mdash; We do not sell your
                  data.
                </li>
                <li>
                  <strong>Non-discrimination</strong> &mdash; We will not
                  discriminate against you for exercising your privacy rights.
                </li>
              </ul>
              <p>
                Contact:{" "}
                <a
                  href="mailto:privacy@platinumdirectorytemeculavalley.com"
                  className="text-pd-purple-light hover:underline"
                >
                  privacy@platinumdirectorytemeculavalley.com
                </a>
              </p>

              {/* 7. Data Retention */}
              <h2 id="retention">7. Data Retention</h2>
              <p>
                Data is retained while your account is active. You may request
                deletion of your data at any time.
              </p>

              {/* 8. Security */}
              <h2 id="security">8. Security</h2>
              <p>
                We take security seriously and employ industry-standard measures
                to protect your information:
              </p>
              <ul>
                <li>Encryption of data at rest and in transit</li>
                <li>HTTPS for all communications</li>
                <li>Row-level security on database operations</li>
              </ul>

              {/* 9. Children's Privacy */}
              <h2 id="children">9. Children&apos;s Privacy</h2>
              <p>
                The Platform is not directed to individuals under 18 years of
                age. We do not knowingly collect personal information from
                children under 18. If we learn that we have collected personal
                information from a child under 18, we will take steps to delete
                such information promptly.
              </p>

              {/* 10. Changes to This Policy */}
              <h2 id="changes">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you via email for material changes. Your continued use of
                the Platform after any modifications constitutes acceptance of
                the updated policy.
              </p>

              {/* 11. Contact */}
              <h2 id="contact">11. Contact</h2>
              <p>
                <a
                  href="mailto:privacy@platinumdirectorytemeculavalley.com"
                  className="text-pd-purple-light hover:underline"
                >
                  privacy@platinumdirectorytemeculavalley.com
                </a>
                <br />
                Temecula, CA 92590
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
