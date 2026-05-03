export const NUTRITION_PHASES = {
  menstrual: {
    protein: "Aim for 1.6–1.8 g/kg bodyweight. Prioritize easily digested proteins like eggs, fish, and legumes to support tissue repair and reduce inflammation during bleeding.",
    carbs: "Opt for complex carbs — oats, sweet potato, brown rice — to maintain steady blood sugar and energy. Avoid spikes that worsen cramps and fatigue.",
    hydration: "Increase water intake by 300–500 ml/day to replace blood loss. Herbal teas (ginger, raspberry leaf) support cramping and inflammation.",
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
