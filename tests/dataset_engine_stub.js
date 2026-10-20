const VIDEO_PAGE1_DATASET = [
  { "godname": "कुंथुनाथ भगवान", "sign": "बकरा" },
  { "godname": "धर्मनाथ भगवान", "sign": "वज्रदंड" },
  { "godname": "सुमतिनाथ भगवान", "sign": "चकवा" },
  { "godname": "महावीर भगवान", "sign": "सिंह" },
  { "godname": "चंद्रप्रभ भगवान", "sign": "चंद्रमा" },
  { "godname": "आदिनाथ भगवान", "sign": "बैल" },
  { "godname": "श्रेयांसनाथ भगवान", "sign": "गेंडा" },
  { "godname": "पार्श्वनाथ भगवान", "sign": "सर्प" },
  { "godname": "पद्मप्रभु भगवान", "sign": "लाल कमल" },
  { "godname": "संभवनाथ भगवान", "sign": "घोड़ा" }
];

const VIDEO_PAGE2_DATASET = [
  { "godname": "शीतलनाथ भगवान", "sign": "कल्पवृक्ष" },
  { "godname": "अभिनंदननाथ भगवान", "sign": "बंदर" },
  { "godname": "वासुपूज्य भगवान", "sign": "भैंसा" },
  { "godname": "विमलनाथ भगवान", "sign": "शूकर" },
  { "godname": "सुपार्श्वनाथ भगवान", "sign": "स्वस्तिक" },
  { "godname": "शांतिनाथ भगवान", "sign": "हिरण" },
  { "godname": "अनंतनाथ भगवान", "sign": "सेही" },
  { "godname": "पुष्पदंत भगवान", "sign": "मगर" },
  { "godname": "मुनिसुव्रतनाथ भगवान", "sign": "कछुआ" },
  { "godname": "अजितनाथ भगवान", "sign": "हाथी" }
];

const AUTHENTIC_SET_DATASET = [
  { "godname": "कुंथुनाथ भगवान", "sign": "बकरा" },
  { "godname": "विमलनाथ भगवान", "sign": "शूकर" },
  { "godname": "धर्मनाथ भगवान", "sign": "वज्रदंड" },
  { "godname": "अजितनाथ भगवान", "sign": "हाथी" },
  { "godname": "आदिनाथ भगवान", "sign": "बैल" },
  { "godname": "सुपार्श्वनाथ भगवान", "sign": "स्वस्तिक" },
  { "godname": "पुष्पदंत भगवान", "sign": "मगर" },
  { "godname": "शांतिनाथ भगवान", "sign": "हिरण" },
  { "godname": "महावीर भगवान", "sign": "सिंह" },
  { "godname": "मुनिसुव्रतनाथ भगवान", "sign": "कछुआ" }
];

const ATTACHED_JSON_EXACT = [
  { "godname": "कुंथुनाथ भगवान", "sign": "स्वस्तिक" },
  { "godname": "विमलनाथ भगवान", "sign": "हिरण" },
  { "godname": "धर्मनाथ भगवान", "sign": "बकरा" },
  { "godname": "अजितनाथ भगवान", "sign": "शूकर" },
  { "godname": "आदिनाथ भगवान", "sign": "वज्रदंड" },
  { "godname": "सुपार्श्वनाथ भगवान", "sign": "कछुआ" },
  { "godname": "पुष्पदंत भगवान", "sign": "सिंह" },
  { "godname": "शांतिनाथ भगवान", "sign": "मगर" },
  { "godname": "महावीर भगवान", "sign": "बैल" },
  { "godname": "मुनिसुव्रतनाथ भगवान", "sign": "हाथी" }
];

const DATASET_REGISTRY = [
  { id: 'video_set1', name: 'Video Set 1 (10 भगवान)', items: VIDEO_PAGE1_DATASET },
  { id: 'video_set2', name: 'Video Set 2 (10 भगवान)', items: VIDEO_PAGE2_DATASET },
  { id: 'authentic_10', name: 'Authentic Signs (10 भगवान)', items: AUTHENTIC_SET_DATASET },
  { id: 'json10_exact', name: 'Attached jain-quest.json (Exact)', items: ATTACHED_JSON_EXACT }
];

function validateDataset(data) {
  if (!Array.isArray(data) || data.length === 0) return false;
  return data.every(item => item && typeof item.godname === 'string' && typeof item.sign === 'string');
}

function pickRandomDataset() {
  const idx = Math.floor(Math.random() * DATASET_REGISTRY.length);
  return DATASET_REGISTRY[idx];
}

function registerCustomDataset(name, items) {
  if (!validateDataset(items)) return false;
  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  DATASET_REGISTRY.push({ id, name, items: items.slice(0, 10) });
  return true;
}

function registerCustomDatasets(datasets) {
  if (!Array.isArray(datasets)) return 0;
  let addedCount = 0;
  datasets.forEach((ds, i) => {
    const name = ds.name || `Custom Set ${DATASET_REGISTRY.length + 1}`;
    const items = Array.isArray(ds.items) ? ds.items : (Array.isArray(ds) ? ds : []);
    if (registerCustomDataset(name, items)) {
      addedCount++;
    }
  });
  return addedCount;
}

module.exports = {
  VIDEO_PAGE1_DATASET,
  VIDEO_PAGE2_DATASET,
  AUTHENTIC_SET_DATASET,
  ATTACHED_JSON_EXACT,
  DATASET_REGISTRY,
  pickRandomDataset,
  validateDataset,
  registerCustomDataset,
  registerCustomDatasets
};
