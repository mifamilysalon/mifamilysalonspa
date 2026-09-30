import Link from "next/link";
import { HoursLines } from "@/components/layout/HoursLines";
import { LOCAL_BUSINESS } from "@/lib/seo";
import type { BusinessInfo } from "@/lib/site";

export function GiftCertificatesLanding({
  business,
}: {
  business: BusinessInfo;
}) {
  const telPrimary = business.phone_primary.replace(/\D/g, "");
  const telSecondary = business.phone_secondary.replace(/\D/g, "");
  const mapsUrl = business.maps_url || LOCAL_BUSINESS.mapsUrl;

  return (
    <div className="gift-landing">
      <section className="gift-landing-hero">
        <div className="gift-landing-copy">
          <h1 className="font-serif">Give the gift of care.</h1>
          <p className="gift-landing-lead">
            A gift certificate for hair, skin, nail, or wellness services. Buy
            one in minutes by phone or at the salon, printed or emailed.
          </p>
          <div className="gift-landing-acts">
            <a href={`tel:${telPrimary}`} className="gift-landing-btn">
              Call to purchase: {business.phone_primary}
            </a>
            <a href="#visit" className="gift-landing-btn gift-landing-btn-ghost">
              Visit the salon
            </a>
          </div>
          <p className="gift-landing-sub">
            Certificates are sold by phone or in person only. We don&apos;t take
            gift certificate payments online.
          </p>
        </div>

        <div className="gift-landing-cert" aria-label="Sample gift certificate">
          <div className="gift-landing-cert-in">
            <p className="gift-landing-cert-kicker">A gift of care</p>
            <h2 className="font-serif">{business.name}</h2>
            <p className="gift-landing-cert-title font-serif">Gift Certificate</p>
            <dl>
              <div>
                <dt>Presented to</dt>
                <dd className="font-serif">Someone special</dd>
              </div>
              <div>
                <dt>From</dt>
                <dd className="font-serif">You</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd className="font-serif">$100</dd>
              </div>
              <div>
                <dt>Valid until</dt>
                <dd className="font-serif">Date on certificate</dd>
              </div>
            </dl>
            <p className="gift-landing-cert-fine">
              Redeemable for hair, skin, nail, and wellness services. Not
              redeemable for cash.
            </p>
            <div className="gift-landing-cert-meta">
              <span>{business.address.split(",")[0]}</span>
              <span>GC-0000</span>
            </div>
          </div>
        </div>
      </section>

      <section className="gift-landing-tint">
        <h2 className="font-serif gift-landing-sec">How it works</h2>
        <p className="gift-landing-sec-sub">
          No account, no checkout page. Just a quick call.
        </p>
        <ol className="gift-landing-steps">
          <li>
            <h3>Call or stop by</h3>
            <p>
              Reach us at {business.phone_primary} or {business.phone_secondary},
              or visit us during opening hours.
            </p>
          </li>
          <li>
            <h3>Pick an amount or a service</h3>
            <p>
              Give a set amount, or a specific treatment like a facial or
              manicure. We&apos;ll help you choose.
            </p>
          </li>
          <li>
            <h3>Take it or send it</h3>
            <p>
              Take a printed certificate with you, or we email a designed one
              straight to the recipient.
            </p>
          </li>
        </ol>
      </section>

      <section>
        <h2 className="font-serif gift-landing-sec">What it covers</h2>
        <p className="gift-landing-sec-sub">
          One certificate works across all of our services.
        </p>
        <div className="gift-landing-tiles">
          <article>
            <h3 className="font-serif">Hair</h3>
            <p>Cuts, color, styling, and treatments.</p>
            <Link href="/hair-care">See hair care</Link>
          </article>
          <article>
            <h3 className="font-serif">Skin</h3>
            <p>Facials, threading, waxing, and lashes.</p>
            <Link href="/facials">See facials</Link>
          </article>
          <article>
            <h3 className="font-serif">Nails</h3>
            <p>Manicures, pedicures, and nail art.</p>
            <Link href="/nail-care">See nail care</Link>
          </article>
          <article>
            <h3 className="font-serif">Wellness</h3>
            <p>Relaxing treatments to slow down.</p>
            <Link href="/wellness">See wellness</Link>
          </article>
        </div>
        <div className="gift-landing-suite">
          <p>
            Know someone who prefers a quieter setting? Ask about a certificate
            for our private suite.
          </p>
          <Link href="/private-area" className="gift-landing-btn gift-landing-btn-sm">
            About the private suite
          </Link>
        </div>
      </section>

      <section className="gift-landing-tint">
        <h2 className="font-serif gift-landing-sec">Questions</h2>
        <div className="gift-landing-faq">
          <details>
            <summary>Can I buy a certificate online?</summary>
            <p>
              Not at this time. Please call {business.phone_primary} or{" "}
              {business.phone_secondary}, or visit us at the salon.
            </p>
          </details>
          <details>
            <summary>How does the recipient get it?</summary>
            <p>
              You can take a printed certificate with you, or we can email a
              designed certificate to the recipient after you purchase.
            </p>
          </details>
          <details>
            <summary>How is it redeemed?</summary>
            <p>
              The recipient presents the certificate code at the salon, and staff
              validate it at the desk. Remaining balance can be used on later
              visits through the valid-until date.
            </p>
          </details>
          <details>
            <summary>Is it redeemable for cash?</summary>
            <p>
              No. Certificates are for hair, skin, nail, and wellness services
              through the valid-until date.
            </p>
          </details>
        </div>
      </section>

      <section id="visit" className="gift-landing-visit-wrap">
        <div className="gift-landing-visit">
          <div>
            <h2 className="font-serif">Ready to give one?</h2>
            <p>{business.address}</p>
            <div className="gift-landing-acts mt-4">
              <a href={`tel:${telPrimary}`} className="gift-landing-btn">
                Call to purchase
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gift-landing-btn gift-landing-btn-ghost"
              >
                Get directions
              </a>
            </div>
          </div>
          <div className="gift-landing-hours">
            <p className="gift-landing-hours-label">Hours</p>
            <HoursLines
              hours={business.hours}
              className="gift-landing-hours-list"
            />
            <p className="mt-4">
              <a href={`tel:${telPrimary}`}>{business.phone_primary}</a>
            </p>
            <p>
              <a href={`tel:${telSecondary}`}>{business.phone_secondary}</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
