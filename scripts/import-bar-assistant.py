#!/usr/bin/env python3
"""Fetch pinned MIT recipe JSON only. Never download upstream photos or run its code."""
import argparse
import concurrent.futures
import hashlib
import json
import time
import urllib.request
from pathlib import Path

COMMIT = '5a504d474614494119882eb91a8ffdc5491a483f'
BASE = f'https://raw.githubusercontent.com/bar-assistant/data/{COMMIT}/'
CACHE = Path('/tmp/barbuddy-bar-assistant') / COMMIT
ROOT = Path(__file__).resolve().parents[1]

def request(url):
    req = urllib.request.Request(url, headers={'User-Agent':'BarBuddy catalog importer'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read()
        except Exception:
            if attempt == 3: raise
            time.sleep(2 ** attempt)

def fetch():
    CACHE.mkdir(parents=True, exist_ok=True)
    tree = json.loads(request(f'https://api.github.com/repos/bar-assistant/data/git/trees/{COMMIT}?recursive=1'))
    if tree.get('truncated'): raise ValueError('Incomplete upstream tree')
    selected = [x for x in tree['tree'] if x['path'].startswith('data/cocktails/') and x['path'].endswith('/data.json')]
    def one(entry):
        target = CACHE / entry['path']
        body = target.read_bytes() if target.exists() else request(BASE + entry['path'])
        blob = b'blob ' + str(len(body)).encode() + b'\0' + body
        if hashlib.sha1(blob).hexdigest() != entry['sha']: raise ValueError('Source integrity mismatch: '+entry['path'])
        value = json.loads(body)
        if not isinstance(value,dict): raise ValueError('Invalid recipe JSON')
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(body)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(one,selected))
    (CACHE/'LICENSE').write_bytes(request(BASE+'LICENSE'))
    (CACHE/'manifest.json').write_text(json.dumps({'commit':COMMIT,'paths':[x['path'] for x in selected]},indent=2)+'\n')
    print(f'Fetched and verified {len(selected)} recipe records at {COMMIT}; no photos downloaded.',flush=True)

# Only equivalences reviewed for BarBuddy; no automatic substitution by fuzzy name.
MAPPINGS = {
    'gin':'gin','vodka':'vodka','bourbon-whiskey':'bourbon','rye-whiskey':'rye',
    'cognac':'cognac','light-rum':'rum','triple-sec':'triple-sec','campari':'campari',
    'sweet-vermouth':'sweet-vermouth','dry-vermouth':'dry-vermouth','aperol':'aperol',
    'coffee-liqueur':'coffee','lime-juice':'lime','lemon-juice':'lemon',
    'orange-juice':'orange','pineapple-juice':'pineapple','club-soda':'soda',
    'ginger-beer':'ginger-beer','tonic':'tonic','prosecco':'prosecco',
    'simple-syrup':'syrup','grenadine-syrup':'grenadine','sugar':'sugar',
    'angostura-aromatic-bitters':'angostura',
}
# The existing recipes and IDs remain unchanged so saved reviews stay attached.
EXISTING_NAMES = {'Margarita','Daiquiri','Negroni','Americano','Aperol Spritz','Spritz',
 'French Martini','Tequila Sunrise','Gin Fizz','White Lady','Dry Martini','Black Russian',
 'Moscow Mule','Cuba Libre','Old Fashioned','Whiskey Sour','Sidecar','Gin & Tonic',
 'Gin and Tonic','Gin Tonic','Vodka Soda','Japanese Whisky Highball','Gin Soda'}
def comparison_name(value):
    import re
    return re.sub(r'[^a-z0-9]','',value.lower().replace('&','and'))

def normalize():
    import math
    import re
    manifest=json.loads((CACHE/'manifest.json').read_text())
    if manifest['commit']!=COMMIT: raise ValueError('Wrong cached source revision')
    records=[json.loads((CACHE/path).read_text()) for path in sorted(manifest['paths'])]
    known={comparison_name(n) for n in EXISTING_NAMES}
    imported=[]; ingredient_names={}; skipped=[]; review=[]
    method_tools={'Shake':['shaker'],'Stir':['mixing'],'Build':['spoon'],'Blend':['blender'],'Muddle':['muddler'],'Layer':['spoon']}
    for r in records:
        if not r.get('_id') or not r.get('name') or not isinstance(r.get('instructions'),str) or not r['instructions'].strip() or not r.get('ingredients'):
            raise ValueError('Incomplete recipe: '+str(r.get('_id')))
        if comparison_name(r['name']) in known:
            skipped.append({'id':r['_id'],'name':r['name'],'reason':'Existing BarBuddy recipe retained'})
            continue
        required={}; optional={}; issues=[]
        for i in sorted(r['ingredients'],key=lambda i:i.get('sort',0)):
            if not i.get('_id') or not i.get('name') or not isinstance(i.get('amount'),(int,float)) or not math.isfinite(i['amount']) or i['amount']<0 or not isinstance(i.get('units'),str) or not i['units'].strip():
                raise ValueError('Invalid ingredient: '+r['_id'])
            ingredient=MAPPINGS.get(i['_id'],'ba-'+i['_id'])
            if ingredient.startswith('ba-'): ingredient_names[ingredient]=i['name']
            amount=str(i['amount']).removesuffix('.0')
            maximum=i.get('amount_max')
            if maximum == 0 and i['amount'] > 0:
                issues.append('Upstream zero upper-bound for '+i['name'])
                maximum=None
            if maximum is not None:
                if not isinstance(maximum,(int,float)) or not math.isfinite(maximum) or maximum<i['amount']: raise ValueError('Invalid amount range')
                amount+='–'+str(maximum).removesuffix('.0')
            amount+=' '+i['units']
            if i.get('note'): amount+=' ('+str(i['note'])+')'
            target=optional if i.get('optional') else required
            target.setdefault(ingredient,[]).append(amount)
        method=r.get('method')
        needs_review=method not in method_tools or bool(issues)
        if needs_review: review.append({'id':r['_id'],'reason':'; '.join(issues) if issues else 'Preparation method needs verification'})
        if re.search(r'\bice\b',r['instructions'],re.I) or method in ['Shake','Stir']:
            required.setdefault('ice',['As needed'])
        ids=[i['_id'] for i in r['ingredients']]
        spirit='other'
        for iid in ids:
            if iid in ['gin','vodka','cognac','aperol','campari'] or iid.endswith('-gin') or iid.endswith('-vodka'):
                spirit='gin' if 'gin' in iid else 'vodka' if 'vodka' in iid else 'aperol-family' if iid in ['aperol','campari'] else 'cognac';break
            for prefix,result in [('tequila','tequila'),('bourbon','bourbon'),('rye','rye'),('mezcal','mezcal'),('scotch','scotch')]:
                if iid.startswith(prefix): spirit=result; break
            if spirit!='other':break
            if iid=='rum' or iid.endswith('-rum') or iid.startswith('rhum-'):spirit='rum';break
        tags=r.get('tags') or []
        tastes=[]
        for tag in tags:
            mapped={'citrusy':'Citrusy','citrus':'Citrusy','sour':'Citrusy','bitter':'Bitter','fruity':'Fruity','refreshing':'Refreshing','spirit-forward':'Spirit-forward'}.get(tag.lower())
            if mapped and mapped not in tastes:tastes.append(mapped)
        sparkling=any(i in ids for i in ['club-soda','ginger-beer','tonic','prosecco','champagne','cola'])
        style='Frozen' if method=='Blend' or 'frozen' in r['name'].lower() else 'Sparkling' if sparkling else 'Classic'
        uri=f'https://github.com/bar-assistant/data/blob/{COMMIT}/data/cocktails/{r["_id"]}/data.json'
        imported.append({'id':'ba-'+r['_id'],'name':r['name'],'description':f'{method or "Method unverified"} preparation'+(f' · {r["glass"]} glass' if r.get('glass') else ''),
            'spirit':spirit,'taste':tastes,'style':style,'effort':'Quick' if method in ['Build','Layer'] else 'Shake or stir',
            'needs':[{'id':k,'amount':' + '.join(v)} for k,v in required.items()],
            'optionalNeeds':[{'id':k,'amount':' + '.join(v)} for k,v in optional.items()],
            'tools':method_tools.get(method,[]),'method':r['instructions'].strip(),'source':uri,
            'sourceLabel':'Bar Assistant · MIT licensed data','originalSource':r.get('source') or '',
            'garnish':r.get('garnish') or '', 'needsReview':needs_review})
    if len({d['id'] for d in imported})!=len(imported):raise ValueError('Duplicate imported IDs')
    output={'ingredients':[{'id':k,'name':v,'category':'Additional ingredients'} for k,v in sorted(ingredient_names.items())],'drinks':imported}
    folder=ROOT/'src/barbuddy/data';folder.mkdir(exist_ok=True)
    (folder/'ingredients.json').write_text(json.dumps(output['ingredients'],ensure_ascii=False,separators=(',',':'))+'\n')
    midpoint=(len(imported)+1)//2
    for label,part in [('a',imported[:midpoint]),('b',imported[midpoint:])]:
        (folder/f'recipes-{label}.json').write_text(json.dumps(part,ensure_ascii=False,separators=(',',':'))+'\n')
    report={'source':'https://github.com/bar-assistant/data','commit':COMMIT,'license':'MIT','sourceRecipes':len(records),'importedRecipes':len(imported),'preservedExistingRecipes':20,'skippedDuplicates':skipped,'preparationReview':review,'newIngredients':len(ingredient_names),'imagesImported':0,'policy':'No upstream photos or narrative descriptions imported. Unsupported methods are browse-only pending verification.'}
    (folder/'import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    credits=ROOT/'public/barbuddy';credits.mkdir(parents=True,exist_ok=True)
    (credits/'BAR-ASSISTANT-LICENSE.txt').write_bytes((CACHE/'LICENSE').read_bytes())
    print(f'Imported {len(imported)} recipes; retained 20 existing recipes; skipped {len(skipped)} overlaps; {len(review)} recipes need preparation review; {len(ingredient_names)} new ingredient IDs.',flush=True)

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fetch',action='store_true',help='Download pinned source JSON to temporary cache before normalizing')
    args=parser.parse_args()
    if args.fetch: fetch()
    normalize()
