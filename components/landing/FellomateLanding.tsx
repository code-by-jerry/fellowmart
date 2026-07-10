import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Headphones,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Shield,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-config-server";
import { storePath } from "@/lib/routes/store-routes";
import {
  getPublicSubscriptionPlans,
  toLandingPricingPeriod,
} from "@/lib/subscriptions/plans";
import { themeCssVars } from "@/lib/utils/color";
import { DashboardMockup } from "./DashboardMockup";
import { LandingHeader } from "./LandingHeader";
import { LandingScrollReveal } from "./LandingScrollReveal";
import { LandingShowcase } from "./LandingShowcase";
import { LandingStatsBar } from "./LandingStatsBar";
import styles from "./landing.module.css";

const CONTACT_EMAIL = "contact@codebyjerry.online";
const CONTACT_PHONE = "7092936243";

const features = [
  {
    icon: Store,
    title: "Your own storefront",
    text: "Launch a branded shop with categories, products, cart, and checkout — on your own URL.",
  },
  {
    icon: LayoutDashboard,
    title: "Business dashboard",
    text: "Manage catalog, orders, subscriptions, and store settings from one clean panel.",
  },
  {
    icon: Shield,
    title: "Secure multi-tenant platform",
    text: "Each business is isolated with dedicated access, roles, and approval workflows.",
  },
  {
    icon: Zap,
    title: "Fast onboarding",
    text: "Apply online, get approved, and start selling with subscription-based plans.",
  },
];

const steps = [
  {
    icon: FileText,
    title: "Apply for your business account",
    text: "Submit your store details and choose your business type in minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Get approved by the Fellomart team",
    text: "Our platform operators review applications and provision your tenant.",
  },
  {
    icon: Store,
    title: "Configure your store and catalog",
    text: "Add categories, products, collections, and branding from the business portal.",
  },
  {
    icon: Rocket,
    title: "Go live at your dedicated store URL",
    text: "Share your public shop link and start accepting orders.",
  },
];

const trustItems = [
  { icon: ShieldCheck, label: "Secure & Reliable" },
  { icon: Zap, label: "Easy Onboarding" },
  { icon: Headphones, label: "24/7 Support" },
];

function formatBrandName(name: string) {
  if (!name) return "Fellomart";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function toLandingPlanCard(plan: Awaited<ReturnType<typeof getPublicSubscriptionPlans>>[number]) {
  const slashIndex = plan.price_display.indexOf("/");
  const price =
    slashIndex > -1
      ? plan.price_display.slice(0, slashIndex).trim()
      : plan.price_display;
  const period =
    slashIndex > -1
      ? `/${plan.price_display.slice(slashIndex + 1).trim()}`
      : toLandingPricingPeriod(plan);

  return {
    name: plan.name,
    price,
    period,
    featured: plan.is_featured,
    features: plan.features,
  };
}

export async function FellomateLanding() {
  const settings = await getSiteSettings();
  const brandName = formatBrandName(settings.app_name);
  const demoStoreHref = storePath(settings.marketplace_tenant_slug || "fellowmart");
  const plans = (await getPublicSubscriptionPlans()).map(toLandingPlanCard);

  return (
    <div className={styles.page} style={themeCssVars(settings.theme_color)}>
      <LandingHeader
        brandName={brandName}
        logoUrl={settings.logo_url}
        logoAlt={settings.logo_alt}
      />

      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroOrbs} aria-hidden="true">
          <span className={styles.heroOrb1} />
          <span className={styles.heroOrb2} />
          <span className={styles.heroOrb3} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={`${styles.eyebrow} ${styles.heroEyebrow}`}>
              <Rocket size={14} aria-hidden />
              Commerce platform for growing businesses
            </p>
            <h1>
              Run your business on <span>{brandName}</span>
            </h1>
            <p className={styles.lead}>
              Onboard your store, manage products and orders, and sell online with
              powerful tools and subscription plans built for modern businesses.
            </p>
            <div className={styles.heroActions}>
              <Link href="/apply" className={styles.primaryBtn}>
                Start your business <ArrowRight size={16} />
              </Link>
              <Link href={demoStoreHref} className={styles.secondaryBtn}>
                View demo storefront
              </Link>
            </div>
            <ul className={styles.trustRow}>
              {trustItems.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Icon size={16} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.heroMockupWrap}>
            <DashboardMockup />
            <div className={styles.heroFloatBadge}>
              <strong>+12.5%</strong>
              <span>Sales this week</span>
            </div>
          </div>
        </div>
      </section>

      <LandingStatsBar />

      <section className={`${styles.sectionBand} ${styles.sectionGray}`} id="features">
        <div className={styles.sectionInner}>
          <LandingScrollReveal>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionLabel}>Platform features</p>
              <h2>Everything you need to sell online</h2>
              <p>One platform. Three dedicated experiences.</p>
            </div>
          </LandingScrollReveal>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <LandingScrollReveal key={feature.title} delay={index * 70} fill>
                <article className={styles.featureCard}>
                  <span className={styles.featureIcon}>
                    <feature.icon size={20} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              </LandingScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <LandingShowcase demoStoreHref={demoStoreHref} />

      <section className={`${styles.sectionBand} ${styles.sectionDark}`} id="how-it-works">
        <div className={styles.sectionInner}>
          <LandingScrollReveal>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionLabel}>Onboarding</p>
              <h2>How onboarding works</h2>
              <p>From application to live storefront in a few clear steps.</p>
            </div>
          </LandingScrollReveal>
          <ol className={styles.timeline}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.timelineItem}>
                <div className={styles.timelineMarker}>
                  <span>{index + 1}</span>
                </div>
                <div className={styles.timelineBody}>
                  <span className={styles.timelineIcon}>
                    <step.icon size={18} />
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.ctaRow}>
            <Link href="/apply" className={styles.primaryBtn}>
              Apply for your business
            </Link>
            <Link href={demoStoreHref} className={`${styles.secondaryBtn} ${styles.secondaryBtnOnDark}`}>
              View demo storefront
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionBand} ${styles.sectionGray}`} id="pricing">
        <div className={styles.sectionInner}>
          <LandingScrollReveal>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionLabel}>Plans</p>
              <h2>Simple, transparent pricing</h2>
              <p>Start with an application — upgrade as your business grows.</p>
            </div>
          </LandingScrollReveal>
          <div className={styles.pricingGrid}>
            {plans.map((plan, index) => (
              <LandingScrollReveal key={plan.name} delay={index * 80} fill>
                <article
                  className={`${styles.pricingCard} ${plan.featured ? styles.pricingFeatured : ""}`}
                >
                  {plan.featured ? <span className={styles.pricingBadge}>Popular</span> : null}
                  <h3>{plan.name}</h3>
                  <p className={styles.pricingPrice}>
                    <strong>{plan.price}</strong>
                    {plan.period ? <span>{plan.period}</span> : null}
                  </p>
                  <ul>
                    {plan.features.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link
                    href="/apply"
                    className={plan.featured ? styles.primaryBtn : styles.secondaryBtn}
                  >
                    Get started
                  </Link>
                </article>
              </LandingScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.sectionBand} ${styles.sectionWhite}`} id="contact">
        <div className={styles.sectionInner}>
          <LandingScrollReveal>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionLabel}>Contact</p>
              <h2>Get in touch</h2>
              <p>
                Have questions about onboarding, pricing, or your store setup? Reach out —
                we&apos;re here to help you launch and grow.
              </p>
            </div>
          </LandingScrollReveal>

          <div className={styles.contactGrid}>
            <LandingScrollReveal delay={60} fill>
              <article className={styles.contactCard}>
                <span className={styles.contactIcon}>
                  <Mail size={20} />
                </span>
                <h3>Email us</h3>
                <p>Send us a message anytime and we&apos;ll get back to you promptly.</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>
                  {CONTACT_EMAIL}
                </a>
              </article>
            </LandingScrollReveal>

            <LandingScrollReveal delay={120} fill>
              <article className={styles.contactCard}>
                <span className={styles.contactIcon}>
                  <Phone size={20} />
                </span>
                <h3>Call us</h3>
                <p>Speak directly with our team for onboarding and support.</p>
                <a href={`tel:+91${CONTACT_PHONE}`} className={styles.contactLink}>
                  +91 {CONTACT_PHONE}
                </a>
              </article>
            </LandingScrollReveal>

            <LandingScrollReveal delay={180} fill>
              <article className={`${styles.contactCard} ${styles.contactCardCta}`}>
                <span className={styles.contactIcon}>
                  <MapPin size={20} />
                </span>
                <h3>Start your journey</h3>
                <p>Apply for a business account and go live in days, not months.</p>
                <Link href="/apply" className={styles.primaryBtn}>
                  Apply now <ArrowRight size={16} />
                </Link>
              </article>
            </LandingScrollReveal>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionBand} ${styles.sectionPrimary}`}>
        <div className={`${styles.sectionInner} ${styles.portalStrip}`}>
          <div>
            <p className={styles.sectionLabel}>Architecture</p>
            <h2>Three portals, one platform</h2>
            <p className={styles.portalPaths}>
              <span><strong>/</strong> {brandName} marketing</span>
              <span><strong>/admin</strong> platform operator</span>
              <span><strong>/business</strong> store owners</span>
              <span><strong>/store/your-slug</strong> public shop</span>
            </p>
          </div>
          <Link href="/admin/login" className={`${styles.secondaryBtn} ${styles.secondaryBtnOnPrimary}`}>
            Platform admin
          </Link>
        </div>
      </section>

      <footer className={`${styles.sectionBand} ${styles.sectionDark} ${styles.footer}`}>
        <div className={styles.sectionInner}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <strong>{brandName}</strong>
              <p>Commerce infrastructure for local and growing businesses.</p>
            </div>
            <div className={styles.footerContact}>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail size={14} />
                {CONTACT_EMAIL}
              </a>
              <a href={`tel:+91${CONTACT_PHONE}`}>
                <Phone size={14} />
                +91 {CONTACT_PHONE}
              </a>
            </div>
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
