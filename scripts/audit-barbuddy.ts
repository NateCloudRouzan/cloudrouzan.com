/** Run: node --experimental-strip-types scripts/audit-barbuddy.ts */
import { drinks, ingredientName } from "../src/barbuddy/catalog.ts";
import { sharedBar, withSharedBar } from "../src/barbuddy/shared-bar.ts";
import { emptyProfile, inspect } from "../src/barbuddy/model.ts";
const profile = withSharedBar(emptyProfile());
const rows = drinks.map(drink => ({ drink, ...inspect(drink, profile) }));
const eligible = rows.filter(r => !r.drink.needsReview);
const ready = eligible.filter(r => !r.missing.length && !r.tools.length);
const missingCounts = new Map<string, number>();
for (const row of eligible) for (const need of row.missing) missingCounts.set(need.id, (missingCounts.get(need.id) ?? 0) + 1);
console.log(JSON.stringify({
  inventoryEntries: sharedBar.items.length,
  total: rows.length,
  needsVerification: rows.length - eligible.length,
  ready: ready.length,
  readyWithSubstitutions: ready.filter(r => r.substitutions.length).length,
  missingIngredientHistogram: Object.fromEntries([...new Set(eligible.map(r=>r.missing.length))].sort((a,b)=>a-b).map(count=>[count,eligible.filter(r=>r.missing.length===count).length])),
  missingEquipment: [...new Set(eligible.flatMap(r=>r.tools))].map(id=>({id,recipes:eligible.filter(r=>r.tools.includes(id)).length})),
  recipesMissingEquipment: eligible.filter(r=>r.tools.length).length,
  byBase: [...new Set(eligible.map(r=>r.drink.spirit))].map(base=>({base,total:eligible.filter(r=>r.drink.spirit===base).length,ready:ready.filter(r=>r.drink.spirit===base).length})),
  singleIngredientUnlocks: [...new Set(eligible.flatMap(r=>r.missing.map(n=>n.id)))].map(id=>{
    const scenario={...profile,items:[...profile.items,{id:"audit-"+id,ingredient:id,name:ingredientName(id),quantity:1,stock:"have" as const}]};
    const newly=eligible.filter(r=>(r.missing.length||r.tools.length)&&!inspect(r.drink,scenario).missing.length&&!inspect(r.drink,scenario).tools.length);
    return {id,name:ingredientName(id),recipes:newly.length,examples:newly.slice(0,5).map(r=>r.drink.name)};
  }).filter(r=>r.recipes).sort((a,b)=>b.recipes-a.recipes),
  ingredientsReadyButEquipmentMissing: eligible.filter(r => !r.missing.length && r.tools.length).length,
  oneIngredientAwayWithEquipment: eligible.filter(r => r.missing.length === 1 && !r.tools.length).length,
  blocked: eligible.length - ready.length,
  topMissing: [...missingCounts].sort((a,b) => b[1]-a[1]).slice(0,15).map(([id, count]) => ({id, name: ingredientName(id), recipes: count})),
  readyRecipes: ready.map(r => ({ id: r.drink.id, name: r.drink.name, substitutions: r.substitutions })),
  recipeAudit: rows.map(r => ({ id:r.drink.id, name:r.drink.name, needsVerification:!!r.drink.needsReview, missing:r.missing.map(n => ingredientName(n.id)), missingTools:r.tools, substitutions:r.substitutions })),
}, null, 2));
