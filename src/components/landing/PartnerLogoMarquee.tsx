import type { CSSProperties } from "react";
import airtel from "@/assets/integrations/airtel.svg.asset.json";
import alibaba from "@/assets/integrations/alibabadotcom.svg.asset.json";
import celtiis from "@/assets/integrations/celtiis.svg.asset.json";
import cjDropshipping from "@/assets/integrations/cjdropshipping-official.svg.asset.json";
import dhl from "@/assets/integrations/dhl.svg.asset.json";
import fedex from "@/assets/integrations/fedex.svg.asset.json";
import gozem from "@/assets/integrations/gozem.png.asset.json";
import mastercard from "@/assets/integrations/mastercard.svg.asset.json";
import moneroo from "@/assets/integrations/moneroo.svg.asset.json";
import mpesa from "@/assets/integrations/mpesa.svg.asset.json";
import mtnMomo from "@/assets/integrations/mtn-momo-official.svg.asset.json";
import orangeMoney from "@/assets/integrations/orange-money.svg.asset.json";
import pawapay from "@/assets/integrations/pawapay.svg.asset.json";
import ups from "@/assets/integrations/ups.svg.asset.json";
import visa from "@/assets/integrations/visa.svg.asset.json";
import wave from "@/assets/integrations/wave.png.asset.json";

type Integration = {
  name: string;
  logo?: string;
  displayName?: string;
};

export const integrations: Integration[] = [
  { name: "Moneroo", logo: moneroo.url },
  { name: "pawaPay", logo: pawapay.url },
  { name: "MTN MoMo", logo: mtnMomo.url },
  { name: "Moov Money", displayName: "moov money" },
  { name: "Orange Money", logo: orangeMoney.url },
  { name: "Wave", logo: wave.url },
  { name: "Celtiis", logo: celtiis.url },
  { name: "Airtel Money", logo: airtel.url },
  { name: "M-Pesa", logo: mpesa.url },
  { name: "Visa", logo: visa.url },
  { name: "Mastercard", logo: mastercard.url },
  { name: "Gozem", logo: gozem.url },
  { name: "DHL", logo: dhl.url },
  { name: "FedEx", logo: fedex.url },
  { name: "UPS", logo: ups.url },
  { name: "Alibaba", logo: alibaba.url },
  { name: "1688", displayName: "1688.com" },
  { name: "CJdropshipping", logo: cjDropshipping.url },
];

const paymentIntegrations = integrations.slice(0, 11);
const commerceIntegrations = integrations.slice(11);

function Logo({ integration }: { integration: Integration }) {
  return (
    <div className="partner-logo" title={integration.name}>
      {integration.logo ? (
        <img
          src={integration.logo}
          alt={`${integration.name} — solution compatible avec AFRISELL`}
          width={150}
          height={46}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span aria-label={`${integration.name} — solution compatible avec AFRISELL`}>
          {integration.displayName ?? integration.name}
        </span>
      )}
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  duration,
}: {
  items: Integration[];
  reverse?: boolean;
  duration: number;
}) {
  const style = { "--marquee-duration": `${duration}s` } as CSSProperties;

  return (
    <div className="partner-marquee" style={style}>
      <div className={`partner-marquee-track${reverse ? " partner-marquee-track-reverse" : ""}`}>
        {[0, 1].map((copy) => (
          <div className="partner-marquee-group" key={copy} aria-hidden={copy === 1}>
            {items.map((integration) => (
              <Logo integration={integration} key={`${copy}-${integration.name}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PartnerLogoMarquee() {
  return (
    <section aria-labelledby="ecosystem-title" className="overflow-hidden border-y border-border bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Intégrations et solutions compatibles</p>
        <h2 id="ecosystem-title" className="mt-3 text-3xl font-bold sm:text-4xl">
          Un écosystème pensé pour l’Afrique
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          AFRISELL s’intègre avec les solutions qui permettent aux entrepreneurs africains de vendre,
          encaisser et développer leur activité.
        </p>
        <p className="mt-5 text-xs font-semibold uppercase text-muted-foreground">
          Paiements <span aria-hidden="true">•</span> Livraison <span aria-hidden="true">•</span> Commerce{" "}
          <span aria-hidden="true">•</span> Sourcing
        </p>
      </div>

      <div className="mt-10 space-y-3 sm:mt-12 sm:space-y-5">
        <MarqueeRow items={paymentIntegrations} duration={32} />
        <MarqueeRow items={commerceIntegrations} reverse duration={28} />
      </div>
    </section>
  );
}