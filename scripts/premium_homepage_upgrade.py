from pathlib import Path
import re

path = Path('index.html')
html = path.read_text(encoding='utf-8')
original = html

critical_patterns = {
    'title': r'<title>.*?</title>',
    'canonical': r'<link rel="canonical"[^>]*>',
    'description': r'<meta name="description"[^>]*>',
    'seo_script': r'<script src="/seo\.js" defer></script>',
    'quote_script': r'<script src="/quote\.js"></script>',
    'site_script': r'<script src="/script\.js"></script>',
}
critical_before = {}
for name, pattern in critical_patterns.items():
    m = re.search(pattern, html, re.S)
    if not m:
        raise SystemExit(f'Missing critical element before change: {name}')
    critical_before[name] = m.group(0)

required_links = ['/sweeping.html', '/grounds.html', '/lawn-garden.html', '/areas.html', '/contact.html']
for href in required_links:
    if f'href="{href}"' not in html:
        raise SystemExit(f'Missing required internal link before change: {href}')
if 'id="quoteModal"' not in html or 'data-quote-form' not in html:
    raise SystemExit('Quote modal/form foundation missing before change')

needle = '  <link rel="stylesheet" href="/flyer-home.css" />\n'
if '/premium-home.css' not in html:
    if needle not in html:
        raise SystemExit('Could not find flyer-home.css insertion point')
    html = html.replace(needle, needle + '  <link rel="stylesheet" href="/premium-home.css" />\n', 1)

old_hero = '''        <h2>One team. Smarter site maintenance.</h2>
        <p>Commercial sweeping, grounds maintenance and lawn & garden care for well-maintained sites across South East Queensland.</p>
        <div class="hero-actions"><button class="button button-yellow quote-trigger" type="button">GET YOUR FREE QUOTE <span>→</span></button><a class="button button-white" href="#services">OUR SERVICES</a></div>'''
new_hero = '''        <h2>One team. Every exterior.</h2>
        <p>STOREMAN maintains the entire exterior of commercial properties in one coordinated visit — from lawns and landscaped areas to paths, kerbs and car parks.</p>
        <div class="hero-actions"><button class="button button-yellow quote-trigger" type="button">GET A FREE SITE QUOTE <span>→</span></button><a class="button button-white" href="#complete-service">VIEW OUR SERVICE</a></div>'''
if old_hero not in html:
    raise SystemExit('Expected hero copy block not found')
html = html.replace(old_hero, new_hero, 1)

service_anchor = '  <section class="services" id="services">'
complete_visit = '''  <section class="complete-visit" id="complete-service" aria-labelledby="complete-service-title">
    <div class="container">
      <div class="complete-visit-head">
        <div><p class="label">ONE COMPLETE RECURRING SERVICE</p><h2 id="complete-service-title">FROM THE GRASS<br><span>TO THE CAR PARK.</span></h2></div>
        <p class="complete-visit-intro">One STOREMAN team works through the entire commercial exterior in a deliberate sequence, finishing by collecting the debris rather than simply moving it around the property.</p>
      </div>
      <div class="visit-sequence" aria-label="STOREMAN complete commercial exterior service sequence">
        <article class="visit-step"><div class="visit-step-media"><img src="/assets/mowing.jpg" alt="Commercial lawn mowing by Storeman" loading="lazy" decoding="async"></div><div class="visit-step-body"><span class="visit-step-no">01</span><h3>MOW</h3><p>Commercial lawns kept sharp and consistent.</p></div></article>
        <article class="visit-step"><div class="visit-step-media"><img src="/assets/grounds.jpg" alt="Commercial trimming and snipping by Storeman" loading="lazy" decoding="async"></div><div class="visit-step-body"><span class="visit-step-no">02</span><h3>SNIP</h3><p>Detailed trimming around structures, gardens and hard-to-reach areas.</p></div></article>
        <article class="visit-step"><div class="visit-step-media"><img src="/assets/grounds.jpg" alt="Commercial edging by Storeman" loading="lazy" decoding="async"></div><div class="visit-step-body"><span class="visit-step-no">03</span><h3>EDGE</h3><p>Defined edges along paths, kerbs and landscaped areas.</p></div></article>
        <article class="visit-step"><div class="visit-step-media"><img src="/assets/grounds.jpg" alt="Commercial grounds and weed treatment by Storeman" loading="lazy" decoding="async"></div><div class="visit-step-body"><span class="visit-step-no">04</span><h3>WEED TREATMENT</h3><p>Targeted treatment to maintain a clean commercial presentation.</p></div></article>
        <article class="visit-step"><div class="visit-step-media"><img src="/assets/vac.jpg" alt="Leaves and litter collection by Storeman" loading="lazy" decoding="async"></div><div class="visit-step-body"><span class="visit-step-no">05</span><h3>VACUUM LEAVES &amp; LITTER</h3><p>Sweeper vacuum-hose collection from garden beds, corners and difficult areas.</p></div></article>
        <article class="visit-step"><div class="visit-step-media"><img src="/assets/sweeping.jpg" alt="Storeman mechanical sweeping a commercial site" loading="lazy" decoding="async"></div><div class="visit-step-body"><span class="visit-step-no">06</span><h3>MECHANICAL SWEEP</h3><p>Mechanically sweep car parks, paths, kerbs and hardstand areas before leaving.</p></div></article>
      </div>
      <div class="complete-visit-note"><strong>MOW → SNIP → EDGE → WEED TREATMENT → VACUUM → SWEEP</strong><span>ONE TEAM. ONE VISIT. THE ENTIRE EXTERIOR.</span></div>
    </div>
  </section>

'''
if 'id="complete-service"' not in html:
    if service_anchor not in html:
        raise SystemExit('Existing services section not found')
    html = html.replace(service_anchor, complete_visit + service_anchor, 1)

who_pattern = re.compile(r'  <section class="who-we-serve" id="who">.*?</section>\n\n  <section class="about-storeman"', re.S)
who_replacement = '''  <section class="who-we-serve" id="who">
    <div class="container">
      <div class="who-heading"><div><p class="label">WHO WE SERVICE</p><h2>BUILT FOR COMMERCIAL<br><span>PROPERTIES.</span></h2></div><p>STOREMAN is structured for recurring commercial exterior maintenance — one service team, one schedule and one standard across lawns, landscaped areas, paths, kerbs and car parks.</p></div>
      <div class="who-grid">
        <article class="who-card"><b>01</b><h3>COMMERCIAL<br>PROPERTIES</h3><p>Complete exterior presentation for managed commercial sites.</p></article>
        <article class="who-card"><b>02</b><h3>INDUSTRIAL<br>SITES</h3><p>Recurring grounds care and sweeping for yards, hardstands and industrial estates.</p></article>
        <article class="who-card"><b>03</b><h3>MEDICAL<br>CENTRES</h3><p>Consistent exterior maintenance around patient and staff access areas.</p></article>
        <article class="who-card"><b>04</b><h3>CHILDCARE<br>CENTRES</h3><p>Scheduled exterior upkeep around busy facilities and landscaped areas.</p></article>
        <article class="who-card"><b>05</b><h3>RETAIL<br>PROPERTIES</h3><p>Car parks, paths and grounds maintained for a stronger first impression.</p></article>
        <article class="who-card"><b>06</b><h3>OFFICES</h3><p>Reliable recurring exterior presentation around business premises.</p></article>
        <article class="who-card"><b>07</b><h3>CLUBS &amp;<br>HOSPITALITY</h3><p>Grounds, entries and parking areas maintained around operating schedules.</p></article>
        <article class="who-card"><b>08</b><h3>EDUCATION</h3><p>Commercial exterior care planned around access and facility requirements.</p></article>
        <article class="who-card"><b>09</b><h3>STRATA &amp;<br>BODY CORPORATE</h3><p>One recurring service for shared outdoor areas and common property.</p></article>
      </div>
    </div>
  </section>

  <section class="about-storeman"'''
html, count = who_pattern.subn(who_replacement, html, count=1)
if count != 1:
    raise SystemExit(f'Who-we-service section replacement count was {count}')

why_pattern = re.compile(r'  <section class="why" id="why">.*?</section>\n\n  <section class="industries"', re.S)
why_replacement = '''  <section class="why" id="why"><div class="why-left"><p class="label light">THE STOREMAN DIFFERENCE</p><h2>WE DON’T JUST<br><span>BLOW IT.</span><br>WE SWEEP IT.</h2><p class="sweeper-difference-copy">Most grounds contractors finish by blowing debris across the property. STOREMAN finishes the job by mechanically collecting it — leaving car parks, paths, kerbs and hardstand areas properly presented.</p><div class="benefits"><div><b class="benefit-icon">01</b><strong>ONE<br>CONTRACTOR</strong><p>Core outdoor maintenance, one trusted partner.</p></div><div><b class="benefit-icon">02</b><strong>COMMERCIAL<br>EQUIPMENT</strong><p>Mechanical collection, not just moving debris.</p></div><div><b class="benefit-icon">03</b><strong>SAFER SITES</strong><p>Cleaner environments and better presentation.</p></div><div><b class="benefit-icon">04</b><strong>RECURRING<br>SERVICE</strong><p>Consistent results on a planned schedule.</p></div></div></div><div class="why-image"><div class="why-overlay-text">THE JOB ISN’T FINISHED<br>UNTIL THE DEBRIS<br>IS COLLECTED.<span></span></div></div></section>

  <section class="industries"'''
html, count = why_pattern.subn(why_replacement, html, count=1)
if count != 1:
    raise SystemExit(f'Differentiator section replacement count was {count}')

faq_anchor = '  <section class="faq" id="faq">'
trust = '''  <section class="storeman-trust" aria-label="Why commercial property managers choose Storeman">
    <div class="container"><div class="storeman-trust-grid">
      <div class="storeman-trust-item"><b>01</b><strong>$20M PUBLIC LIABILITY</strong></div>
      <div class="storeman-trust-item"><b>02</b><strong>COMMERCIAL-ONLY FOCUS</strong></div>
      <div class="storeman-trust-item"><b>03</b><strong>UNIFORMED SERVICE TEAM</strong></div>
      <div class="storeman-trust-item"><b>04</b><strong>SCHEDULED RECURRING MAINTENANCE</strong></div>
      <div class="storeman-trust-item"><b>05</b><strong>FREE SITE ASSESSMENT</strong></div>
      <div class="storeman-trust-item"><b>06</b><strong>SOUTH EAST QUEENSLAND</strong></div>
    </div></div>
  </section>

'''
if 'class="storeman-trust"' not in html:
    if faq_anchor not in html:
        raise SystemExit('FAQ insertion point not found')
    html = html.replace(faq_anchor, trust + faq_anchor, 1)

old_cta = '''<p class="label">CLEANER SITES. BRIGHTER BUSINESSES.</p><h2>LET'S KEEP YOUR<br>SITE AT ITS BEST.</h2></div><button class="button button-black quote-trigger" type="button">GET YOUR FREE QUOTE <span>→</span></button>'''
new_cta = '''<p class="label">ONE TEAM. EVERY EXTERIOR.</p><h2>LET’S LOOK AFTER YOUR<br>ENTIRE EXTERIOR.</h2></div><button class="button button-black quote-trigger" type="button">GET YOUR FREE SITE QUOTE <span>→</span></button>'''
if old_cta not in html:
    raise SystemExit('Expected final CTA copy not found')
html = html.replace(old_cta, new_cta, 1)

for name, pattern in critical_patterns.items():
    m = re.search(pattern, html, re.S)
    if not m or m.group(0) != critical_before[name]:
        raise SystemExit(f'Critical element changed unexpectedly: {name}')
for href in required_links:
    if f'href="{href}"' not in html:
        raise SystemExit(f'Required internal link lost after change: {href}')
for required in ['id="quoteModal"', 'data-quote-form', 'id="services"', 'id="about"', 'id="areas"', 'id="faq"', 'id="complete-service"']:
    if required not in html:
        raise SystemExit(f'Required functionality/section lost: {required}')
if html.count('<h1') != original.count('<h1'):
    raise SystemExit('H1 count changed unexpectedly')

path.write_text(html, encoding='utf-8')
print('Homepage audit passed and premium UX upgrade applied safely.')
