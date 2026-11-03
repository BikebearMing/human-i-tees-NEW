"""Build the copy of this theme that goes to the real store (aa3fab-4, humanitees.com).

The repo is set up for bikebeardemo. The real store needs a few settings that
must NOT go to bikebeardemo, so they're applied to a build copy instead:

  - Klaviyo + Essential Preorder app embeds (copied from their old live theme;
    those apps are only installed on the real store)
  - Google Tag Manager container ID (blank on bikebeardemo so demo visits stay
    out of their analytics)
  - Our Tees product picks -> the real store's product handles

Usage:
  python tools/build_realstore.py <output-folder>
  npx shopify theme push --store aa3fab-4.myshopify.com --theme <preview theme id> --path <output-folder>

Only push the whole build to the unpublished preview theme. Later single-file
fixes can go straight from the repo with --only, but NOT config/settings_data.json
or templates/index.json: those would wipe the overrides above.
"""
import json
import os
import re
import shutil
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEME_DIRS = ('assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates')

GTM_ID = 'GTM-N7C289PK'

APP_EMBEDS = {
    '15393088698543645836': {
        'type': 'shopify://apps/essential-preorder/blocks/app-embed/bb7e7a06-2a82-4e7d-8984-c3918deb1c2a',
        'disabled': False,
        'settings': {},
    },
    '855628211100114053': {
        'type': 'shopify://apps/klaviyo-email-marketing-sms/blocks/klaviyo-onsite-embed/2632fe16-c075-4321-a88b-50b567f42507',
        'disabled': False,
        'settings': {},
    },
}

# bikebeardemo handle -> real store handle
PRODUCT_HANDLES = {
    'nature-can-t-be-restock': 'nature-can-t-be-restocked',
    'bear-us-in-mind': 'bear-us-in-mind-2374349',
}


def load(path):
    text = open(path, encoding='utf-8').read()
    return json.loads(re.sub(r'^\s*/\*.*?\*/', '', text, flags=re.S))


def save(path, data):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False) + '\n')


def main(out):
    if os.path.exists(out):
        shutil.rmtree(out)
    for d in THEME_DIRS:
        if os.path.isdir(os.path.join(REPO, d)):
            shutil.copytree(os.path.join(REPO, d), os.path.join(out, d))

    settings_path = os.path.join(out, 'config', 'settings_data.json')
    settings = load(settings_path)
    current = settings['current'] if isinstance(settings['current'], dict) else settings['presets'][settings['current']]
    current.setdefault('blocks', {}).update(APP_EMBEDS)
    current['gtm_id'] = GTM_ID
    save(settings_path, settings)
    print('app embeds:', ', '.join(b['type'].split('/')[3] for b in APP_EMBEDS.values()))
    print('gtm_id:', GTM_ID)

    for template in ('index.json',):
        path = os.path.join(out, 'templates', template)
        data = load(path)
        for section in data['sections'].values():
            for block in (section.get('blocks') or {}).values():
                handle = (block.get('settings') or {}).get('product')
                if handle in PRODUCT_HANDLES:
                    block['settings']['product'] = PRODUCT_HANDLES[handle]
                    print(f'{template}: {handle} -> {PRODUCT_HANDLES[handle]}')
        save(path, data)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
