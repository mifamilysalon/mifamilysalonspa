"use client";

type GiftCertificateProps = {
  salonName: string;
  address: string;
  phonePrimary: string;
  phoneSecondary?: string;
  /** Preview sample values shown on the public page */
  recipient?: string;
  from?: string;
  amount?: string;
  issuedDate?: string;
  validUntilDate?: string;
  certificateId?: string;
};

export function GiftCertificateTemplate({
  salonName,
  address,
  phonePrimary,
  phoneSecondary,
  recipient = "________________",
  from = "________________",
  amount = "$______",
  issuedDate = "____________",
  validUntilDate = "____________",
  certificateId = "GC-____",
}: GiftCertificateProps) {
  return (
    <div className="gift-cert" id="gift-certificate">
      <div className="gift-cert-frame">
        <div className="gift-cert-ornament gift-cert-ornament-tl" aria-hidden />
        <div className="gift-cert-ornament gift-cert-ornament-tr" aria-hidden />
        <div className="gift-cert-ornament gift-cert-ornament-bl" aria-hidden />
        <div className="gift-cert-ornament gift-cert-ornament-br" aria-hidden />

        <p className="gift-cert-kicker">A gift of care</p>
        <h2 className="gift-cert-brand">{salonName}</h2>
        <p className="gift-cert-title">Gift Certificate</p>

        <div className="gift-cert-rule" />

        <dl className="gift-cert-fields">
          <div className="gift-cert-field">
            <dt>Presented to</dt>
            <dd>{recipient}</dd>
          </div>
          <div className="gift-cert-field">
            <dt>From</dt>
            <dd>{from}</dd>
          </div>
          <div className="gift-cert-field gift-cert-amount">
            <dt>Amount</dt>
            <dd>{amount}</dd>
          </div>
          <div className="gift-cert-field">
            <dt>Date issued</dt>
            <dd>{issuedDate}</dd>
          </div>
          <div className="gift-cert-field">
            <dt>Valid until</dt>
            <dd>{validUntilDate}</dd>
          </div>
        </dl>

        <p className="gift-cert-note">
          Redeemable for hair, skin, nail, and wellness services through the
          valid-until date. Present the certificate code in salon for
          single-use validation. Not redeemable for cash.
        </p>

        <div className="gift-cert-footer">
          <div>
            <p className="gift-cert-address">{address}</p>
            <p className="gift-cert-phones">
              {phonePrimary}
              {phoneSecondary ? ` · ${phoneSecondary}` : ""}
            </p>
          </div>
          <p className="gift-cert-id">{certificateId}</p>
        </div>
      </div>
    </div>
  );
}

export function GiftCertificatePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden border border-salon-border px-5 py-2.5 text-sm font-medium text-salon-heading transition hover:border-salon-primary hover:text-salon-primary"
    >
      Print certificate template
    </button>
  );
}
