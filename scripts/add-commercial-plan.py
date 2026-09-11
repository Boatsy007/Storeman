from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

critical = [
    '<link rel="canonical" href="https://storeman.com.au/">',
    '<script src="/seo.js" defer></script>',
    '<script src="/quote.js"></script>',
    '<script src="/script.js"></script>',
    'id="quoteModal"',
    'data-quote-form',
]
for token in critical:
    if token not in html:
        raise SystemExit(f'Missing critical foundation before change: {token}')

css_anchor = '  <link rel="stylesheet" href="/mobile-home.css" />\n'
if '/home-sales.css' not in html:
    if css_anchor not in html:
        raise SystemExit('mobile-home.css link not found')
    html = html.replace(css_anchor, css_anchor + '  <link rel="stylesheet" href="/home-sales.css" />\n', 1)

hero_actions = '        <div class="hero-actions"><button class="button button-yellow quote-trigger" type="button">GET A FREE SITE QUOTE <span>→</span></button><a class="button button-white" href="#complete-service">VIEW OUR SERVICE</a></div>'
if 'class="hero-quote-expectation"' not in html:
    if hero_actions not in html:
        raise SystemExit('Hero action block not found')
    hero_note = '\n        <div class="hero-quote-expectation" aria-label="Quote expectations"><span>Free site assessment</span><span>No obligation</span><span>Commercial quotes</span></div>'
    html = html.replace(hero_actions, hero_actions + hero_note, 1)

services_anchor = '  <section class="services" id="services">'
section = '''  <section class="commercial-plan" id="service-plan" aria-labelledby="service-plan-title">
    <div class="container">
      <div class="commercial-plan-head">
        <div><p class="label">WHAT HAPPENS EVERY VISIT</p><h2 id="service-plan-title">ONE SITE. ONE SCHEDULE.<br><span>ONE CONTACT.</span></h2></div>
        <p class="commercial-plan-intro">STOREMAN takes responsibility for the exterior as one coordinated commercial service. We arrive with a clear scope, work through the property, collect the debris, inspect the finish and leave the site ready for business.</p>
      </div>
      <div class="visit-flow" aria-label="STOREMAN recurring visit process">
        <div class="visit-flow-step"><b>01</b><strong>ARRIVE</strong><span>Attend on the agreed service schedule and scope.</span></div>
        <div class="visit-flow-step"><b>02</b><strong>MAINTAIN</strong><span>Mow, snip, edge and treat the exterior areas.</span></div>
        <div class="visit-flow-step"><b>03</b><strong>COLLECT</strong><span>Vacuum leaves and litter, then mechanically sweep.</span></div>
        <div class="visit-flow-step"><b>04</b><strong>INSPECT</strong><span>Check lawns, edges, landscaped areas, paths and car parks.</span></div>
        <div class="visit-flow-step"><b>05</b><strong>LEAVE</strong><span>One finished exterior, ready for staff, customers and visitors.</span></div>
      </div>
      <div class="commercial-plan-grid">
        <div class="one-contact-panel"><h3>LESS CONTRACTOR JUGGLING.</h3><p>Instead of coordinating separate contractors for lawns, grounds, litter and sweeping, your property has one STOREMAN service team, one maintenance schedule and one point of contact for the exterior.</p></div>
        <div class="recurring-panel"><h3>BUILT FOR RECURRING MAINTENANCE.</h3><p>We can structure ongoing commercial servicing around the needs of the property, with the frequency confirmed during the free site assessment.</p><div class="recurring-options" aria-label="Recurring service frequency options"><span>WEEKLY</span><span>FORTNIGHTLY</span><span>MONTHLY</span></div><div class="quote-expectation"><span>Free site assessment</span><span>No obligation</span><span>Commercial quotes</span></div></div>
      </div>
    </div>
  </section>

'''
if 'id="service-plan"' not in html:
    if services_anchor not in html:
        raise SystemExit('Services section anchor not found')
    html = html.replace(services_anchor, section + services_anchor, 1)

cta_button = '<button class="button button-black quote-trigger" type="button">GET YOUR FREE SITE QUOTE <span>→</span></button>'
if 'class="cta-quote-expectation"' not in html:
    if cta_button not in html:
        raise SystemExit('Bottom CTA button not found')
    note = '<div class="cta-quote-expectation"><span>Free site assessment</span><span>No obligation</span><span>Commercial quotes</span></div>'
    html = html.replace(cta_button, cta_button + note, 1)

for token in critical:
    if token not in html:
        raise SystemExit(f'Critical foundation lost after change: {token}')
for href in ['/sweeping.html', '/grounds.html', '/lawn-garden.html', '/areas.html', '/contact.html']:
    if f'href="{href}"' not in html:
        raise SystemExit(f'Internal link lost: {href}')

path.write_text(html, encoding='utf-8')
