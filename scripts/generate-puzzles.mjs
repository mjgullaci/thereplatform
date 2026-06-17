import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const words = require('an-array-of-english-words');
const wordSet = new Set(words);

// Each input: { id, theme, letters (6 unique uppercase), bonus, required }
// The script fills in `extras` from the english-words dictionary.
const inputs = [
  { id: 'p001', theme: 'Garden Path', letters: ['P','L','A','N','T','S'], bonus: 'PLANTS',
    required: ['NAP','PAN','TAP','ANT','PAL','PLAN','SLAP','SNAP','PLANT','PLANTS'] },
  { id: 'p002', theme: 'Morning Tide', letters: ['O','C','E','A','N','S'], bonus: 'OCEANS',
    required: ['CAN','CONE','NOSE','ONCE','SCAN','CANE','OCEAN','CANES','SCONE','OCEANS'] },
  { id: 'p003', theme: 'Going Places', letters: ['T','R','A','V','E','L'], bonus: 'TRAVEL',
    required: ['ATE','EAR','EAT','TEA','LATE','RATE','TALE','ALERT','ALTER','TRAVEL'] },
  { id: 'p004', theme: 'Daydream', letters: ['D','R','E','A','M','S'], bonus: 'DREAMS',
    required: ['READ','DEAR','DARE','MARE','MADE','DREAM','ARMED','SMEAR','READS','DREAMS'] },
  { id: 'p005', theme: 'Hearth & Home', letters: ['C','A','N','D','L','E'], bonus: 'CANDLE',
    required: ['AND','CAN','CANE','DEAL','LACE','LEAN','CLEAN','DANCE','LANCE','CANDLE'] },
  { id: 'p006', theme: 'Coastal Light', letters: ['M','A','R','I','N','E'], bonus: 'MARINE',
    required: ['AIM','ARM','MAN','RAIN','MAIN','NAME','NEAR','MINER','MARINE','REMAIN'] },
  { id: 'p007', theme: 'Old Friends', letters: ['F','R','I','E','N','D'], bonus: 'FRIEND',
    required: ['DEN','FED','FIN','FIR','DINE','FIRE','FIND','FIEND','FINER','FRIEND'] },
  { id: 'p008', theme: 'Cottage Garden', letters: ['G','A','R','D','E','N'], bonus: 'GARDEN',
    required: ['AGE','AND','EAR','RAG','RAN','GEAR','DEAR','NEAR','READ','GARDEN'] },
  { id: 'p009', theme: 'Afternoon Tea', letters: ['S','A','U','C','E','R'], bonus: 'SAUCER',
    required: ['ACE','ARC','ARE','CAR','EAR','CARE','RACE','CURE','CURES','SAUCER'] },
  { id: 'p010', theme: 'On the Shelf', letters: ['N','O','V','E','L','S'], bonus: 'NOVELS',
    required: ['NO','ONE','SON','LENS','LOVE','NOSE','OVEN','NOVEL','LOVES','NOVELS'] },
  { id: 'p011', theme: 'Family Dinner', letters: ['P','L','A','T','E','S'], bonus: 'PLATES',
    required: ['ATE','EAT','PAL','PAT','TEA','LATE','PALE','LEAP','PLATE','PLATES'] },
  { id: 'p012', theme: "Winter's Eve", letters: ['W','I','N','T','E','R'], bonus: 'WINTER',
    required: ['WIN','NEW','TIE','WIT','RENT','RITE','TWIN','WINE','TWINE','WINTER'] },
  { id: 'p013', theme: 'Sweet Treats', letters: ['S','U','G','A','R','Y'], bonus: 'SUGARY',
    required: ['SAY','GAS','RAG','RAY','GUY','GUYS','GAYS','RAYS','SUGAR','SUGARY'] },
  { id: 'p014', theme: 'Country Drives', letters: ['D','R','I','V','E','S'], bonus: 'DRIVES',
    required: ['DIE','RED','RID','RISE','RIDE','SIDE','DIVE','DIVES','DRIVE','DRIVES'] },
  { id: 'p015', theme: 'At the Movies', letters: ['C','I','N','E','M','A'], bonus: 'CINEMA',
    required: ['AIM','CAN','ICE','MAN','MAIN','NAME','MACE','NICE','MANIC','CINEMA'] },
  { id: 'p016', theme: 'Handy Crafts', letters: ['S','E','W','I','N','G'], bonus: 'SEWING',
    required: ['WIG','WIN','SEW','NEW','SIN','SING','SIGN','WINS','SWING','SEWING'] },
  { id: 'p017', theme: 'Golden Hour', letters: ['G','O','L','D','E','N'], bonus: 'GOLDEN',
    required: ['DOG','OLD','ONE','GOLD','GONE','LONE','NODE','OLDEN','LODGE','GOLDEN'] },
  { id: 'p018', theme: 'Quiet Town', letters: ['S','I','L','E','N','T'], bonus: 'SILENT',
    required: ['SIT','TEN','TIE','LIE','LINE','LIST','NEST','INLET','LISTEN','SILENT'] },
  { id: 'p019', theme: 'Family Tree', letters: ['P','A','R','E','N','T'], bonus: 'PARENT',
    required: ['ANT','APE','ART','EAT','NAP','PAN','RAT','TAP','NEAR','PARENT'] },
  { id: 'p020', theme: 'Picnic Day', letters: ['B','A','S','K','E','T'], bonus: 'BASKET',
    required: ['ATE','BAT','BEAT','BEST','BASE','SAKE','SEAT','STEAK','BEAST','BASKET'] },
  { id: 'p021', theme: 'Backyard', letters: ['T','I','M','B','E','R'], bonus: 'TIMBER',
    required: ['BIT','MET','RIB','RIM','TIE','MITE','TIRE','TIMER','BITER','TIMBER'] },
  { id: 'p022', theme: 'From the Oven', letters: ['B','A','K','I','N','G'], bonus: 'BAKING',
    required: ['BAG','BAN','BIN','GIN','KIN','NAB','AKIN','BANG','BANK','BAKING'] },
  { id: 'p023', theme: 'Sunday Paper', letters: ['E','D','I','T','O','R'], bonus: 'EDITOR',
    required: ['DOE','RED','RID','ROT','EDIT','RIDE','TIDE','TIRED','RIOTED','EDITOR'] },
  { id: 'p024', theme: 'Autumn Leaves', letters: ['M','A','P','L','E','S'], bonus: 'MAPLES',
    required: ['AMP','APE','ELM','LAP','MAP','PAL','PALE','PALM','AMPLE','MAPLES'] },
  { id: 'p025', theme: 'Spring Bloom', letters: ['F','L','O','W','E','R'], bonus: 'FLOWER',
    required: ['OWE','LOW','ROW','FOE','FLEW','FLOW','FOWL','WORE','WOLF','FLOWER'] },
  { id: 'p026', theme: 'Music Hour', letters: ['G','U','I','T','A','R'], bonus: 'GUITAR',
    required: ['AIR','ART','RAG','RAT','TAR','GAIT','GRIT','RUG','TRIG','GUITAR'] },
  { id: 'p027', theme: 'By Post', letters: ['P','A','R','C','E','L'], bonus: 'PARCEL',
    required: ['ACE','ARC','CAP','CAR','EAR','RAP','CAPE','CARE','CLEAR','PARCEL'] },
  { id: 'p028', theme: 'Bake Day', letters: ['P','A','S','T','R','Y'], bonus: 'PASTRY',
    required: ['RAT','SAY','SPY','TRY','PART','PAST','STAR','TRAY','STRAY','PASTRY'] },
  { id: 'p029', theme: 'Island Trip', letters: ['I','S','L','A','N','D'], bonus: 'ISLAND',
    required: ['AID','AND','LAD','SAD','LAID','LAND','NAIL','SAIL','SAND','ISLAND'] },
  { id: 'p030', theme: 'Tulip Bed', letters: ['T','U','L','I','P','S'], bonus: 'TULIPS',
    required: ['LIP','LIT','PIT','SIT','TIP','LIPS','SLIP','SPIT','SPLIT','TULIPS'] },
  { id: 'p031', theme: 'Breakfast', letters: ['B','A','G','E','L','S'], bonus: 'BAGELS',
    required: ['AGE','BAG','GAS','LAB','LEG','ABLE','BAGEL','BALE','SAGE','BAGELS'] },
  { id: 'p032', theme: 'Crown & Court', letters: ['R','O','Y','A','L','S'], bonus: 'ROYALS',
    required: ['OAR','SOY','RAY','SAY','OARS','ORAL','SOAR','ROYAL','SOLAR','ROYALS'] },
  { id: 'p033', theme: 'Words to Live By', letters: ['H','O','N','E','S','T'], bonus: 'HONEST',
    required: ['HEN','NOSE','NOTE','HOSE','SHOE','TONE','NEST','STONE','NOTES','HONEST'] },
  { id: 'p034', theme: 'Sunday Hymns', letters: ['A','N','G','E','L','S'], bonus: 'ANGELS',
    required: ['AGE','ALE','GAS','LAG','LEG','NAG','LANE','ANGEL','GLEAN','ANGELS'] },
  { id: 'p035', theme: 'Take a Breath', letters: ['B','R','E','A','T','H'], bonus: 'BREATH',
    required: ['BAR','BAT','EAR','HEAR','BEAR','BEAT','BATH','HEART','EARTH','BREATH'] },
  { id: 'p036', theme: 'A Family Outing', letters: ['O','U','T','I','N','G'], bonus: 'OUTING',
    required: ['GOT','GUT','NUT','OUT','TIN','TON','GUN','INTO','UNIT','OUTING'] },
  { id: 'p037', theme: 'First Days', letters: ['C','R','A','D','L','E'], bonus: 'CRADLE',
    required: ['CAR','EAR','LAD','RED','DARE','DEAR','READ','REAL','CLEAR','CRADLE'] },
];

function canSpell(word, lettersLower) {
  const bag = [...lettersLower];
  for (const c of word.toLowerCase()) {
    const i = bag.indexOf(c);
    if (i === -1) return false;
    bag.splice(i, 1);
  }
  return true;
}

let warnings = 0;
let errors = 0;
const output = [];

for (const p of inputs) {
  const lowerLetters = p.letters.map((l) => l.toLowerCase());

  // Validate required + bonus are spellable and (warn-only) in dictionary.
  const mustHave = [...p.required];
  if (!mustHave.includes(p.bonus)) mustHave.push(p.bonus);
  for (const w of mustHave) {
    if (!canSpell(w, lowerLetters)) {
      console.error(`ERROR ${p.id}: "${w}" not spellable from ${p.letters.join('')}`);
      errors++;
    }
    if (!wordSet.has(w.toLowerCase())) {
      console.warn(`WARN  ${p.id}: "${w}" not in dictionary (will keep — required override)`);
      warnings++;
    }
  }
  // Enforce uniqueness within required.
  const seen = new Set();
  for (const w of p.required) {
    if (seen.has(w)) {
      console.error(`ERROR ${p.id}: duplicate required word "${w}"`);
      errors++;
    }
    seen.add(w);
  }

  // Enumerate all valid dictionary words 3..6 letters spellable from the wheel.
  const valid = new Set();
  for (const w of words) {
    if (w.length < 3 || w.length > 6) continue;
    if (canSpell(w, lowerLetters)) valid.add(w.toUpperCase());
  }
  // Ensure required + bonus are present (override the dictionary if missing).
  for (const w of mustHave) valid.add(w);

  const requiredSet = new Set(p.required);
  const extras = [...valid]
    .filter((w) => !requiredSet.has(w))
    .filter((w) => w !== p.bonus || !requiredSet.has(p.bonus))
    .filter((w) => w !== p.bonus)
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

  output.push({
    id: p.id,
    theme: p.theme,
    letters: p.letters,
    bonus: p.bonus,
    required: p.required,
    extras,
  });
}

if (errors > 0) {
  console.error(`\n${errors} error(s) — aborting.`);
  process.exit(1);
}

const out = path.resolve(import.meta.dirname, '..', 'src', 'data', 'puzzles.json');
writeFileSync(out, JSON.stringify(output, null, 2) + '\n');

const totalExtras = output.reduce((s, p) => s + p.extras.length, 0);
console.log(`\nGenerated ${output.length} puzzles, ${totalExtras} total extras.`);
console.log(`Warnings: ${warnings}, Errors: ${errors}`);
console.log(`Wrote ${out}`);
