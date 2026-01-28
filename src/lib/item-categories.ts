export const ITEM_CATEGORIES = {
  'Supplier Sayur-mayur': [
    'Bayam', 'Kangkung', 'Sawi hijau', 'Sawi putih', 'Pakcoy', 'Selada', 'Daun singkong',
    'Daun pepaya', 'Daun katuk', 'Daun kelor', 'Daun bawang', 'Seledri', 'Kubis', 'Kol',
    'Kailan', 'Genjer', 'Kenikir', 'Daun kemangi', 'Daun melinjo', 'Tomat', 'Mentimun',
    'Terong ungu', 'Terong hijau', 'Cabai merah', 'Cabai hijau', 'Cabai rawit', 'Paprika',
    'Labu siam', 'Pare', 'Oyong', 'Gambas', 'Okra', 'Kacang panjang', 'Buncis', 'Kapri',
    'Petai', 'Jengkol', 'Wortel', 'Lobak', 'Kentang', 'Talas', 'Bengkuang', 'Bit', 'Garut',
    'Kembang kol', 'Brokoli', 'Bunga pepaya', 'Bunga turi', 'Jantung pisang', 'Jagung manis',
    'Kacang tanah', 'Kacang hijau', 'Kedelai', 'Kacang merah', 'Kacang tolo', 'Kacang polong',
    'Asparagus', 'Rebung', 'Batang seledri', 'Batang talas', 'Jamur tiram', 'Jamur kancing',
    'Jamur kuping', 'Jamur shiitake', 'Jamur enoki', 'Jamur merang'
  ],
  'Supplier Daging Ayam': [
    'Ayam negeri', 'Broiler', 'Ayam kampung', 'Ayam pejantan', 'Bebek', 'Itik', 'Entok',
    'Kalkun', 'Puyuh', 'Hati ayam', 'Ampela', 'Usus', 'Ayam potong'
  ],
  'Supplier Daging Sapi': [
    'Daging sapi paha', 'Daging sapi has luar', 'Daging sapi has dalam',
    'Daging sapi sandung lamur', 'Brisket', 'Daging sapi sengkel', 'Daging sapi iga',
    'Daging sapi tetelan', 'Daging sapi giling', 'Hati sapi', 'Babad', 'Paruh', 'Limpa',
    'Ginjal', 'Otak sapi', 'Daging sapi'
  ],
  'Supplier Daging Kambing': [
    'Daging kambing', 'Daging domba', 'Iga kambing', 'Hati kambing', 'Limpa', 'Ginjal', 'Otak kambing'
  ],
  'Supplier Daging Babi': [
    'Daging babi segar', 'Babi giling', 'Iga babi', 'Bacon', 'Ham', 'Daging babi'
  ],
  'Supplier Daging Olahan': [
    'Sosis', 'Nugget', 'Bakso', 'Kornet', 'Dendeng', 'Abon', 'Smoked beef'
  ],
  'Supplier Ikan': [
    'Ikan ayam-ayam', 'Ikan tongkol', 'Ikan tuna', 'Ikan bandeng', 'Ikan nila',
    'Ikan bawal laut', 'Ikan bawal tawar', 'Ikan lele', 'Ikan patin', 'Udang',
    'Cumi-cumi', 'Kepiting', 'Rajungan'
  ],
  'Supplier Buah': [
    'Apel', 'Jeruk', 'Pisang', 'Anggur', 'Mangga', 'Semangka', 'Melon', 'Nanas',
    'Pepaya', 'Salak', 'Rambutan', 'Durian', 'Jambu', 'Alpukat', 'Pir', 'Strawberry',
    'Buah Naga', 'Kelengkeng', 'Manggis', 'Duku'
  ],
  'Supplier Susu': [
    'Susu segar', 'Susu UHT', 'Susu UHT kotak', 'Susu kental manis', 'Susu bubuk', 'Keju', 'Cheddar',
    'Mozzarella', 'Parmesan', 'Yogurt', 'Mentega', 'Butter', 'Margarin', 'Cream', 'Ice Cream'
  ],
  'Supplier Beras': [
    'Beras', 'Beras Putih', 'Beras IR', 'Beras medium', 'Beras premium', 'Beras pandan wangi',
    'Beras rojolele', 'Beras mentik wangi', 'Beras cisadane', 'Beras long grain', 'Beras short grain',
    'Beras Merah', 'Beras merah lokal', 'Beras merah organik', 'Beras merah pecah kulit',
    'Beras Hitam', 'Beras hitam lokal', 'Beras hitam organic',
    'Beras Basmati',
    'Ketan', 'Ketan putih', 'Ketan hitam'
  ],
  'Supplier Air Minum Kemasan': [
    'Air mineral gelas', 'Air mineral cup', 'Air mineral botol',
    'Air mineral botol 600 ml', 'Air mineral botol 1,5 liter',
    'Air mineral galon 19 liter', 'Air Galon', 'Air Mineral'
  ],
  'Supplier Bumbu': [
    'Garam', 'Gula', 'Kaldu bubuk', 'Merica', 'Ketumbar', 'Minyak goreng', 'Bawang merah', 'Bawang putih',
    'Tepung terigu', 'Tepung maizena', 'Air'
  ]
};

export function getCategoryByItemName(itemName: string): string {
  const lowerItemName = itemName.toLowerCase();
  
  for (const [category, items] of Object.entries(ITEM_CATEGORIES)) {
    if (items.some(item => lowerItemName.includes(item.toLowerCase()))) {
      return category;
    }
  }
  
  return 'General Supplier'; // Default if no match found
}
