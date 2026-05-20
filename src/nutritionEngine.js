export const NUTRITION_PHASES = {
  menstrual: {
    protein: "Aim for 1.6–1.8 g/kg bodyweight. Prioritize easily digested proteins like eggs, fish, and legumes to support tissue repair and reduce inflammation during bleeding.",
    carbs: "Opt for complex carbs — oats, sweet potato, brown rice — to maintain steady blood sugar and energy. Avoid spikes that worsen cramps and fatigue.",
    hydration: "Increase water intake by 300–500 ml/day to replace blood loss. Herbal teas (ginger, raspberry leaf) support cramping and inflammation.",
    kcalTarget: 1850,
    macros: [
      { key: "protein", label: "Protein", val: "130g", pct: "28%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "185g", pct: "40%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "65g",  pct: "32%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "28g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Iron", why: "Replenishes iron lost through menstruation. Deficiency causes fatigue and poor performance.", foods: ["Red meat (lean)", "Lentils", "Spinach", "Pumpkin seeds", "Dark chocolate"] },
      { name: "Omega-3s", why: "Reduces prostaglandin-driven cramping and systemic inflammation.", foods: ["Salmon", "Sardines", "Walnuts", "Flaxseed", "Chia seeds"] },
      { name: "Magnesium", why: "Relaxes uterine muscle, reduces cramp severity, and supports sleep quality.", foods: ["Dark leafy greens", "Almonds", "Avocado", "Banana", "Dark chocolate"] },
      { name: "Vitamin C", why: "Enhances non-heme iron absorption from plant foods. Take with iron-rich meals.", foods: ["Bell peppers", "Citrus fruit", "Kiwi", "Strawberries", "Broccoli"] },
    ],
    cravings: "Cravings for chocolate and carbs are physiologically real — magnesium and serotonin dip as progesterone falls. A square of dark chocolate + a complex carb snack honors your body without guilt. You're not 'off track', you're responding to real hormonal signals.",
    mealIdeas: [
      "Lentil soup with spinach + sourdough bread",
      "Salmon rice bowl with edamame and sesame",
      "Scrambled eggs on sweet potato toast + orange juice",
      "Dark chocolate energy balls with oats and almond butter",
      "Beef and vegetable stir-fry over brown rice",
      "Smoothie: spinach, banana, chia seeds, almond milk, cacao",
    ],
  },
  follicular: {
    protein: "Aim for 1.6–2.0 g/kg bodyweight as estrogen rises and muscle protein synthesis improves. This is your best window for muscle-building nutrition.",
    carbs: "Higher carb tolerance — estrogen improves insulin sensitivity. Carb-cycle around workouts: more pre and post-workout, moderate rest of the day.",
    hydration: "Standard 2–2.5 L/day. Add electrolytes around intense training sessions. Estrogen supports better fluid balance.",
    kcalTarget: 2000,
    macros: [
      { key: "protein", label: "Protein", val: "140g", pct: "28%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "225g", pct: "45%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "60g",  pct: "27%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "30g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Phytoestrogens", why: "Gently support rising estrogen levels in early follicular phase.", foods: ["Edamame", "Flaxseed", "Tempeh", "Miso", "Sesame seeds"] },
      { name: "B vitamins", why: "Support energy metabolism and neurotransmitter production as activity increases.", foods: ["Eggs", "Whole grains", "Leafy greens", "Legumes", "Nutritional yeast"] },
      { name: "Zinc", why: "Supports follicle development and immune function. Often low in active women.", foods: ["Pumpkin seeds", "Beef", "Chickpeas", "Cashews", "Quinoa"] },
      { name: "Pre/Post workout carbs", why: "Estrogen improves glycogen storage — capitalize on this with strategic carb timing.", foods: ["Banana", "Rice cakes", "White rice", "Dates", "Sourdough"] },
    ],
    cravings: "Appetite is naturally lower in the follicular phase due to rising estrogen suppressing hunger signals. If you're not as hungry, that's normal. Focus on nutrient density over volume. Don't under-eat if you're training hard — you'll need the fuel for performance.",
    mealIdeas: [
      "Chicken stir-fry with edamame, broccoli, and rice",
      "Greek yogurt parfait with granola, flaxseed, and berries",
      "Quinoa salad with chickpeas, cucumber, and tahini dressing",
      "Pre-workout: banana + almond butter toast",
      "Post-workout: chocolate milk or rice + eggs",
      "Tempeh bowl with roasted vegetables and miso dressing",
    ],
  },
  ovulatory: {
    protein: "Peak protein window — 1.8–2.2 g/kg bodyweight. Higher estrogen maximizes muscle protein synthesis. Time protein within 30–60 min post-workout.",
    carbs: "Moderate to high carbs to fuel peak-intensity training. Focus on pre-workout fueling — you have the energy to match.",
    hydration: "Cervical fluid changes require slightly higher hydration. Aim for 2.5–3 L/day. Add electrolytes before and after intense training.",
    kcalTarget: 2100,
    macros: [
      { key: "protein", label: "Protein", val: "155g", pct: "30%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "235g", pct: "45%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "60g",  pct: "25%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "25g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Antioxidants", why: "Protect egg quality and reduce oxidative stress during peak hormonal activity.", foods: ["Blueberries", "Pomegranate", "Beets", "Green tea", "Turmeric"] },
      { name: "Calcium", why: "Supports muscle contraction and reduces ACL injury risk (elevated during ovulation).", foods: ["Greek yogurt", "Milk", "Fortified oat milk", "Broccoli", "Almonds"] },
      { name: "Magnesium", why: "Prevents muscle cramping and supports neuromuscular function at peak output.", foods: ["Dark chocolate", "Spinach", "Pumpkin seeds", "Cashews", "Banana"] },
      { name: "Vitamin E", why: "Antioxidant support for hormonal health and muscle recovery.", foods: ["Sunflower seeds", "Almonds", "Avocado", "Olive oil", "Spinach"] },
    ],
    cravings: "Appetite returns to baseline or slightly elevated during ovulation. Your metabolism is peaking — this is not the time to restrict. Fuel performance with real, whole foods. Honor hunger as a signal that your body is working hard.",
    mealIdeas: [
      "Steak + roasted beets + sweet potato",
      "Salmon with avocado and pomegranate salad",
      "Protein smoothie: Greek yogurt, blueberries, banana, protein powder",
      "Pre-workout: dates + almond butter",
      "Chicken tikka masala with turmeric rice",
      "Antioxidant bowl: acai, mixed berries, granola, chia, honey",
    ],
  },
  luteal_early: {
    protein: "Maintain 1.6–1.8 g/kg bodyweight. Progesterone increases protein catabolism, so steady protein intake protects your muscle gains.",
    carbs: "Moderate complex carbs support steady energy as insulin sensitivity begins to decline slightly. Evening carbs can support serotonin and sleep quality.",
    hydration: "Progesterone raises body temperature slightly — increase fluids by 200–300 ml/day. Watch for early bloating signs and reduce sodium.",
    kcalTarget: 2150,
    macros: [
      { key: "protein", label: "Protein", val: "135g", pct: "25%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "215g", pct: "40%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "85g",  pct: "35%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "32g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Magnesium", why: "Reduces PMS symptoms, supports progesterone production, and improves sleep quality.", foods: ["Dark leafy greens", "Pumpkin seeds", "Dark chocolate", "Almonds", "Avocado"] },
      { name: "Vitamin B6", why: "Supports progesterone production, reduces PMS mood symptoms, and aids serotonin synthesis.", foods: ["Chicken", "Salmon", "Banana", "Sweet potato", "Sunflower seeds"] },
      { name: "Complex carbs (evening)", why: "Evening carbs boost serotonin and tryptophan, supporting sleep and mood regulation.", foods: ["Oats", "Sweet potato", "Brown rice", "Lentils", "Quinoa"] },
      { name: "Omega-3s", why: "Counter pro-inflammatory prostaglandins before menstruation arrives.", foods: ["Salmon", "Sardines", "Walnuts", "Flaxseed", "Hemp seeds"] },
    ],
    cravings: "Some hunger increase is normal as progesterone rises and metabolism shifts. Your basal metabolic rate increases by 100–300 kcal in the luteal phase — this is not imagined. A slightly larger appetite is appropriate. Focus on protein and fiber to manage satiety without over-restricting.",
    mealIdeas: [
      "Chicken and sweet potato sheet pan with roasted veg",
      "Lentil dahl with brown rice and spinach",
      "Salmon and quinoa bowl with avocado",
      "Evening snack: banana + almond butter on oat crackers",
      "Turkey and vegetable soup with sourdough",
      "Dark chocolate bark with pumpkin seeds and almonds",
    ],
  },
  luteal_late: {
    protein: "Increase slightly to 1.8–2.0 g/kg to counter elevated protein catabolism and appetite. Protein is satiating and supports stable blood sugar.",
    carbs: "Focus on complex, high-fiber carbs to stabilize blood sugar and reduce cravings. Avoid refined sugar — it amplifies PMS mood symptoms.",
    hydration: "Bloating is common due to aldosterone fluctuations. Counterintuitively, drinking more water (not less) reduces water retention. Reduce caffeine and alcohol which worsen inflammation.",
    kcalTarget: 2250,
    macros: [
      { key: "protein", label: "Protein", val: "145g", pct: "25%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "245g", pct: "45%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "75g",  pct: "30%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "35g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Magnesium + B6", why: "The most evidence-backed combo for reducing PMS symptoms including cramps, mood changes, and bloating.", foods: ["Dark chocolate", "Spinach", "Chicken", "Banana", "Avocado"] },
      { name: "Calcium", why: "Supplemental calcium (1000mg/day) reduces PMS symptom severity by up to 48% in research.", foods: ["Greek yogurt", "Milk", "Kale", "Tofu", "Fortified oat milk"] },
      { name: "Tryptophan", why: "Precursor to serotonin — low serotonin drives PMS-related mood and cravings. Evening carbs boost uptake.", foods: ["Turkey", "Eggs", "Cheese", "Oats", "Dark chocolate"] },
      { name: "Anti-inflammatory foods", why: "Counter prostaglandin activity that drives cramping and systemic inflammation before menstruation.", foods: ["Ginger tea", "Turmeric", "Berries", "Fatty fish", "Olive oil"] },
    ],
    cravings: "Strong cravings in late luteal phase — particularly for carbs and chocolate — are driven by real hormonal shifts in serotonin, blood sugar regulation, and metabolic rate. An extra 200–500 kcal in this phase is physiologically appropriate. Eat enough. Restriction makes symptoms worse, not better.",
    mealIdeas: [
      "Turkey and vegetable stir-fry with brown rice",
      "Oatmeal with banana, almond butter, and dark chocolate chips",
      "Warm lentil and spinach soup with whole grain bread",
      "Ginger and turmeric chicken soup",
      "Smoothie: frozen banana, cacao, almond milk, protein powder",
      "Baked sweet potato with Greek yogurt, walnuts, and cinnamon",
    ],
  },
};

export function getDailyNudge(phase) {
  const nudges = {
    menstrual: "Focus on iron-rich foods today and stay extra hydrated — your body is doing real work.",
    follicular: "Your carb tolerance is at its best right now — fuel your training and don't under-eat.",
    ovulatory: "Peak performance day — eat enough protein post-workout to capitalize on your muscle-building window.",
    luteal_early: "Add magnesium-rich foods tonight to support sleep quality and reduce PMS symptoms before they start.",
    luteal_late: "Honor your increased appetite — it's physiological, not willpower. Prioritize protein and complex carbs.",
  };
  return nudges[phase] || "Eat whole foods, stay hydrated, and listen to your body today.";
}

export const GOAL_NUTRITION = {
  fat_loss: {
    protein: "Aim for 1.8–2.2 g/kg bodyweight. High protein preserves muscle mass while in a calorie deficit and maximizes satiety.",
    carbs: "Focus on high-fiber, complex carbs. Timing matters: prioritize carbs around your workouts to fuel performance, and lean on veggies and proteins later in the day.",
    hydration: "Aim for 3+ L/day. Staying fully hydrated aids fat metabolism and prevents confusing thirst for hunger.",
    kcalTarget: 1750,
    macros: [
      { key: "protein", label: "Protein", val: "165g", pct: "38%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "135g", pct: "30%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "60g",  pct: "32%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "35g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Fiber", why: "Slows digestion and increases fullness.", foods: ["Broccoli", "Oats", "Chia seeds", "Lentils", "Berries"] },
      { name: "Omega-3s", why: "Supports metabolic health and reduces inflammation.", foods: ["Salmon", "Flaxseed", "Walnuts", "Sardines"] },
      { name: "Green Tea Extract", why: "Contains EGCG which may mildly support fat oxidation.", foods: ["Matcha", "Green tea"] },
    ],
    cravings: "When in a deficit, cravings are physiological signals of energy needs. Prioritize protein-dense snacks (like Greek yogurt or a shake) before giving in to cravings. If you still want the treat, have a small portion and move on.",
    mealIdeas: [
      "Grilled chicken breast with roasted broccoli and a small sweet potato",
      "Egg white and spinach scramble with avocado",
      "Large mixed greens salad with tuna and light vinaigrette",
      "Protein shake with almond milk and a handful of berries",
      "Zucchini noodles with lean ground turkey marinara",
    ],
  },
  strength: {
    protein: "Crucial for hypertrophy: 2.0–2.2 g/kg bodyweight. Distribute evenly across 4-5 meals to maximize muscle protein synthesis.",
    carbs: "Carbs are muscle-sparing and fuel intense lifting. Aim for moderate-high intake, especially pre- and post-workout.",
    hydration: "Standard 2–3 L/day, plus 500 ml per intense training hour. Dehydration drops strength output significantly.",
    kcalTarget: 2650,
    macros: [
      { key: "protein", label: "Protein", val: "185g", pct: "28%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "325g", pct: "50%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "65g",  pct: "22%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "30g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Creatine", why: "Enhances ATP regeneration for explosive strength and muscle volume.", foods: ["Beef", "Herring", "(or supplement 5g/day)"] },
      { name: "Leucine", why: "The key amino acid trigger for muscle protein synthesis.", foods: ["Chicken", "Eggs", "Dairy", "Whey protein"] },
      { name: "Zinc", why: "Supports testosterone production and tissue repair.", foods: ["Oysters", "Beef", "Pumpkin seeds", "Lentils"] },
    ],
    cravings: "Building muscle requires a caloric surplus. If you're constantly hungry or craving high-calorie foods, you might be under-eating. Don't fear healthy fats and complex carbs—they are essential for growth.",
    mealIdeas: [
      "Steak with quinoa and asparagus",
      "Whole wheat turkey wrap with hummus and greens",
      "Large bowl of oatmeal with whey protein and peanut butter",
      "Post-workout: Chicken, white rice, and avocado",
      "Cottage cheese with pineapple and walnuts",
    ],
  },
  wellness: {
    protein: "Aim for 1.2–1.6 g/kg bodyweight. Enough to maintain lean mass and support daily cellular repair.",
    carbs: "Focus on whole, unprocessed sources to maintain steady energy levels and support gut microbiome diversity.",
    hydration: "Aim for 2–2.5 L of water daily. Consistent hydration supports cognitive function and joint health.",
    kcalTarget: 2000,
    macros: [
      { key: "protein", label: "Protein", val: "125g", pct: "25%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "225g", pct: "45%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "65g",  pct: "30%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "32g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Probiotics", why: "Supports a healthy gut microbiome and immune system.", foods: ["Yogurt", "Kefir", "Kimchi", "Kombucha"] },
      { name: "Vitamin D", why: "Essential for bone health, immune function, and mood.", foods: ["Fortified dairy", "Salmon", "Egg yolks", "(or sunlight)"] },
      { name: "Magnesium", why: "Supports nervous system calming and over 300 enzyme reactions.", foods: ["Spinach", "Almonds", "Black beans", "Dark chocolate"] },
    ],
    cravings: "Cravings are normal. The 80/20 rule applies: 80% whole, nutrient-dense foods, and 20% whatever feeds your soul. No guilt, just balance.",
    mealIdeas: [
      "Mediterranean bowl with falafel, greens, cucumber, and tzatziki",
      "Vegetable frittata with goat cheese",
      "Salmon and roasted root vegetables",
      "Smoothie with mixed berries, spinach, and hemp seeds",
      "Apple slices with almond butter",
    ],
  },
  endurance: {
    protein: "Aim for 1.4–1.6 g/kg bodyweight to repair tissue damage from repetitive impact and long efforts.",
    carbs: "The primary fuel source. High intake is necessary. Periodize: very high before and after long efforts, moderate on rest days.",
    hydration: "Critical. Drink to thirst daily, but during efforts >1 hour, proactively consume fluids with sodium/electrolytes.",
    kcalTarget: 2800,
    macros: [
      { key: "protein", label: "Protein", val: "140g", pct: "20%", c: "var(--phase-accent)" },
      { key: "carbs",   label: "Carbs",   val: "420g", pct: "60%", c: "color-mix(in oklch, var(--phase-accent) 50%, transparent)" },
      { key: "fat",     label: "Fat",     val: "60g",  pct: "20%", c: "var(--yr-text-2)" },
      { key: "fiber",   label: "Fiber",   val: "35g",  pct: "—",   c: "var(--yr-surface-2)" },
    ],
    keyNutrients: [
      { name: "Iron", why: "Crucial for oxygen transport. Foot-strike hemolysis can deplete iron in runners.", foods: ["Red meat", "Lentils", "Spinach (with Vitamin C)"] },
      { name: "Nitrates", why: "Improves blood flow and lowers oxygen cost of exercise.", foods: ["Beets", "Arugula", "Rhubarb"] },
      { name: "Sodium", why: "The primary electrolyte lost in sweat. Crucial for preventing cramps during long efforts.", foods: ["Salted nuts", "Pickles", "Electrolyte drinks"] },
    ],
    cravings: "If you're craving salt, you likely need sodium. If you're craving pure sugar, your glycogen stores are likely depleted. Listen to these signals and fuel appropriately during and after training.",
    mealIdeas: [
      "Pre-run: Toast with honey and a banana",
      "Post-run: Large pasta bowl with turkey meatballs",
      "Chicken and rice burrito with black beans",
      "Pancakes with maple syrup and Greek yogurt",
      "Trail mix with salted pretzels, raisins, and almonds",
    ],
  },
};

// muscle_tone — close to strength but with leaner emphasis
export const GOAL_NUTRITION_EXTRA = {
  muscle_tone: {
    protein: "Aim for 1.8–2.0 g/kg bodyweight to preserve and build lean muscle while staying lean. Spread intake across 4 meals.",
    carbs: "Moderate carbs timed around training. Pre-workout fuel supports performance; post-workout carbs aid recovery and muscle fullness.",
    hydration: "Aim for 2.5–3 L/day. Muscle tissue is ~75% water — hydration directly affects pump and performance.",
    keyNutrients: [
      { name: "Leucine", why: "Key amino acid trigger for muscle protein synthesis.", foods: ["Chicken", "Eggs", "Dairy", "Whey protein", "Fish"] },
      { name: "Creatine", why: "Supports lean muscle volume and explosive output.", foods: ["Beef", "Salmon", "Pork", "(or 5g/day supplement)"] },
      { name: "Magnesium", why: "Involved in muscle contraction and recovery. Often depleted by training.", foods: ["Almonds", "Dark chocolate", "Avocado", "Spinach"] },
    ],
    cravings: "If you're craving carbs, your glycogen might be low from training. A small carb + protein snack (rice cake + peanut butter) supports both recovery and body composition better than refined snacks.",
    mealIdeas: [
      "Chicken breast with roasted sweet potato and greens",
      "Greek yogurt with banana, granola, and chia seeds",
      "Salmon fillet with quinoa and roasted asparagus",
      "Protein oats with almond butter and berries",
      "Turkey and avocado wrap with spinach",
    ],
  },
  flexibility: {
    protein: "Aim for 1.4–1.6 g/kg bodyweight. Collagen synthesis for connective tissue benefits from consistent moderate protein intake.",
    carbs: "Moderate complex carbs to fuel movement sessions and support nervous system recovery. Avoid under-eating on active days.",
    hydration: "Fascia and connective tissue need consistent hydration. Aim for 2–2.5 L/day and increase before and after stretching sessions.",
    keyNutrients: [
      { name: "Collagen + Vitamin C", why: "Vitamin C activates collagen synthesis. Take together 30–60 min before stretching for best effect.", foods: ["Bone broth", "Citrus", "Bell peppers", "Kiwi", "Gelatin"] },
      { name: "Omega-3s", why: "Reduces systemic inflammation and supports joint lubrication.", foods: ["Salmon", "Walnuts", "Flaxseed", "Sardines", "Chia seeds"] },
      { name: "Magnesium", why: "Relaxes muscles and supports parasympathetic recovery — ideal for mobility-focused training.", foods: ["Dark leafy greens", "Almonds", "Banana", "Dark chocolate"] },
    ],
    cravings: "Mobility and yoga practices are parasympathetic — they can actually reduce appetite. Don't skip meals thinking you 'didn't burn enough'. Collagen-supportive snacks (bone broth, citrus + protein) are especially useful after flexibility sessions.",
    mealIdeas: [
      "Bone broth soup with vegetables and noodles",
      "Salmon and roasted root vegetables",
      "Smoothie: mango, spinach, collagen powder, coconut water",
      "Overnight oats with chia seeds and kiwi",
      "Avocado toast with eggs and a glass of orange juice",
    ],
  },
};

export function getGoalNudge(goal) {
  const nudges = {
    fat_loss:    "Prioritize protein at every meal today to keep your metabolism elevated and stay full.",
    strength:    "Don't skimp on your post-workout carbs today — they're essential for shuttling protein into your muscles.",
    wellness:    "Focus on eating the rainbow today. Aim for at least 3 different colors of vegetables.",
    endurance:   "Hydration starts the day before your long session. Drink an extra glass of water right now.",
    muscle_tone: "A protein-rich snack within 30 minutes of training today will maximize the muscle response.",
    flexibility: "Try having a collagen-rich snack 45 minutes before your stretch session for connective tissue support.",
  };
  return nudges[goal] || "Eat whole foods, stay hydrated, and listen to your body today.";
}
