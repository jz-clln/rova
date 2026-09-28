// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CircleCheck, Clock3, Leaf, Menu, PackageCheck, Route, ShoppingBasket, Sprout, Truck, Users } from "lucide-react";

// Verified against Supabase. A dated snapshot, never a simulated live counter.
const community = { users: 0, verifiedOn: "2026-09-26", dateLabel: "26 Sep 2026" };

const steps = [
  { icon: ShoppingBasket, title: "Start with demand", description: "A buyer sets the produce, quantity, destination, and receiving window.", detail: "A clear destination" },
  { icon: Sprout, title: "Bring supply together", description: "Farmers confirm what is ready. Compatible quantities come together into one load.", detail: "Every farm has a place" },
  { icon: Route, title: "Coordinate the journey", description: "Plan pickups around capacity, timing, and a shared route to the buyer.", detail: "One connected journey" },
  { icon: PackageCheck, title: "Close with confidence", description: "The buyer confirms what arrived, including the quantity and condition.", detail: "A clear point of receipt" },
];

const participants = [
  { icon: Sprout, name: "For farmers", photo: "growing-vegetables", alt: "Leafy vegetables growing in a greenhouse as a farmer tends the rows", title: "Your harvest. A shared way forward.", description: "Connect confirmed supply with buyer demand, with farm pickups or collection points that fit the journey.", tags: ["Confirmed quantities", "Shared loads"] },
  { icon: ShoppingBasket, name: "For buyers", photo: "fresh-produce", alt: "Fresh broccoli, cauliflower, radishes, and cucumbers arranged in produce crates", title: "Many farms. One clearer delivery.", description: "Start with what your business needs. Bring compatible farm supply together around your destination and schedule.", tags: ["Demand-led planning", "Receipt confirmation"] },
  { icon: Truck, name: "For carriers", photo: "farm-transport", alt: "A truck traveling along a rural road between cultivated fields", title: "A better picture of the road ahead.", description: "Coordinate around the load, pickup locations, vehicle capacity, and receiving window before the journey begins.", tags: ["Consolidated freight", "Planned pickups"] },
];

const navLinks = [
  { href: "#flow", label: "How it works" },
  { href: "#who-its-for", label: "Who it’s for" },
  { href: "#our-approach", label: "Our approach" },
];

export default function HomePage() {
  return (
    <main className="rova-landing" id="top">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header">
        <nav className="page-width navigation" aria-label="Main navigation">
          <Link href="/" className="brand-link" aria-label="Rova home">
            <Image src="/brand/rova-icon.png" alt="" width={46} height={46} priority />
            <Image src="/brand/rova-wordmark.png" alt="Rova" width={118} height={39} priority className="wordmark" />
          </Link>
          <div className="nav-sections">{navLinks.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}</div>
          <div className="nav-right">
            <Link href="/sign-in" className="nav-sign-in">Sign in <ArrowUpRight size={15} aria-hidden="true" /></Link>
            <Link href="/sign-up" className="nav-get-started">Get started</Link>
            <details className="mobile-nav">
              <summary aria-label="Open menu"><Menu size={20} aria-hidden="true" /></summary>
              <div className="mobile-nav-panel">
                {navLinks.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
                <Link href="/sign-in">Sign in <ArrowUpRight size={14} aria-hidden="true" /></Link>
                <Link href="/sign-up">Get started <ArrowUpRight size={14} aria-hidden="true" /></Link>
              </div>
            </details>
          </div>
        </nav>
      </header>

      <section className="hero page-width" id="main-content" aria-labelledby="hero-title">
        <div className="hero-copy enter">
          <div className="eyebrow"><span className="status-dot" /> Shared agricultural freight</div>
          <h1 id="hero-title">Good harvests.<br /><span>Better journeys.</span></h1>
          <p className="hero-description">Bring farm supply together.<br />Move forward as one.</p>
          <p className="hero-support">Rova connects buyer demand, produce from multiple farms, and shared transport into one coordinated delivery.</p>
          <div className="hero-actions"><Link href="/sign-up" className="button button-primary">Get started <ArrowUpRight size={18} aria-hidden="true" /></Link><a href="#flow" className="button button-text">See how it works <ArrowDown size={16} aria-hidden="true" /></a></div>
          <div className="hero-note"><Leaf size={16} aria-hidden="true" /><span>Rooted in agriculture. Built around people.</span></div>
        </div>

        <figure className="harvest-photo enter enter-later">
          <div className="harvest-frame"><Image src="/images/landing/shared-harvest.jpg" unoptimized alt="Farmers in blue shirts harvesting leafy vegetables, with a woman holding a freshly picked cabbage in the foreground" fill priority sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1296px) 48vw, 573px" />
          </div>
          <figcaption><span>GROWN WITH CARE. MOVED TOGETHER.</span><p>Behind every harvest,<br />there are people.</p><a href="https://www.sm-foundation.org/news/harvesting-opportunity-growing-hope/" target="_blank" rel="noreferrer">Image source: SM Foundation <ArrowUpRight size={11} aria-hidden="true" /></a></figcaption>
        </figure>
      </section>

      <section className="community-strip page-width" aria-label="Community and product focus">
        <div className="community-intro"><span className="community-icon"><Users size={22} aria-hidden="true" /></span><div><strong>A community at the beginning.</strong><p>Built for the people who grow, buy, and move our food.</p></div></div>
        <div className="community-count"><strong>{community.users}<span>registered users</span></strong><p>Verified <time dateTime={community.verifiedOn}>{community.dateLabel}</time> · Early access</p></div>
        <a href="#who-its-for" className="community-link">Find your place <ArrowRight size={17} aria-hidden="true" /></a>
      </section>

      <section className="flow-section page-width" id="flow" aria-labelledby="flow-title">
        <div className="section-heading"><div><span className="eyebrow">A shared journey, made clear</span><h2 id="flow-title">From many farms.<br /><span>To one coordinated delivery.</span></h2></div><p>One connected workflow, from the buyer’s first requirement to the final confirmation of receipt.</p></div>
        <ol className="steps-grid">{steps.map(({ icon: Icon, title, description, detail }, index) => <li className="step" key={title}><div className="step-top"><span className="step-icon"><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span><span className="step-number">0{index + 1}</span></div><h3>{title}</h3><p>{description}</p><span className="step-detail">{detail}</span></li>)}</ol>
        <div className="flow-example"><div className="example-copy"><span className="eyebrow">See the pieces come together</span><h3>Three farms.<br />One shared load.</h3><p>A simple example: three farms contribute 300, 250, and 450 kg of cabbage toward one buyer’s 1,000 kg requirement.</p><p>Separate harvests, coordinated around the same destination and receiving window.</p></div>
        <figure className="journey" aria-labelledby="journey-caption">
          <Image
            className="delivery-route-image"
            src="/images/landing/delivery-route.png"
            alt="Illustrative delivery route: Farm A contributes 300 kg, Farm B 250 kg, and Farm C 450 kg to a shared load traveling to one buyer."
            width={836}
            height={472}
            quality={100}
            priority
            sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1296px) 56vw, 50vw"
          />
          <div className="load-summary"><div className="load-icon"><PackageCheck size={22} aria-hidden="true" /></div><div className="load-text"><span>Friday’s example requirement</span><strong>1,000 kg of cabbage</strong></div><span className="load-status"><Check size={13} aria-hidden="true" /> Fully matched</span></div>
          <figcaption id="journey-caption"><span><Clock3 size={13} aria-hidden="true" /> Receiving deadline: 5:00 AM</span><span>Example, not a live delivery</span></figcaption>
        </figure>
        </div>
      </section>

      <section className="people-section" id="who-its-for" aria-labelledby="people-title"><div className="page-width">
        <div className="section-heading"><div><span className="eyebrow">Different roles. Shared progress.</span><h2 id="people-title">A place for everyone<br /><span>along the journey.</span></h2></div><p>Thoughtfully connected around a common goal: getting the right produce to the right destination.</p></div>
        <div className="people-grid">{participants.map(({ icon: Icon, name, title, description, tags, photo, alt }) => <article className="person-card" key={name}><div className="person-photo"><Image src={`/images/landing/${photo}.webp`} alt={alt} fill sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1296px) 31vw, 386px" /></div><div className="person-content"><div className="person-label"><Icon size={20} aria-hidden="true" /><span>{name}</span></div><h3>{title}</h3><p>{description}</p><div className="person-tags">{tags.map((tag) => <span key={tag}><Check size={12} aria-hidden="true" />{tag}</span>)}</div></div></article>)}</div>
      </div></section>

      <section className="approach-section page-width" id="our-approach" aria-labelledby="approach-title">
        <div className="approach-copy"><span className="eyebrow">Intentionally focused</span><h2 id="approach-title">Trust starts with<br /><span>a clearer process.</span></h2><p>Rova starts with a simple idea: make one shared delivery work well. Buyer demand comes first, confirmed supply follows, and the journey ends with the buyer’s receipt.</p><a href="#flow" className="inline-link">Follow the journey <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <div className="principles">
          <div className="principle"><span><ShoppingBasket size={20} aria-hidden="true" /></span><div><h3>Demand before dispatch</h3><p>A known buyer, a defined requirement, and a destination to plan around.</p></div><span className="principle-number">01</span></div>
          <div className="principle"><span><Route size={20} aria-hidden="true" /></span><div><h3>A route that makes sense</h3><p>Capacity, pickup readiness, and receiving windows belong in the same conversation.</p></div><span className="principle-number">02</span></div>
          <div className="principle"><span><CircleCheck size={20} aria-hidden="true" /></span><div><h3>Receipt is the finish line</h3><p>Actual quantities and condition at delivery bring the journey to a clear close.</p></div><span className="principle-number">03</span></div>
        </div>
      </section>

      <section className="closing-section page-width" aria-labelledby="closing-title">
        <div className="closing-card">
          <div className="closing-copy">
            <span className="eyebrow"><Leaf size={14} aria-hidden="true" /> Grow together. Move together.</span>
            <h2 id="closing-title">The next chapter of your<br />harvest starts with connection.</h2>
            <p>Discover a more coordinated way from farm to buyer.</p>
            <Link href="/sign-in" className="closing-secondary">Already have an account? Sign in</Link>
          </div>
          <Link href="/sign-up" className="button button-gold">Get started <ArrowUpRight size={19} aria-hidden="true" /></Link>
        </div>
      </section>

      <footer className="page-width site-footer"><div className="footer-brand"><Link href="/" className="brand-link" aria-label="Rova home"><Image src="/brand/rova-icon.png" alt="" width={34} height={34} /><Image src="/brand/rova-wordmark.png" alt="Rova" width={90} height={30} className="wordmark" /></Link><p>Shared agricultural freight.<br />Progress, together.</p></div><nav aria-label="Footer navigation"><a href="#flow">How it works</a><a href="#who-its-for">Who it’s for</a><Link href="/sign-in">Sign in <ArrowUpRight size={13} aria-hidden="true" /></Link><Link href="/sign-up">Get started <ArrowUpRight size={13} aria-hidden="true" /></Link></nav><span className="footer-note">Made for the journey ahead.</span></footer>

      <style>{`
        html:has(.rova-landing) { scroll-behavior: smooth; scroll-padding-top: 100px; }
        .rova-landing { --green: #1f5a4d; --ink: #20312c; --muted: #66766f; --line: #dce6df; background: #f6f8f4; color: var(--ink); overflow: clip; }
        .rova-landing * { box-sizing: border-box; }
        .rova-landing .page-width { width: min(1200px, calc(100% - 96px)); margin-inline: auto; }
        .rova-landing a { -webkit-tap-highlight-color: transparent; }
        .rova-landing a:focus-visible, .rova-landing summary:focus-visible { outline: 3px solid #b38431; outline-offset: 6px; border-radius: 5px; }
        .rova-landing .skip-link { position: fixed; top: 10px; left: 20px; z-index: 100; padding: 12px 20px; background: white; transform: translateY(-160%); }
        .rova-landing .skip-link:focus { transform: translateY(0); }
        .rova-landing .site-header { position: sticky; top: 0; z-index: 30; border-bottom: 1px solid #dce6df9c; background: #f6f8f4ed; backdrop-filter: blur(16px); }
        .rova-landing .navigation { min-height: 90px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .rova-landing .brand-link { display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .rova-landing .wordmark { height: auto; object-fit: contain; }
        .rova-landing .nav-sections { display: flex; align-items: center; gap: 32px; font-size: 13px; font-weight: 500; color: #52655b; }
        .rova-landing .nav-sections a, .rova-landing .site-footer nav a { display: inline-flex; align-items: center; min-height: 44px; transition: color 180ms ease; }
        .rova-landing .nav-sections a:hover, .rova-landing .site-footer nav a:hover { color: var(--green); text-decoration: underline; text-underline-offset: 6px; }
        .rova-landing .nav-right { display: flex; align-items: center; gap: 14px; }
        .rova-landing .nav-sign-in { display: inline-flex; align-items: center; gap: 20px; border: 1px solid #cad9ce; border-radius: 8px; min-height: 44px; padding: 10px 17px; font-size: 13px; font-weight: 600; color: var(--green); transition: background 180ms ease; }
        .rova-landing .nav-sign-in:hover { background: #e7eee5; }
        .rova-landing .nav-get-started { display: inline-flex; align-items: center; min-height: 44px; padding: 10px 17px; border-radius: 8px; font-size: 13px; font-weight: 600; color: white; background: var(--green); box-shadow: 0 4px 10px #1f5a4d12; transition: background 180ms ease, box-shadow 180ms ease; }
        .rova-landing .nav-get-started:hover { background: #174739; box-shadow: 0 7px 20px #1f5a4d22; }
        .rova-landing .mobile-nav { display: none; }
        .rova-landing .mobile-nav > summary { list-style: none; cursor: pointer; display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid #cad9ce; border-radius: 8px; color: var(--green); transition: background 180ms ease; }
        .rova-landing .mobile-nav > summary::-webkit-details-marker { display: none; }
        .rova-landing .mobile-nav[open] > summary { background: #e7eee5; }
        .rova-landing .mobile-nav-panel { position: absolute; top: calc(100% + 10px); right: 0; z-index: 40; display: flex; flex-direction: column; min-width: 210px; padding: 8px; background: #fff; border: 1px solid var(--line); border-radius: 11px; box-shadow: 0 18px 40px -14px #34482b30; }
        .rova-landing .mobile-nav-panel a { min-height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--ink); }
        .rova-landing .mobile-nav-panel a:hover { background: #f1f5ed; }
        .rova-landing .hero { position: relative; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 54px; padding-block: 44px 84px; }
        .rova-landing .hero::before { content: ''; position: absolute; width: 620px; height: 620px; border-radius: 50%; right: -240px; top: -100px; background: radial-gradient(circle, #e4ecd9 0%, #f6f8f400 68%); pointer-events: none; }
        .rova-landing .hero-copy, .rova-landing .journey { position: relative; }
        .rova-landing .eyebrow { display: inline-flex; align-items: center; gap: 9px; font-size: 10px; line-height: 1.5; font-weight: 700; letter-spacing: 1.9px; text-transform: uppercase; color: #496d55; }
        .rova-landing .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #659567; box-shadow: 0 0 0 4px #65956714; }
        .rova-landing h1 { font-size: clamp(50px, 5.3vw, 74px); line-height: 1.07; letter-spacing: -3.8px; font-weight: 500; margin: 26px 0 27px; }
        .rova-landing h1 span, .rova-landing .section-heading h2 span, .rova-landing .approach-copy h2 span { font-family: var(--font-raleway), Arial, sans-serif; font-weight: 400; font-style: italic; color: var(--green); letter-spacing: -2.5px; }
        .rova-landing .hero-description { font-size: 19px; line-height: 1.6; font-weight: 500; margin: 0 0 13px; letter-spacing: -.3px; }
        .rova-landing .hero-support { max-width: 395px; color: var(--muted); font-size: 14px; line-height: 1.85; margin: 0; }
        .rova-landing .hero-actions { display: flex; align-items: center; gap: 21px; flex-wrap: wrap; margin-top: 31px; }
        .rova-landing .button { min-height: 50px; display: inline-flex; justify-content: center; align-items: center; gap: 24px; border-radius: 8px; font-size: 13px; font-weight: 600; padding: 14px 21px; transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease; }
        .rova-landing .button-primary { color: white; background: var(--green); box-shadow: 0 4px 10px #1f5a4d12; }
        .rova-landing .button-primary:hover { background: #174739; box-shadow: 0 7px 20px #1f5a4d22; transform: translateY(-2px); }
        .rova-landing .button-text { padding-inline: 0; color: #385549; gap: 11px; }
        .rova-landing .button-text:hover { color: var(--green); transform: translateY(-2px); }
        .rova-landing .hero-note { display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--muted); margin-top: 31px; }
        .rova-landing .hero-note svg { color: #6d8d70; }
        .rova-landing .delivery-route-image { display: block; width: 100%; height: auto; }
        .rova-landing .journey { margin: 0; overflow: hidden; background: white; border: 1px solid #d9e3d6; border-radius: 15px; box-shadow: 0 24px 70px -25px #34482b30, 0 3px 8px #34482b04; transform: rotate(-1deg); }
        .rova-landing .route-line { animation: rova-dash 24s linear infinite; }
        .rova-landing .load-summary { display: flex; align-items: center; gap: 11px; padding: 19px 20px; }
        .rova-landing .load-icon { background: #edf3e9; color: #477452; width: 43px; height: 43px; display: grid; place-items: center; border-radius: 9px; flex-shrink: 0; }
        .rova-landing .load-text { flex: 1; }.rova-landing .load-text > span { display: block; font-size: 10px; color: #62705f; margin-bottom: 5px; }
        .rova-landing .load-text strong { display: block; font-size: 15px; font-weight: 600; letter-spacing: -.2px; }
        .rova-landing .load-status { display: inline-flex; align-items: center; gap: 4px; color: #427247; font-size: 10px; background: #eef5e8; padding: 5px 7px; border-radius: 5px; }
        .rova-landing .journey figcaption { border-top: 1px solid #edf0e9; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 7px; padding: 12px 20px; font-size: 9px; color: #617055; }
        .rova-landing .journey figcaption span { display: inline-flex; align-items: center; gap: 5px; }
        .rova-landing .community-strip { display: flex; align-items: center; gap: 32px; padding-block: 26px; border-block: 1px solid var(--line); }
        .rova-landing .community-intro { display: flex; align-items: center; gap: 16px; flex: 1; }
        .rova-landing .community-icon { width: 46px; height: 46px; border-radius: 50%; background: #e9eee3; color: #55774d; display: grid; place-items: center; flex-shrink: 0; }
        .rova-landing .community-intro strong { font-size: 13px; font-weight: 600; }.rova-landing .community-intro p { font-size: 11px; color: var(--muted); margin: 7px 0 0; line-height: 1.6; }
        .rova-landing .community-count { border-left: 1px solid var(--line); padding-left: 32px; }.rova-landing .community-count strong { display: flex; align-items: baseline; gap: 8px; font-size: 24px; font-weight: 500; color: var(--green); }
        .rova-landing .community-count strong span { font-size: 11px; font-weight: 500; color: #506752; }.rova-landing .community-count p { font-size: 10px; color: var(--muted); margin: 4px 0 0; }
        .rova-landing .community-link { display: flex; align-items: center; gap: 13px; font-size: 12px; color: var(--green); font-weight: 600; padding: 14px 0 14px 14px; }
        .rova-landing .flow-section { padding-block: 100px 96px; }
        .rova-landing .section-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 48px; margin-bottom: 42px; }
        .rova-landing .section-heading h2, .rova-landing .approach-copy h2 { font-size: clamp(32px, 3.3vw, 43px); line-height: 1.18; font-weight: 500; letter-spacing: -1.8px; margin: 18px 0 0; }
        .rova-landing .section-heading h2 span, .rova-landing .approach-copy h2 span { letter-spacing: -1.3px; }.rova-landing .section-heading > p { font-size: 13px; line-height: 1.85; max-width: 300px; margin: 0 0 4px; color: var(--muted); }
        .rova-landing .steps-grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--line); border-radius: 12px; background: #ffffff75; overflow: hidden; }
        .rova-landing .step { padding: 29px 24px; border-right: 1px solid var(--line); }.rova-landing .step:last-child { border-right: 0; }
        .rova-landing .step-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }.rova-landing .step-icon { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid #dce6d5; border-radius: 9px; background: #f1f5ed; color: #50764e; }
        .rova-landing .step-number { font-family: var(--font-raleway), Arial, sans-serif; font-size: 23px; color: #778d73; font-style: italic; }.rova-landing .step h3 { font-size: 14px; font-weight: 600; letter-spacing: -.2px; margin: 0 0 12px; }
        .rova-landing .step p { color: var(--muted); font-size: 12px; line-height: 1.85; margin: 0; min-height: 88px; }.rova-landing .step-detail { display: block; font-size: 10px; color: #5e7054; padding-top: 23px; margin-top: 17px; border-top: 1px solid #e5ebe0; }
        .rova-landing .people-section { background: #edf2e9; border-block: 1px solid #e0e8db; padding-block: 86px; }.rova-landing .people-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .rova-landing .person-card { background: #f9fbf6; border: 1px solid #dce5d6; border-radius: 11px; padding: 29px; }.rova-landing .person-label { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 600; color: #567749; }
        .rova-landing .person-card h3 { max-width: 260px; font-size: 23px; font-weight: 500; line-height: 1.3; letter-spacing: -.6px; margin: 27px 0 17px; }.rova-landing .person-card p { font-size: 12px; color: var(--muted); line-height: 1.85; margin: 0; }
        .rova-landing .person-tags { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 25px; }.rova-landing .person-tags span { display: inline-flex; align-items: center; gap: 4px; border-radius: 4px; background: #eaf0e4; color: #4c6644; padding: 5px 6px; font-size: 9px; }
        .rova-landing .approach-section { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; padding-block: 100px; }.rova-landing .approach-copy > p { font-size: 13px; color: var(--muted); line-height: 1.9; max-width: 390px; margin: 23px 0; }
        .rova-landing .inline-link { display: inline-flex; align-items: center; gap: 14px; padding-block: 10px; border-bottom: 1px solid #aac0a7; font-size: 12px; font-weight: 600; color: var(--green); }
        .rova-landing .principle { display: flex; align-items: flex-start; gap: 19px; padding: 26px 0; border-bottom: 1px solid var(--line); }.rova-landing .principle:first-child { border-top: 1px solid var(--line); }
        .rova-landing .principle > span:first-child { color: #608454; background: #eaf0e3; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 9px; flex-shrink: 0; }.rova-landing .principle h3 { font-size: 15px; font-weight: 500; margin: 2px 0 10px; }.rova-landing .principle p { font-size: 12px; line-height: 1.8; color: var(--muted); margin: 0; }.rova-landing .principle-number { font-size: 10px; color: #65765d; margin: 5px 0 0 auto; padding-left: 10px; }

        /* Closing CTA — flat single color, same border/shadow system as the rest of the page */
        .rova-landing .closing-card {
          position: relative;
          overflow: hidden;
          border-radius: 13px;
          background: var(--green);
          border: 1px solid rgba(255, 255, 255, .08);
          box-shadow: 0 24px 70px -25px #34482b45, 0 3px 8px #34482b08;
          padding: 53px 55px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        .rova-landing .closing-copy { position: relative; }
        .rova-landing .closing-card .eyebrow { color: #c6d6b4; font-size: 9px; }
        .rova-landing .closing-card h2 { font-size: clamp(27px, 3vw, 36px); font-weight: 400; letter-spacing: -1px; line-height: 1.22; color: #f7f8ee; margin: 18px 0 14px; }
        .rova-landing .closing-card p { font-size: 12px; color: #c7d7cd; line-height: 1.7; margin: 0 0 18px; }
        .rova-landing .closing-secondary { display: inline-flex; font-size: 11px; font-weight: 600; color: #d7e2c9; border-bottom: 1px solid rgba(215, 226, 201, .35); padding-bottom: 2px; }
        .rova-landing .closing-secondary:hover { color: #f2c66d; border-color: #f2c66d; }
        .rova-landing .button-gold { background: #f2c66d; color: #263e2d; flex-shrink: 0; box-shadow: 0 4px 10px #1f5a4d12; }
        .rova-landing .button-gold:hover { background: #f7d38c; box-shadow: 0 7px 20px #1f5a4d22; transform: translateY(-2px); }

        .rova-landing .site-footer { display: flex; justify-content: space-between; align-items: center; gap: 30px; padding-block: 49px; }.rova-landing .footer-brand { display: flex; align-items: center; gap: 24px; }.rova-landing .footer-brand p { border-left: 1px solid var(--line); padding-left: 24px; font-size: 10px; line-height: 1.7; color: var(--muted); margin: 0; }
        .rova-landing .site-footer nav { display: flex; gap: 22px; font-size: 10px; color: #61745e; }.rova-landing .site-footer nav a { gap: 5px; }.rova-landing .footer-note { font-size: 10px; color: #65755e; }
        .rova-landing .harvest-photo { position: relative; min-width: 0; margin: 0; overflow: hidden; border-radius: 16px 16px 48px 16px; background: #fff; box-shadow: 0 25px 65px -30px #34482b45; }
        .rova-landing .harvest-frame { position: relative; aspect-ratio: 3 / 2; }
        .rova-landing .harvest-frame > img { object-fit: cover; }
        .rova-landing .harvest-badge { position: absolute; top: 24px; left: 24px; display: flex; align-items: center; gap: 8px; background: #f6f8f4f0; color: var(--green); border-radius: 30px; padding: 10px 15px; font-size: 11px; font-weight: 600; }
        .rova-landing .harvest-photo figcaption { position: relative; padding: 25px 30px; color: var(--green); }
        .rova-landing .harvest-photo figcaption > span { color: #496d55; font-size: 9px; letter-spacing: 1.8px; font-weight: 600; }
        .rova-landing .harvest-photo figcaption p { font-family: var(--font-raleway), Arial, sans-serif; font-size: clamp(29px, 3vw, 39px); line-height: 1.15; letter-spacing: -.8px; margin: 13px 0 18px; }
        .rova-landing .harvest-photo figcaption a { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; color: #52655b; min-height: 24px; }
        .rova-landing .harvest-photo figcaption a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .rova-landing .flow-example { display: grid; grid-template-columns: .8fr 1.2fr; align-items: center; gap: 80px; margin-top: 64px; }
        .rova-landing .example-copy h3 { font-size: 36px; line-height: 1.15; letter-spacing: -1.2px; font-weight: 500; margin: 20px 0; }
        .rova-landing .example-copy p { font-size: 13px; line-height: 1.85; color: var(--muted); max-width: 330px; margin: 12px 0 0; }
        .rova-landing .flow-example .journey { transform: none; }
        .rova-landing .person-card { padding: 0; overflow: hidden; }
        .rova-landing .person-photo { position: relative; aspect-ratio: 1.55; overflow: hidden; background: #dce5d6; }
        .rova-landing .person-photo img { object-fit: cover; transition: transform 650ms cubic-bezier(.2,.7,.2,1); }
        .rova-landing .person-card:hover .person-photo img { transform: scale(1.035); }
        .rova-landing .person-content { padding: 29px; }
        @keyframes rova-enter { from { opacity: 0; translate: 0 16px; } to { opacity: 1; translate: 0 0; } }
        @keyframes rova-dash { to { stroke-dashoffset: -300; } }
        .rova-landing .enter { animation: rova-enter 700ms cubic-bezier(.2,.7,.2,1) both; }.rova-landing .enter-later { animation-delay: 110ms; }
        @media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
          @supports (animation-timeline: view()) { .rova-landing .section-heading, .rova-landing .approach-copy, .rova-landing .closing-card { animation: rova-enter linear both; animation-timeline: view(); animation-range: entry 0% entry 20%; } }
        }
        @media (max-width: 1100px) {
          .rova-landing .page-width { width: calc(100% - 64px); }.rova-landing .hero { gap: 28px; padding-block: 36px 70px; }.rova-landing h1 { font-size: 58px; letter-spacing: -3px; }
          .rova-landing .load-summary { flex-wrap: wrap; padding: 16px; }.rova-landing .load-status { margin-left: 54px; }
          .rova-landing .step { padding: 25px 18px; }.rova-landing .person-content { padding: 23px; }.rova-landing .approach-section { gap: 55px; }.rova-landing .community-link, .rova-landing .footer-note { display: none; }
        }
        @media (max-width: 800px) {
          .rova-landing .navigation { min-height: 76px; }.rova-landing .nav-sections { display: none; }.rova-landing .mobile-nav { display: block; position: relative; }
          .rova-landing .hero { grid-template-columns: 1fr; gap: 43px; padding-block: 28px 55px; }.rova-landing .hero-copy { max-width: 570px; }.rova-landing h1 { font-size: clamp(53px, 8.6vw, 70px); }.rova-landing .hero-support { max-width: 455px; }
          .rova-landing .journey { width: min(100%, 570px); justify-self: center; transform: none; }.rova-landing .load-status { margin-left: 0; }
          .rova-landing .community-strip { gap: 20px; }.rova-landing .community-count { padding-left: 20px; flex-shrink: 0; }.rova-landing .community-intro p { max-width: 240px; }
          .rova-landing .section-heading { align-items: flex-start; flex-direction: column; gap: 20px; }.rova-landing .section-heading > p { max-width: 400px; }.rova-landing .flow-section, .rova-landing .approach-section { padding-block: 70px; }
          .rova-landing .steps-grid { grid-template-columns: 1fr 1fr; }.rova-landing .step { padding: 25px; }.rova-landing .step:nth-child(2) { border-right: 0; }.rova-landing .step:nth-child(-n+2) { border-bottom: 1px solid var(--line); }.rova-landing .step p { min-height: 66px; }
          .rova-landing .people-section { padding-block: 65px; }.rova-landing .people-grid { grid-template-columns: 1fr; gap: 15px; }.rova-landing .person-content { padding: 28px; }.rova-landing .person-card h3 { max-width: none; margin-top: 20px; }.rova-landing .person-card p { max-width: 480px; }
          .rova-landing .approach-section { grid-template-columns: 1fr; gap: 35px; }.rova-landing .approach-copy > p { max-width: 440px; }.rova-landing .closing-card { align-items: flex-start; flex-direction: column; padding: 39px; gap: 25px; }.rova-landing .site-footer { align-items: flex-start; flex-wrap: wrap; padding-block: 35px; }
        }
        @media (max-width: 520px) {
          .rova-landing .page-width { width: calc(100% - 40px); }.rova-landing .navigation { gap: 12px; min-height: 72px; }.rova-landing .navigation .brand-link > img:first-child { width: 38px; height: 38px; }.rova-landing .navigation .wordmark { width: 96px; }.rova-landing .nav-sign-in { padding-inline: 13px; gap: 12px; }.rova-landing .nav-get-started { display: none; }
          .rova-landing .eyebrow { font-size: 9px; letter-spacing: 1.4px; }.rova-landing h1 { font-size: clamp(43px, 11.8vw, 61px); letter-spacing: -2.7px; margin-block: 24px; }.rova-landing h1 span { letter-spacing: -2.3px; }.rova-landing .hero-description { font-size: 17px; }.rova-landing .hero-support { font-size: 13px; }
          .rova-landing .hero-actions { gap: 17px; }.rova-landing .hero-actions .button { font-size: 12px; gap: 10px; }.rova-landing .hero-note { font-size: 10px; }
          .rova-landing .load-summary { padding: 15px 13px; gap: 8px; }.rova-landing .load-icon { width: 34px; height: 37px; }.rova-landing .load-text strong { font-size: 13px; }.rova-landing .load-status { font-size: 9px; gap: 2px; padding: 5px; }.rova-landing .journey figcaption { padding: 10px 13px; }
          .rova-landing .community-strip { flex-direction: column; align-items: flex-start; padding-block: 25px; }.rova-landing .community-count { border-left: 0; padding-left: 62px; }.rova-landing .community-count strong { font-size: 26px; }
          .rova-landing .section-heading h2, .rova-landing .approach-copy h2 { font-size: 33px; }.rova-landing .step { padding: 22px 15px; }.rova-landing .step h3 { font-size: 13px; line-height: 1.5; min-height: 39px; }.rova-landing .step p { font-size: 11px; min-height: 102px; }.rova-landing .step-detail { font-size: 9px; line-height: 1.6; }.rova-landing .step-icon { width: 38px; height: 38px; }.rova-landing .step-number { font-size: 20px; }
          .rova-landing .person-content { padding: 25px; }.rova-landing .principle { gap: 14px; }.rova-landing .principle-number { display: none; }.rova-landing .closing-card { padding: 30px 24px; }.rova-landing .closing-card h2 { font-size: 28px; }.rova-landing .closing-card h2 br { display: none; }
          .rova-landing .site-footer { gap: 22px; }.rova-landing .footer-brand { gap: 17px; }.rova-landing .footer-brand p { padding-left: 17px; }.rova-landing .site-footer nav { gap: 24px; flex-wrap: wrap; }
        }
        @media (max-width: 800px) {
          .rova-landing .harvest-photo { width: 100%; }
          .rova-landing .flow-example { grid-template-columns: 1fr; gap: 30px; margin-top: 45px; }
          .rova-landing .example-copy p { max-width: 480px; }
          .rova-landing .person-photo { aspect-ratio: 1.9; }
        }
        @media (max-width: 520px) {
          .rova-landing .harvest-photo { border-bottom-right-radius: 40px; }
          .rova-landing .harvest-badge { top: 18px; left: 18px; }
          .rova-landing .harvest-photo figcaption { padding: 23px; }
          .rova-landing .harvest-photo figcaption > span { font-size: 8px; letter-spacing: 1.3px; }
          .rova-landing .person-photo { aspect-ratio: 1.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          html:has(.rova-landing) { scroll-behavior: auto; }
          .rova-landing *, .rova-landing *::before, .rova-landing *::after { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  );
}