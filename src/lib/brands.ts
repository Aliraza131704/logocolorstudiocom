// Brand color data for the /brand-colors section.
// Colors are the widely documented official brand/logo colors; guidelines links
// point to the brand's official press or brand-asset page where one exists.

export type BrandColor = { hex: string; name: string };
export type CategoryId =
  | "tech" | "fashion" | "luxury" | "automotive" | "food"
  | "beauty" | "sports" | "home" | "finance" | "entertainment";

export const BRAND_CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "tech", label: "Technology" },
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "luxury", label: "Luxury & Jewellery" },
  { id: "automotive", label: "Cars & Automotive" },
  { id: "food", label: "Food & Beverages" },
  { id: "beauty", label: "Beauty & Personal Care" },
  { id: "sports", label: "Sports & Outdoor" },
  { id: "home", label: "Home & Lifestyle" },
  { id: "finance", label: "Finance & Business" },
  { id: "entertainment", label: "Entertainment, Travel & Retail" },
];

export type Brand = {
  slug: string;
  name: string;
  category: CategoryId;
  domain: string;
  colors: BrandColor[];
  guidelines?: string;
};

type Row = [name: string, slug: string, category: CategoryId, domain: string, colors: [hex: string, name: string][], guidelines?: string];

const ROWS: Row[] = [
  // Technology
  ["Apple", "apple", "tech", "apple.com", [["#000000", "Black"], ["#86868B", "Graphite Gray"], ["#0071E3", "Apple Blue"]], "https://www.apple.com/newsroom/"],
  ["Samsung", "samsung", "tech", "samsung.com", [["#1428A0", "Samsung Blue"], ["#000000", "Black"]]],
  ["Microsoft", "microsoft", "tech", "microsoft.com", [["#F25022", "Red"], ["#7FBA00", "Green"], ["#00A4EF", "Blue"], ["#FFB900", "Yellow"]], "https://news.microsoft.com/mssource/docs/styleguides/"],
  ["Google", "google", "tech", "google.com", [["#4285F4", "Blue"], ["#EA4335", "Red"], ["#FBBC05", "Yellow"], ["#34A853", "Green"]], "https://about.google/brand-resource-center/"],
  ["Sony", "sony", "tech", "sony.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Intel", "intel", "tech", "intel.com", [["#0068B5", "Intel Blue"], ["#00C7FD", "Light Blue"]]],
  ["AMD", "amd", "tech", "amd.com", [["#ED1C24", "AMD Red"], ["#000000", "Black"]]],
  ["NVIDIA", "nvidia", "tech", "nvidia.com", [["#76B900", "NVIDIA Green"], ["#000000", "Black"]]],
  ["Meta", "meta", "tech", "about.meta.com", [["#0081FB", "Meta Blue"], ["#1C2B33", "Dark"]]],
  ["OpenAI", "openai", "tech", "openai.com", [["#000000", "Black"], ["#10A37F", "Teal"]]],
  ["Anthropic", "anthropic", "tech", "anthropic.com", [["#D97757", "Coral"], ["#191919", "Ink"]]],
  ["Slack", "slack", "tech", "slack.com", [["#4A154B", "Aubergine"], ["#36C5F0", "Blue"], ["#2EB67D", "Green"], ["#ECB22E", "Yellow"], ["#E01E5A", "Red"]], "https://slack.com/intl/en-gb/media-kit"],
  ["Shopify", "shopify", "tech", "shopify.com", [["#95BF47", "Shopify Green"], ["#5E8E3E", "Dark Green"], ["#000000", "Black"]]],
  ["GitHub", "github", "tech", "github.com", [["#181717", "Ink"], ["#2DA44E", "Green"], ["#0969DA", "Blue"]]],
  ["Xbox", "xbox", "tech", "xbox.com", [["#107C10", "Xbox Green"], ["#9BF00B", "Bright Green"], ["#000000", "Black"]]],
  ["PlayStation", "playstation", "tech", "playstation.com", [["#0070D1", "PlayStation Blue"], ["#003791", "Deep Blue"], ["#000000", "Black"]]],
  ["Nintendo", "nintendo", "tech", "nintendo.com", [["#E60012", "Nintendo Red"], ["#FFFFFF", "White"]]],
  // Fashion
  ["Nike", "nike", "fashion", "nike.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Adidas", "adidas", "fashion", "adidas.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Puma", "puma", "fashion", "puma.com", [["#000000", "Black"], ["#E32219", "Puma Red"]]],
  ["Reebok", "reebok", "fashion", "reebok.com", [["#E4002B", "Reebok Red"], ["#000000", "Black"]]],
  ["Under Armour", "under-armour", "fashion", "underarmour.com", [["#000000", "Black"], ["#C8102E", "Red"]]],
  ["New Balance", "new-balance", "fashion", "newbalance.com", [["#CE0E2D", "NB Red"], ["#000000", "Black"]]],
  ["Converse", "converse", "fashion", "converse.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Vans", "vans", "fashion", "vans.com", [["#000000", "Black"], ["#C8102E", "Vans Red"]]],
  ["Lacoste", "lacoste", "fashion", "lacoste.com", [["#004526", "Lacoste Green"], ["#DB0026", "Crocodile Red"]]],
  ["Gucci", "gucci", "fashion", "gucci.com", [["#006341", "Gucci Green"], ["#C8102E", "Gucci Red"]]],
  ["Prada", "prada", "fashion", "prada.com", [["#000000", "Black"]]],
  ["Chanel", "chanel", "fashion", "chanel.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Dior", "dior", "fashion", "dior.com", [["#000000", "Black"], ["#C9A063", "Gold"]]],
  ["Louis Vuitton", "louis-vuitton", "fashion", "louisvuitton.com", [["#5D4A3A", "LV Brown"], ["#B79B6C", "Monogram Gold"]]],
  ["Burberry", "burberry", "fashion", "burberry.com", [["#C5A97E", "Trench Tan"], ["#000000", "Black"]]],
  ["Balenciaga", "balenciaga", "fashion", "balenciaga.com", [["#000000", "Black"]]],
  ["Supreme", "supreme", "fashion", "supreme.com", [["#ED1C24", "Supreme Red"], ["#FFFFFF", "White"]]],
  ["Zara", "zara", "fashion", "zara.com", [["#000000", "Black"]]],
  ["H&M", "hm", "fashion", "hm.com", [["#E50010", "H&M Red"], ["#FFFFFF", "White"]]],
  ["Uniqlo", "uniqlo", "fashion", "uniqlo.com", [["#FF0000", "Uniqlo Red"], ["#FFFFFF", "White"]]],
  ["Gap", "gap", "fashion", "gap.com", [["#002D72", "Gap Blue"], ["#FFFFFF", "White"]]],
  ["Shein", "shein", "fashion", "shein.com", [["#000000", "Black"]]],
  ["The North Face", "the-north-face", "fashion", "thenorthface.com", [["#DA291C", "Summit Red"], ["#000000", "Black"]]],
  ["Patagonia", "patagonia", "fashion", "patagonia.com", [["#005596", "Fitz Roy Blue"], ["#FF7F32", "Sunset Orange"]]],
  ["Levi's", "levis", "fashion", "levi.com", [["#C81E1E", "Red Tab"], ["#000000", "Black"]]],
  // Luxury
  ["Hermès", "hermes", "luxury", "hermes.com", [["#F37021", "Hermès Orange"], ["#000000", "Black"]]],
  ["Cartier", "cartier", "luxury", "cartier.com", [["#B01E24", "Cartier Red"], ["#000000", "Black"]]],
  ["Tiffany & Co.", "tiffany", "luxury", "tiffany.com", [["#81D8D0", "Tiffany Blue"], ["#000000", "Black"]]],
  ["Rolex", "rolex", "luxury", "rolex.com", [["#006039", "Rolex Green"], ["#A37E2C", "Gold"]]],
  ["Omega", "omega", "luxury", "omegawatches.com", [["#000000", "Black"], ["#C8102E", "Omega Red"]]],
  ["Pandora", "pandora", "luxury", "pandora.net", [["#000000", "Black"], ["#FF69B4", "Pink"]]],
  ["Swarovski", "swarovski", "luxury", "swarovski.com", [["#000000", "Black"], ["#B9C9D0", "Crystal"]]],
  ["Montblanc", "montblanc", "luxury", "montblanc.com", [["#000000", "Black"], ["#FFFFFF", "White Star"]]],
  // Automotive
  ["Toyota", "toyota", "automotive", "toyota.com", [["#EB0A1E", "Toyota Red"], ["#000000", "Black"]]],
  ["Mercedes-Benz", "mercedes-benz", "automotive", "mercedes-benz.com", [["#000000", "Black"], ["#999999", "Silver"]]],
  ["BMW", "bmw", "automotive", "bmw.com", [["#0166B1", "BMW Blue"], ["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Audi", "audi", "automotive", "audi.com", [["#000000", "Black"], ["#BB0A30", "Audi Red"]]],
  ["Volkswagen", "volkswagen", "automotive", "volkswagen.com", [["#001E50", "VW Blue"], ["#FFFFFF", "White"]]],
  ["Porsche", "porsche", "automotive", "porsche.com", [["#000000", "Black"], ["#D5001C", "Guards Red"], ["#B08D57", "Gold"]]],
  ["Ferrari", "ferrari", "automotive", "ferrari.com", [["#D40000", "Rosso Corsa"], ["#FFF200", "Giallo Modena"], ["#000000", "Black"]]],
  ["Lamborghini", "lamborghini", "automotive", "lamborghini.com", [["#000000", "Black"], ["#DDB321", "Bull Gold"]]],
  ["Bentley", "bentley", "automotive", "bentleymotors.com", [["#000000", "Black"], ["#8C7A5B", "Champagne"]]],
  ["Rolls-Royce", "rolls-royce", "automotive", "rolls-roycemotorcars.com", [["#000000", "Black"], ["#9A7B4F", "Spirit Gold"]]],
  ["Aston Martin", "aston-martin", "automotive", "astonmartin.com", [["#00665E", "Racing Green"], ["#000000", "Black"]]],
  ["McLaren", "mclaren", "automotive", "mclaren.com", [["#FF8700", "Papaya"], ["#000000", "Black"]]],
  ["Bugatti", "bugatti", "automotive", "bugatti.com", [["#E1000F", "Bugatti Red"], ["#000000", "Black"]]],
  ["Maserati", "maserati", "automotive", "maserati.com", [["#0C2340", "Maserati Blue"], ["#000000", "Black"]]],
  ["Jaguar", "jaguar", "automotive", "jaguar.com", [["#000000", "Black"], ["#9E1B32", "Jaguar Red"]]],
  ["Land Rover", "land-rover", "automotive", "landrover.com", [["#005A2B", "Land Rover Green"], ["#FFFFFF", "White"]]],
  ["Volvo", "volvo", "automotive", "volvocars.com", [["#003057", "Volvo Blue"], ["#000000", "Black"]]],
  ["Tesla", "tesla", "automotive", "tesla.com", [["#E31937", "Tesla Red"], ["#000000", "Black"]]],
  ["Ford", "ford", "automotive", "ford.com", [["#003478", "Ford Blue"], ["#FFFFFF", "White"]]],
  ["Chevrolet", "chevrolet", "automotive", "chevrolet.com", [["#CD9834", "Bowtie Gold"], ["#000000", "Black"]]],
  ["Jeep", "jeep", "automotive", "jeep.com", [["#000000", "Black"], ["#4B5B2A", "Trail Green"]]],
  ["Honda", "honda", "automotive", "honda.com", [["#E40521", "Honda Red"], ["#000000", "Black"]]],
  ["Hyundai", "hyundai", "automotive", "hyundai.com", [["#002C5F", "Hyundai Blue"], ["#000000", "Black"]]],
  ["Kia", "kia", "automotive", "kia.com", [["#000000", "Black"], ["#BB162B", "Kia Red"]]],
  ["Mazda", "mazda", "automotive", "mazda.com", [["#910A2D", "Soul Red"], ["#101010", "Black"]]],
  ["Lexus", "lexus", "automotive", "lexus.com", [["#000000", "Black"], ["#B0B7BC", "Silver"]]],
  ["BYD", "byd", "automotive", "byd.com", [["#000000", "Black"], ["#E60012", "BYD Red"]]],
  ["Harley-Davidson", "harley-davidson", "automotive", "harley-davidson.com", [["#F98406", "Harley Orange"], ["#000000", "Black"]]],
  ["Ducati", "ducati", "automotive", "ducati.com", [["#CC0000", "Ducati Red"], ["#000000", "Black"]]],
  ["Yamaha", "yamaha", "automotive", "yamaha-motor.com", [["#0033A0", "Yamaha Blue"], ["#000000", "Black"]]],
  // Food & beverages
  ["Coca-Cola", "coca-cola", "food", "coca-cola.com", [["#F40009", "Coke Red"], ["#FFFFFF", "White"]], "https://www.coca-colacompany.com/about-us/history"],
  ["Pepsi", "pepsi", "food", "pepsi.com", [["#0065C3", "Pepsi Blue"], ["#E32934", "Pepsi Red"], ["#FFFFFF", "White"]]],
  ["Red Bull", "red-bull", "food", "redbull.com", [["#001E5A", "Navy"], ["#DB0A40", "Red"], ["#FFC906", "Yellow"]]],
  ["Monster Energy", "monster-energy", "food", "monsterenergy.com", [["#000000", "Black"], ["#95D600", "Claw Green"]]],
  ["Sprite", "sprite", "food", "sprite.com", [["#008B47", "Sprite Green"], ["#009BDF", "Blue"]]],
  ["Fanta", "fanta", "food", "fanta.com", [["#FF6309", "Fanta Orange"], ["#1B48AB", "Blue"]]],
  ["Starbucks", "starbucks", "food", "starbucks.com", [["#00704A", "Starbucks Green"], ["#000000", "Black"], ["#D4E9E2", "Mint"]], "https://creative.starbucks.com/color/"],
  ["Dunkin'", "dunkin", "food", "dunkindonuts.com", [["#FF671F", "Orange"], ["#DA1884", "Pink"]]],
  ["McDonald's", "mcdonalds", "food", "mcdonalds.com", [["#FFC72C", "Golden Yellow"], ["#DA291C", "Red"]]],
  ["Burger King", "burger-king", "food", "bk.com", [["#D62300", "Flame Red"], ["#FAAF18", "Bun Orange"], ["#F5EBDC", "Cream"]]],
  ["KFC", "kfc", "food", "kfc.com", [["#E4002B", "KFC Red"], ["#FFFFFF", "White"], ["#000000", "Black"]]],
  ["Subway", "subway", "food", "subway.com", [["#008C15", "Subway Green"], ["#FFC600", "Yellow"]]],
  ["Domino's", "dominos", "food", "dominos.com", [["#006491", "Domino's Blue"], ["#E31837", "Red"]]],
  ["Pizza Hut", "pizza-hut", "food", "pizzahut.com", [["#EE3A43", "Pizza Hut Red"], ["#000000", "Black"]]],
  ["Nestlé", "nestle", "food", "nestle.com", [["#000000", "Black"], ["#009FE3", "Nestlé Blue"]]],
  ["Cadbury", "cadbury", "food", "cadbury.co.uk", [["#460073", "Cadbury Purple"], ["#FFFFFF", "White"]]],
  ["Oreo", "oreo", "food", "oreo.com", [["#0057B8", "Oreo Blue"], ["#FFFFFF", "White"]]],
  ["KitKat", "kitkat", "food", "kitkat.com", [["#D3001F", "KitKat Red"], ["#FFFFFF", "White"]]],
  ["Ferrero Rocher", "ferrero-rocher", "food", "ferrero.com", [["#7B5B29", "Golden Brown"], ["#D4AF37", "Gold Foil"]]],
  ["Nutella", "nutella", "food", "nutella.com", [["#E30613", "Nutella Red"], ["#000000", "Black"]]],
  ["Hershey's", "hersheys", "food", "hersheys.com", [["#5D2E0F", "Chocolate Brown"], ["#FFFFFF", "White"]]],
  ["M&M's", "mms", "food", "mms.com", [["#000000", "Black"], ["#FFD200", "Yellow"], ["#E2231A", "Red"]]],
  ["Snickers", "snickers", "food", "snickers.com", [["#4B2C20", "Chocolate"], ["#003DA5", "Blue"], ["#FFFFFF", "White"]]],
  ["Pringles", "pringles", "food", "pringles.com", [["#E31837", "Pringles Red"], ["#000000", "Black"]]],
  ["Lay's", "lays", "food", "lays.com", [["#FFC627", "Lay's Yellow"], ["#E31837", "Red"]]],
  ["Doritos", "doritos", "food", "doritos.com", [["#F95602", "Nacho Orange"], ["#E31837", "Red"], ["#000000", "Black"]]],
  // Beauty
  ["L'Oréal", "loreal", "beauty", "loreal.com", [["#000000", "Black"], ["#E31837", "Red"]]],
  ["Maybelline", "maybelline", "beauty", "maybelline.com", [["#000000", "Black"], ["#E31837", "Red"]]],
  ["Garnier", "garnier", "beauty", "garnier.com", [["#007A33", "Garnier Green"], ["#A6CE39", "Light Green"]]],
  ["MAC Cosmetics", "mac-cosmetics", "beauty", "maccosmetics.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Estée Lauder", "estee-lauder", "beauty", "esteelauder.com", [["#1C3F94", "Estée Blue"], ["#000000", "Black"]]],
  ["Clinique", "clinique", "beauty", "clinique.com", [["#8AB82B", "Clinique Green"], ["#000000", "Black"]]],
  ["CeraVe", "cerave", "beauty", "cerave.com", [["#005EB8", "CeraVe Blue"], ["#78BE20", "Green"]]],
  ["Neutrogena", "neutrogena", "beauty", "neutrogena.com", [["#003087", "Neutrogena Blue"], ["#FFFFFF", "White"]]],
  ["Dove", "dove", "beauty", "dove.com", [["#0047BB", "Dove Blue"], ["#C8A96A", "Gold"]]],
  ["Nivea", "nivea", "beauty", "nivea.com", [["#0033A0", "Nivea Blue"], ["#FFFFFF", "White"]]],
  ["Fenty Beauty", "fenty-beauty", "beauty", "fentybeauty.com", [["#000000", "Black"], ["#F5E6DA", "Soft Beige"]]],
  ["Sephora", "sephora", "beauty", "sephora.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Gillette", "gillette", "beauty", "gillette.com", [["#003087", "Gillette Blue"], ["#FFFFFF", "White"]]],
  ["Oral-B", "oral-b", "beauty", "oralb.com", [["#002F6C", "Oral-B Blue"], ["#00A9E0", "Light Blue"]]],
  // Sports & outdoor
  ["Wilson", "wilson", "sports", "wilson.com", [["#E1251B", "Wilson Red"], ["#000000", "Black"]]],
  ["Oakley", "oakley", "sports", "oakley.com", [["#000000", "Black"], ["#8A8D8F", "Gray"]]],
  ["Ray-Ban", "ray-ban", "sports", "ray-ban.com", [["#E4002B", "Ray-Ban Red"], ["#000000", "Black"]]],
  ["Speedo", "speedo", "sports", "speedo.com", [["#00447C", "Speedo Blue"], ["#FFFFFF", "White"]]],
  ["Garmin", "garmin", "sports", "garmin.com", [["#007CC3", "Garmin Blue"], ["#000000", "Black"]]],
  ["Peloton", "peloton", "sports", "onepeloton.com", [["#000000", "Black"], ["#FF3346", "Red"]]],
  ["Coleman", "coleman", "sports", "coleman.com", [["#00583D", "Coleman Green"], ["#FFFFFF", "White"]]],
  ["Shimano", "shimano", "sports", "shimano.com", [["#0067B9", "Shimano Blue"], ["#000000", "Black"]]],
  ["Trek", "trek", "sports", "trekbikes.com", [["#000000", "Black"], ["#E31837", "Red"]]],
  ["Specialized", "specialized", "sports", "specialized.com", [["#ED1C24", "Specialized Red"], ["#000000", "Black"]]],
  // Home & lifestyle
  ["IKEA", "ikea", "home", "ikea.com", [["#0058A3", "IKEA Blue"], ["#FFDA1A", "IKEA Yellow"]]],
  ["Home Depot", "home-depot", "home", "homedepot.com", [["#F96302", "Depot Orange"], ["#FFFFFF", "White"]]],
  ["Dyson", "dyson", "home", "dyson.com", [["#000000", "Black"], ["#E31837", "Red"]]],
  ["Bosch", "bosch", "home", "bosch.com", [["#E20015", "Bosch Red"], ["#005691", "Blue"]]],
  ["KitchenAid", "kitchenaid", "home", "kitchenaid.com", [["#C8102E", "KitchenAid Red"], ["#000000", "Black"]]],
  ["Nespresso", "nespresso", "home", "nespresso.com", [["#000000", "Black"], ["#8E7248", "Gold"]]],
  ["Le Creuset", "le-creuset", "home", "lecreuset.com", [["#FF5A00", "Flame Orange"], ["#000000", "Black"]]],
  ["YETI", "yeti", "home", "yeti.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  // Finance
  ["Visa", "visa", "finance", "visa.com", [["#1A1F71", "Visa Blue"], ["#F7B600", "Gold"]]],
  ["Mastercard", "mastercard", "finance", "mastercard.com", [["#EB001B", "Red"], ["#F79E1B", "Yellow"], ["#FF5F00", "Orange"]]],
  ["American Express", "american-express", "finance", "americanexpress.com", [["#006FCF", "Amex Blue"], ["#FFFFFF", "White"]]],
  ["PayPal", "paypal", "finance", "paypal.com", [["#003087", "Dark Blue"], ["#009CDE", "Light Blue"]]],
  ["Stripe", "stripe", "finance", "stripe.com", [["#635BFF", "Stripe Purple"], ["#0A2540", "Navy"]]],
  ["Wise", "wise", "finance", "wise.com", [["#9FE870", "Wise Green"], ["#163300", "Dark Green"]]],
  ["Revolut", "revolut", "finance", "revolut.com", [["#000000", "Black"], ["#0666EB", "Blue"]]],
  ["Klarna", "klarna", "finance", "klarna.com", [["#FFB3C7", "Klarna Pink"], ["#000000", "Black"]]],
  ["JPMorgan Chase", "jpmorgan-chase", "finance", "jpmorganchase.com", [["#000000", "Black"], ["#1F5AC8", "Chase Blue"]]],
  ["Goldman Sachs", "goldman-sachs", "finance", "goldmansachs.com", [["#7399C6", "Goldman Blue"], ["#002D72", "Navy"]]],
  ["HSBC", "hsbc", "finance", "hsbc.com", [["#DB0011", "HSBC Red"], ["#FFFFFF", "White"]]],
  ["Barclays", "barclays", "finance", "barclays.com", [["#00AEEF", "Barclays Blue"], ["#00395D", "Navy"]]],
  ["Citibank", "citibank", "finance", "citibank.com", [["#003B70", "Citi Blue"], ["#ED1C24", "Red Arc"]]],
  ["Deloitte", "deloitte", "finance", "deloitte.com", [["#86BC25", "Deloitte Green"], ["#000000", "Black"]]],
  ["PwC", "pwc", "finance", "pwc.com", [["#E0301E", "Orange Red"], ["#FFB600", "Yellow"], ["#602320", "Maroon"]]],
  ["EY", "ey", "finance", "ey.com", [["#FFE600", "EY Yellow"], ["#2E2E38", "Charcoal"]]],
  ["KPMG", "kpmg", "finance", "kpmg.com", [["#00338D", "KPMG Blue"], ["#0091DA", "Light Blue"]]],
  ["Accenture", "accenture", "finance", "accenture.com", [["#A100FF", "Accenture Purple"], ["#000000", "Black"]]],
  ["McKinsey & Company", "mckinsey", "finance", "mckinsey.com", [["#051C2C", "Deep Navy"], ["#2251FF", "Electric Blue"]]],
  ["Intuit", "intuit", "finance", "intuit.com", [["#236CFF", "Intuit Blue"], ["#000000", "Black"]]],
  ["Xero", "xero", "finance", "xero.com", [["#13B5EA", "Xero Blue"], ["#000000", "Black"]]],
  // Entertainment, travel, retail & media
  ["Disney", "disney", "entertainment", "disney.com", [["#000000", "Black"], ["#006E99", "Disney Blue"]]],
  ["Netflix", "netflix", "entertainment", "netflix.com", [["#E50914", "Netflix Red"], ["#000000", "Black"]]],
  ["Amazon Prime Video", "amazon-prime-video", "entertainment", "primevideo.com", [["#00A8E1", "Prime Blue"], ["#000000", "Black"]]],
  ["HBO", "hbo", "entertainment", "hbo.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Warner Bros.", "warner-bros", "entertainment", "warnerbros.com", [["#00498A", "Shield Blue"], ["#FDB913", "Gold"]]],
  ["Pixar", "pixar", "entertainment", "pixar.com", [["#000000", "Black"], ["#0090DA", "Luxo Blue"]]],
  ["Marvel", "marvel", "entertainment", "marvel.com", [["#ED1D24", "Marvel Red"], ["#FFFFFF", "White"]]],
  ["Lucasfilm", "lucasfilm", "entertainment", "lucasfilm.com", [["#000000", "Black"], ["#2F7D32", "Green"]]],
  ["BBC", "bbc", "entertainment", "bbc.com", [["#000000", "Black"], ["#B22838", "BBC Red"]]],
  ["CNN", "cnn", "entertainment", "cnn.com", [["#CC0000", "CNN Red"], ["#FFFFFF", "White"]]],
  ["National Geographic", "national-geographic", "entertainment", "nationalgeographic.com", [["#FFCC00", "Border Yellow"], ["#000000", "Black"]]],
  ["MTV", "mtv", "entertainment", "mtv.com", [["#000000", "Black"], ["#FF0080", "Pink"], ["#FFDD00", "Yellow"]]],
  ["ESPN", "espn", "entertainment", "espn.com", [["#E1251B", "ESPN Red"], ["#000000", "Black"]]],
  ["Spotify", "spotify", "entertainment", "spotify.com", [["#1DB954", "Spotify Green"], ["#191414", "Black"]], "https://newsroom.spotify.com/media-kit/"],
  ["YouTube", "youtube", "entertainment", "youtube.com", [["#FF0000", "YouTube Red"], ["#282828", "Almost Black"]], "https://www.youtube.com/howyoutubeworks/resources/brand-resources/"],
  ["TikTok", "tiktok", "entertainment", "tiktok.com", [["#000000", "Black"], ["#25F4EE", "Cyan"], ["#FE2C55", "Red"]]],
  ["Instagram", "instagram", "entertainment", "instagram.com", [["#833AB4", "Purple"], ["#E1306C", "Pink"], ["#F77737", "Orange"]]],
  ["Facebook", "facebook", "entertainment", "facebook.com", [["#1877F2", "Facebook Blue"], ["#FFFFFF", "White"]]],
  ["Snapchat", "snapchat", "entertainment", "snapchat.com", [["#FFFC00", "Snap Yellow"], ["#000000", "Black"]]],
  ["Pinterest", "pinterest", "entertainment", "pinterest.com", [["#E60023", "Pinterest Red"], ["#FFFFFF", "White"]]],
  ["Reddit", "reddit", "entertainment", "reddit.com", [["#FF4500", "OrangeRed"], ["#000000", "Black"]]],
  ["X", "x", "entertainment", "x.com", [["#000000", "Black"], ["#FFFFFF", "White"]]],
  ["Twitch", "twitch", "entertainment", "twitch.tv", [["#9146FF", "Twitch Purple"], ["#000000", "Black"]]],
  ["Discord", "discord", "entertainment", "discord.com", [["#5865F2", "Blurple"], ["#000000", "Black"]]],
  ["Roblox", "roblox", "entertainment", "roblox.com", [["#000000", "Black"], ["#E2231A", "Red"]]],
  ["Epic Games", "epic-games", "entertainment", "epicgames.com", [["#000000", "Black"], ["#2F2D2E", "Charcoal"]]],
  ["Airbnb", "airbnb", "entertainment", "airbnb.com", [["#FF5A5F", "Rausch"], ["#00A699", "Teal"], ["#484848", "Gray"]]],
  ["Booking.com", "booking", "entertainment", "booking.com", [["#003580", "Booking Blue"], ["#009ADF", "Light Blue"]]],
  ["Expedia", "expedia", "entertainment", "expedia.com", [["#00355F", "Expedia Navy"], ["#FAC762", "Yellow"]]],
  ["Marriott", "marriott", "entertainment", "marriott.com", [["#000000", "Black"], ["#A6192E", "Marriott Red"]]],
  ["Hilton", "hilton", "entertainment", "hilton.com", [["#000000", "Black"], ["#104C97", "Hilton Blue"]]],
  ["Emirates", "emirates", "entertainment", "emirates.com", [["#D71920", "Emirates Red"], ["#000000", "Black"]]],
  ["Qatar Airways", "qatar-airways", "entertainment", "qatarairways.com", [["#5C0632", "Burgundy"], ["#8D1B3D", "Oryx Maroon"]]],
  ["FedEx", "fedex", "entertainment", "fedex.com", [["#4D148C", "FedEx Purple"], ["#FF6600", "FedEx Orange"]]],
  ["DHL", "dhl", "entertainment", "dhl.com", [["#FFCC00", "DHL Yellow"], ["#D40511", "DHL Red"]]],
  ["UPS", "ups", "entertainment", "ups.com", [["#351C15", "Pullman Brown"], ["#FFB500", "Gold"]]],
  ["Walmart", "walmart", "entertainment", "walmart.com", [["#0071CE", "Walmart Blue"], ["#FFC220", "Spark Yellow"]]],
  ["Costco", "costco", "entertainment", "costco.com", [["#E31837", "Costco Red"], ["#005DAA", "Blue"]]],
  ["Target", "target", "entertainment", "target.com", [["#CC0000", "Target Red"], ["#FFFFFF", "White"]]],
  ["eBay", "ebay", "entertainment", "ebay.com", [["#E53238", "Red"], ["#0064D2", "Blue"], ["#F5AF02", "Yellow"], ["#86B817", "Green"]]],
];

export const BRANDS: Brand[] = ROWS.map(([name, slug, category, domain, colors, guidelines]) => ({
  name, slug, category, domain,
  colors: colors.map(([hex, colorName]) => ({ hex, name: colorName })),
  guidelines,
}));

const bySlug = new Map(BRANDS.map((b) => [b.slug, b]));
export const getBrand = (slug: string) => bySlug.get(slug);
export const brandPath = (b: Brand) => `/brand-colors/${b.slug}`;
export const relatedBrands = (b: Brand, n = 6) =>
  BRANDS.filter((x) => x.category === b.category && x.slug !== b.slug).slice(0, n);
export const categoryLabel = (id: CategoryId) => BRAND_CATEGORIES.find((c) => c.id === id)?.label ?? id;

const LOGO_DEV_KEY = () =>
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY) || "";

export function brandLogoUrl(domain: string, size = 256): string {
  const key = LOGO_DEV_KEY();
  return key ? `https://img.logo.dev/${domain}?token=${key}&size=${size}&format=png` : "";
}
