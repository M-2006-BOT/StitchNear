(() => {
const $ = (s) => document.querySelector(s), R = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (d) => new Date(d).toLocaleDateString(({ en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN' })[S.settings.language] || 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const CATS = ['Blouses', 'Kurtis', 'Dresses', 'Shirts', 'Ethnic Wear', 'Alterations'];
const ICON = { Blouses: ['👚', '#f5d5dc'], Kurtis: ['👘', '#f3e0c8'], Dresses: ['👗', '#e4d9f0'], Shirts: ['👔', '#d6e4ef'], 'Ethnic Wear': ['🥻', '#f2d6c4'], Alterations: ['🪡', '#dfe9d9'] };
const FABS = { Cotton: 0, Linen: 150, Georgette: 250, Silk: 600 };
const COLORS = [
  ['Black', '#171717'], ['White', '#ffffff'], ['Ivory', '#fff1d2'], ['Beige', '#c8a77a'],
  ['Brown', '#704214'], ['Red', '#d62828'], ['Maroon', '#800000'], ['Pink', '#ff69b4'],
  ['Orange', '#f28c28'], ['Yellow', '#f4d03f'], ['Green', '#228b22'], ['Olive', '#708238'],
  ['Teal', '#008080'], ['Blue', '#2563eb'], ['Navy', '#172554'], ['Purple', '#7e22ce'],
  ['Grey', '#808080']
];
const LBL = { pending: 'Order placed', accepted: 'Tailor accepted', pickup_collected: 'Fabric and measurements collected at home', stitching: 'Stitching',
  quality_check: 'Quality check', ready: 'Ready', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', declined: 'Declined by the tailor' };
const ST = ['pending', 'accepted', 'pickup_collected', 'stitching', 'quality_check', 'ready', 'out_for_delivery', 'delivered'];
const AV = { accepting: 'Accepting', paused: 'Paused', full: 'Fully booked' };
const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam' };
const T = {
  hi: { Collection: 'संग्रह', Tailors: 'दर्जी', 'My orders': 'मेरे ऑर्डर', 'My account': 'मेरा खाता', Messages: 'संदेश', Settings: 'सेटिंग्स', 'Sign in': 'साइन इन', 'Sign out': 'साइन आउट', 'Tailor dashboard': 'दर्जी डैशबोर्ड', 'Admin': 'एडमिन', 'My settings': 'मेरी सेटिंग्स', Theme: 'थीम', Language: 'भाषा', Save: 'सहेजें', 'Save settings': 'सेटिंग्स सहेजें', 'Account information': 'खाता जानकारी', Name: 'नाम', Email: 'ईमेल', Phone: 'फ़ोन', Password: 'पासवर्ड', 'Current password': 'वर्तमान पासवर्ड', 'New password': 'नया पासवर्ड', 'Update password': 'पासवर्ड अपडेट करें', 'Create account': 'खाता बनाएं', 'I am a customer': 'मैं ग्राहक हूँ', 'I am a tailor': 'मैं दर्जी हूँ', 'My garments': 'मेरे परिधान', 'Add garment': 'परिधान जोड़ें', 'Garment name': 'परिधान का नाम', Category: 'श्रेणी', Price: 'कीमत', 'Stitching days': 'सिलाई के दिन', 'Delivery days': 'डिलीवरी के दिन', 'Delivery charge': 'डिलीवरी शुल्क', Description: 'विवरण', 'Image URL (HTTPS)': 'छवि URL (HTTPS)', 'Save garment': 'परिधान सहेजें', 'Contact tailor': 'दर्जी से संपर्क करें', 'Ask about stitching': 'सिलाई के बारे में पूछें', 'Send message': 'संदेश भेजें', 'Attach cloth photo': 'कपड़े की तस्वीर जोड़ें', 'Type your message': 'अपना संदेश लिखें', 'No garments yet.': 'अभी कोई परिधान नहीं है।', 'No conversations yet.': 'अभी कोई बातचीत नहीं है।', 'Open conversation': 'बातचीत खोलें', 'System default': 'सिस्टम डिफ़ॉल्ट', Light: 'हल्का', Dark: 'गहरा', 'Browse garments': 'परिधान देखें', 'View tailor page': 'दर्जी का पेज देखें', 'Delivery charge': 'डिलीवरी शुल्क', 'Only customers can start a conversation': 'केवल ग्राहक बातचीत शुरू कर सकते हैं' },
  ta: { Collection: 'தொகுப்பு', Tailors: 'தையல்காரர்கள்', 'My orders': 'என் ஆர்டர்கள்', 'My account': 'என் கணக்கு', Messages: 'செய்திகள்', Settings: 'அமைப்புகள்', 'Sign in': 'உள்நுழை', 'Sign out': 'வெளியேறு', 'Tailor dashboard': 'தையல்காரர் பலகை', Admin: 'நிர்வாகி', 'My settings': 'என் அமைப்புகள்', Theme: 'தீம்', Language: 'மொழி', Save: 'சேமி', 'Save settings': 'அமைப்புகளைச் சேமி', 'Account information': 'கணக்கு தகவல்', Name: 'பெயர்', Email: 'மின்னஞ்சல்', Phone: 'தொலைபேசி', Password: 'கடவுச்சொல்', 'Current password': 'தற்போதைய கடவுச்சொல்', 'New password': 'புதிய கடவுச்சொல்', 'Update password': 'கடவுச்சொல்லைப் புதுப்பி', 'Create account': 'கணக்கை உருவாக்கு', 'I am a customer': 'நான் வாடிக்கையாளர்', 'I am a tailor': 'நான் தையல்காரர்', 'My garments': 'என் ஆடைகள்', 'Add garment': 'ஆடை சேர்க்க', 'Garment name': 'ஆடை பெயர்', Category: 'வகை', Price: 'விலை', 'Stitching days': 'தையல் நாட்கள்', 'Delivery days': 'விநியோக நாட்கள்', 'Delivery charge': 'விநியோகக் கட்டணம்', Description: 'விளக்கம்', 'Image URL (HTTPS)': 'பட URL (HTTPS)', 'Save garment': 'ஆடையைச் சேமி', 'Contact tailor': 'தையல்காரரைத் தொடர்புகொள்', 'Ask about stitching': 'தையல் பற்றி கேள்', 'Send message': 'செய்தி அனுப்பு', 'Attach cloth photo': 'துணிப் படத்தை இணை', 'Type your message': 'உங்கள் செய்தியை உள்ளிடவும்', 'No garments yet.': 'இன்னும் ஆடைகள் இல்லை.', 'No conversations yet.': 'இன்னும் உரையாடல்கள் இல்லை.', 'Open conversation': 'உரையாடலைத் திற', 'System default': 'கணினி இயல்புநிலை', Light: 'ஒளி', Dark: 'இருள்', 'Browse garments': 'ஆடைகளைப் பார்க்க', 'View tailor page': 'தையல்காரர் பக்கத்தைப் பார்க்க' },
  te: { Collection: 'సేకరణ', Tailors: 'దర్జీలు', 'My orders': 'నా ఆర్డర్లు', 'My account': 'నా ఖాతా', Messages: 'సందేశాలు', Settings: 'సెట్టింగ్‌లు', 'Sign in': 'సైన్ ఇన్', 'Sign out': 'సైన్ అవుట్', 'Tailor dashboard': 'దర్జీ డాష్‌బోర్డ్', Admin: 'అడ్మిన్', 'My settings': 'నా సెట్టింగ్‌లు', Theme: 'థీమ్', Language: 'భాష', Save: 'సేవ్ చేయి', 'Save settings': 'సెట్టింగ్‌లను సేవ్ చేయి', 'Account information': 'ఖాతా సమాచారం', Name: 'పేరు', Email: 'ఇమెయిల్', Phone: 'ఫోన్', Password: 'పాస్‌వర్డ్', 'Current password': 'ప్రస్తుత పాస్‌వర్డ్', 'New password': 'కొత్త పాస్‌వర్డ్', 'Update password': 'పాస్‌వర్డ్‌ను అప్‌డేట్ చేయి', 'Create account': 'ఖాతాను సృష్టించు', 'I am a customer': 'నేను కస్టమర్‌ను', 'I am a tailor': 'నేను దర్జీని', 'My garments': 'నా దుస్తులు', 'Add garment': 'దుస్తును జోడించు', 'Garment name': 'దుస్తు పేరు', Category: 'వర్గం', Price: 'ధర', 'Stitching days': 'కుట్టు రోజులు', 'Delivery days': 'డెలివరీ రోజులు', 'Delivery charge': 'డెలివరీ ఛార్జీ', Description: 'వివరణ', 'Image URL (HTTPS)': 'చిత్ర URL (HTTPS)', 'Save garment': 'దుస్తును సేవ్ చేయి', 'Contact tailor': 'దర్జీని సంప్రదించండి', 'Ask about stitching': 'కుట్టు గురించి అడగండి', 'Send message': 'సందేశం పంపండి', 'Attach cloth photo': 'వస్త్రం ఫోటోను జోడించండి', 'Type your message': 'మీ సందేశాన్ని టైప్ చేయండి', 'No garments yet.': 'ఇంకా దుస్తులు లేవు.', 'No conversations yet.': 'ఇంకా సంభాషణలు లేవు.', 'Open conversation': 'సంభాషణను తెరవండి', 'System default': 'సిస్టమ్ డిఫాల్ట్', Light: 'లైట్', Dark: 'డార్క్', 'Browse garments': 'దుస్తులను చూడండి', 'View tailor page': 'దర్జీ పేజీని చూడండి' },
  ml: { Collection: 'ശേഖരം', Tailors: 'തയ്യൽക്കാർ', 'My orders': 'എന്റെ ഓർഡറുകൾ', 'My account': 'എന്റെ അക്കൗണ്ട്', Messages: 'സന്ദേശങ്ങൾ', Settings: 'ക്രമീകരണങ്ങൾ', 'Sign in': 'സൈൻ ഇൻ', 'Sign out': 'സൈൻ ഔട്ട്', 'Tailor dashboard': 'തയ്യൽക്കാരന്റെ ഡാഷ്ബോർഡ്', Admin: 'അഡ്മിൻ', 'My settings': 'എന്റെ ക്രമീകരണങ്ങൾ', Theme: 'തീം', Language: 'ഭാഷ', Save: 'സേവ് ചെയ്യുക', 'Save settings': 'ക്രമീകരണങ്ങൾ സേവ് ചെയ്യുക', 'Account information': 'അക്കൗണ്ട് വിവരങ്ങൾ', Name: 'പേര്', Email: 'ഇമെയിൽ', Phone: 'ഫോൺ', Password: 'പാസ്‌വേഡ്', 'Current password': 'നിലവിലെ പാസ്‌വേഡ്', 'New password': 'പുതിയ പാസ്‌വേഡ്', 'Update password': 'പാസ്‌വേഡ് പുതുക്കുക', 'Create account': 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', 'I am a customer': 'ഞാൻ ഉപഭോക്താവാണ്', 'I am a tailor': 'ഞാൻ തയ്യൽക്കാരനാണ്', 'My garments': 'എന്റെ വസ്ത്രങ്ങൾ', 'Add garment': 'വസ്ത്രം ചേർക്കുക', 'Garment name': 'വസ്ത്രത്തിന്റെ പേര്', Category: 'വിഭാഗം', Price: 'വില', 'Stitching days': 'തയ്യൽ ദിവസങ്ങൾ', 'Delivery days': 'ഡെലിവറി ദിവസങ്ങൾ', 'Delivery charge': 'ഡെലിവറി ചാർജ്', Description: 'വിവരണം', 'Image URL (HTTPS)': 'ചിത്ര URL (HTTPS)', 'Save garment': 'വസ്ത്രം സേവ് ചെയ്യുക', 'Contact tailor': 'തയ്യൽക്കാരനെ ബന്ധപ്പെടുക', 'Ask about stitching': 'തയ്യലിനെക്കുറിച്ച് ചോദിക്കുക', 'Send message': 'സന്ദേശം അയയ്ക്കുക', 'Attach cloth photo': 'തുണിയുടെ ചിത്രം ചേർക്കുക', 'Type your message': 'സന്ദേശം ടൈപ്പ് ചെയ്യുക', 'No garments yet.': 'ഇതുവരെ വസ്ത്രങ്ങളില്ല.', 'No conversations yet.': 'ഇതുവരെ സംഭാഷണങ്ങളില്ല.', 'Open conversation': 'സംഭാഷണം തുറക്കുക', 'System default': 'സിസ്റ്റം ഡിഫോൾട്ട്', Light: 'ലൈറ്റ്', Dark: 'ഡാർക്ക്', 'Browse garments': 'വസ്ത്രങ്ങൾ കാണുക', 'View tailor page': 'തയ്യൽക്കാരന്റെ പേജ് കാണുക' }
};
Object.assign(T.hi, { Account: 'खाता', 'App appearance': 'ऐप का रूप', 'Save account information': 'खाता जानकारी सहेजें', 'Sign in to see and update your account information.': 'अपनी खाता जानकारी देखने और बदलने के लिए साइन इन करें।', 'Signed in as ': 'साइन इन किया है: ', 'Save shopping preferences': 'खरीदारी प्राथमिकताएँ सहेजें', 'Save communication preferences': 'संचार प्राथमिकताएँ सहेजें', 'Made just for you': 'सिर्फ़ आपके लिए', 'Your style. Your fit. Your tailor.': 'आपकी शैली। आपकी फिटिंग। आपका दर्जी।', 'Pick a design, compare trusted local tailors on price and delivery date, and get it stitched and delivered home.': 'डिज़ाइन चुनें, स्थानीय दर्जियों की कीमत और डिलीवरी समय की तुलना करें और घर पर सिलवाकर मंगवाएँ।', 'Tailors near you': 'आपके पास के दर्जी', 'Garments by ': 'के परिधान: ', 'Account details & security': 'खाता विवरण और सुरक्षा', 'Saved addresses': 'सहेजे गए पते', 'Size profile': 'साइज़ प्रोफ़ाइल', 'Communications & alerts': 'संचार और अलर्ट', 'Wishlist / saved items': 'इच्छा-सूची / सहेजे गए आइटम', 'Help & customer care': 'सहायता और ग्राहक सेवा', 'Delivery address': 'डिलीवरी पता', 'Delivery and confirmation': 'डिलीवरी और पुष्टि', 'No orders yet. Pick a design to start.': 'अभी कोई ऑर्डर नहीं है। शुरू करने के लिए डिज़ाइन चुनें।', 'Orders': 'ऑर्डर', 'Tailor profile': 'दर्जी प्रोफ़ाइल', 'Remove listing': 'लिस्टिंग हटाएँ', 'Message tailor': 'दर्जी को संदेश भेजें', 'Photo ready to send (JPEG, max 350 KB).': 'तस्वीर भेजने के लिए तैयार है (JPEG, अधिकतम 350 KB)।' });
Object.assign(T.ta, { Account: 'கணக்கு', 'App appearance': 'செயலி தோற்றம்', 'Save account information': 'கணக்கு தகவலைச் சேமி', 'Sign in to see and update your account information.': 'கணக்கு தகவலைப் பார்க்கவும் புதுப்பிக்கவும் உள்நுழையவும்.', 'Signed in as ': 'உள்நுழைந்தவர்: ', 'Save shopping preferences': 'ஷாப்பிங் விருப்பங்களைச் சேமி', 'Save communication preferences': 'தொடர்பு விருப்பங்களைச் சேமி', 'Made just for you': 'உங்களுக்காகவே', 'Your style. Your fit. Your tailor.': 'உங்கள் பாணி. உங்கள் அளவு. உங்கள் தையல்காரர்.', 'Pick a design, compare trusted local tailors on price and delivery date, and get it stitched and delivered home.': 'வடிவத்தைத் தேர்ந்தெடுத்து, உள்ளூர் தையல்காரர்களின் விலை மற்றும் விநியோக நாளை ஒப்பிட்டு, வீட்டிலேயே தைத்துப் பெறுங்கள்.', 'Tailors near you': 'உங்களுக்கு அருகிலுள்ள தையல்காரர்கள்', 'Garments by ': 'இவரின் ஆடைகள்: ', 'Account details & security': 'கணக்கு விவரங்கள் மற்றும் பாதுகாப்பு', 'Saved addresses': 'சேமித்த முகவரிகள்', 'Size profile': 'அளவு விவரம்', 'Communications & alerts': 'தகவல் மற்றும் அறிவிப்புகள்', 'Wishlist / saved items': 'விருப்பப் பட்டியல் / சேமித்தவை', 'Help & customer care': 'உதவி மற்றும் வாடிக்கையாளர் சேவை', 'Delivery address': 'விநியோக முகவரி', 'Delivery and confirmation': 'விநியோகம் மற்றும் உறுதிப்படுத்தல்', 'No orders yet. Pick a design to start.': 'ஆர்டர்கள் இல்லை. தொடங்க ஒரு வடிவத்தைத் தேர்ந்தெடுக்கவும்.', Orders: 'ஆர்டர்கள்', 'Tailor profile': 'தையல்காரர் விவரம்', 'Remove listing': 'பட்டியலை நீக்கு', 'Message tailor': 'தையல்காரருக்கு செய்தி அனுப்பு', 'Photo ready to send (JPEG, max 350 KB).': 'புகைப்படம் அனுப்பத் தயார் (JPEG, அதிகபட்சம் 350 KB).' });
Object.assign(T.te, { Account: 'ఖాతా', 'App appearance': 'యాప్ రూపం', 'Save account information': 'ఖాతా సమాచారాన్ని సేవ్ చేయండి', 'Sign in to see and update your account information.': 'ఖాతా సమాచారాన్ని చూడటానికి, మార్చడానికి సైన్ ఇన్ చేయండి.', 'Signed in as ': 'సైన్ ఇన్ చేసినవారు: ', 'Save shopping preferences': 'షాపింగ్ అభిరుచులను సేవ్ చేయండి', 'Save communication preferences': 'సంప్రదింపు అభిరుచులను సేవ్ చేయండి', 'Made just for you': 'మీ కోసమే', 'Your style. Your fit. Your tailor.': 'మీ శైలి. మీ ఫిట్. మీ దర్జీ.', 'Pick a design, compare trusted local tailors on price and delivery date, and get it stitched and delivered home.': 'డిజైన్ ఎంచుకుని, స్థానిక దర్జీల ధరలు, డెలివరీ తేదీలను పోల్చి, కుట్టించి ఇంటికి తెప్పించుకోండి.', 'Tailors near you': 'మీ దగ్గరలోని దర్జీలు', 'Garments by ': 'వీరి దుస్తులు: ', 'Account details & security': 'ఖాతా వివరాలు మరియు భద్రత', 'Saved addresses': 'సేవ్ చేసిన చిరునామాలు', 'Size profile': 'సైజు ప్రొఫైల్', 'Communications & alerts': 'సందేశాలు మరియు అలర్ట్‌లు', 'Wishlist / saved items': 'విష్‌లిస్ట్ / సేవ్ చేసినవి', 'Help & customer care': 'సహాయం మరియు కస్టమర్ కేర్', 'Delivery address': 'డెలివరీ చిరునామా', 'Delivery and confirmation': 'డెలివరీ మరియు నిర్ధారణ', 'No orders yet. Pick a design to start.': 'ఆర్డర్లు లేవు. ప్రారంభించడానికి డిజైన్ ఎంచుకోండి.', Orders: 'ఆర్డర్లు', 'Tailor profile': 'దర్జీ ప్రొఫైల్', 'Remove listing': 'లిస్టింగ్ తొలగించండి', 'Message tailor': 'దర్జీకి సందేశం పంపండి', 'Photo ready to send (JPEG, max 350 KB).': 'ఫోటో పంపడానికి సిద్ధంగా ఉంది (JPEG, గరిష్ఠం 350 KB).' });
Object.assign(T.ml, { Account: 'അക്കൗണ്ട്', 'App appearance': 'ആപ്പിന്റെ രൂപം', 'Save account information': 'അക്കൗണ്ട് വിവരങ്ങൾ സേവ് ചെയ്യുക', 'Sign in to see and update your account information.': 'അക്കൗണ്ട് വിവരങ്ങൾ കാണാനും പുതുക്കാനും സൈൻ ഇൻ ചെയ്യുക.', 'Signed in as ': 'സൈൻ ഇൻ ചെയ്തത്: ', 'Save shopping preferences': 'ഷോപ്പിംഗ് മുൻഗണനകൾ സേവ് ചെയ്യുക', 'Save communication preferences': 'ആശയവിനിമയ മുൻഗണനകൾ സേവ് ചെയ്യുക', 'Made just for you': 'നിങ്ങൾക്കായി മാത്രം', 'Your style. Your fit. Your tailor.': 'നിങ്ങളുടെ ശൈലി. നിങ്ങളുടെ അളവ്. നിങ്ങളുടെ തയ്യൽക്കാരൻ.', 'Pick a design, compare trusted local tailors on price and delivery date, and get it stitched and delivered home.': 'ഡിസൈൻ തിരഞ്ഞെടുത്ത് പ്രാദേശിക തയ്യൽക്കാരുടെ വിലയും ഡെലിവറി സമയവും താരതമ്യം ചെയ്ത് തയ്പ്പിച്ച് വീട്ടിലെത്തിക്കൂ.', 'Tailors near you': 'നിങ്ങളുടെ സമീപത്തുള്ള തയ്യൽക്കാർ', 'Garments by ': 'ഇവരുടെ വസ്ത്രങ്ങൾ: ', 'Account details & security': 'അക്കൗണ്ട് വിവരങ്ങളും സുരക്ഷയും', 'Saved addresses': 'സേവ് ചെയ്ത വിലാസങ്ങൾ', 'Size profile': 'വലുപ്പ പ്രൊഫൈൽ', 'Communications & alerts': 'സന്ദേശങ്ങളും അലേർട്ടുകളും', 'Wishlist / saved items': 'ആഗ്രഹപ്പട്ടിക / സേവ് ചെയ്തവ', 'Help & customer care': 'സഹായവും കസ്റ്റമർ കെയറും', 'Delivery address': 'ഡെലിവറി വിലാസം', 'Delivery and confirmation': 'ഡെലിവറിയും സ്ഥിരീകരണവും', 'No orders yet. Pick a design to start.': 'ഓർഡറുകളില്ല. തുടങ്ങാൻ ഒരു ഡിസൈൻ തിരഞ്ഞെടുക്കൂ.', Orders: 'ഓർഡറുകൾ', 'Tailor profile': 'തയ്യൽക്കാരന്റെ പ്രൊഫൈൽ', 'Remove listing': 'ലിസ്റ്റിംഗ് നീക്കം ചെയ്യുക', 'Message tailor': 'തയ്യൽക്കാരന് സന്ദേശം അയയ്ക്കുക', 'Photo ready to send (JPEG, max 350 KB).': 'ഫോട്ടോ അയയ്ക്കാൻ തയ്യാറാണ് (JPEG, പരമാവധി 350 KB).' });
Object.assign(T.hi, { 'Who supplies the cloth?': 'कपड़ा कौन देगा?', 'Tailor supplies cloth': 'दर्जी कपड़ा देगा', 'I have my own cloth': 'मेरे पास अपना कपड़ा है', 'Cloth color': 'कपड़े का रंग', 'Photo of your cloth (optional, JPEG/PNG/WebP)': 'आपके कपड़े की तस्वीर (वैकल्पिक, JPEG/PNG/WebP)', 'Customer supplied': 'ग्राहक द्वारा दिया गया', 'Tailor supplied': 'दर्जी द्वारा दिया गया', Cloth: 'कपड़ा', 'The fabric surcharge is removed. Add a cloth photo so your tailor can review it.': 'कपड़े का अतिरिक्त शुल्क हटा दिया गया है। दर्जी की समीक्षा के लिए कपड़े की तस्वीर जोड़ें।', 'The selected fabric surcharge is included in the quote.': 'चुने हुए कपड़े का अतिरिक्त शुल्क कीमत में शामिल है।' });
Object.assign(T.ta, { 'Who supplies the cloth?': 'துணியை யார் வழங்குவார்கள்?', 'Tailor supplies cloth': 'தையல்காரர் துணி வழங்குவார்', 'I have my own cloth': 'என்னிடம் சொந்தத் துணி உள்ளது', 'Cloth color': 'துணியின் நிறம்', 'Photo of your cloth (optional, JPEG/PNG/WebP)': 'உங்கள் துணியின் புகைப்படம் (விருப்பம், JPEG/PNG/WebP)', 'Customer supplied': 'வாடிக்கையாளர் வழங்கியது', 'Tailor supplied': 'தையல்காரர் வழங்கியது', Cloth: 'துணி', 'The fabric surcharge is removed. Add a cloth photo so your tailor can review it.': 'துணிக் கூடுதல் கட்டணம் நீக்கப்பட்டது. தையல்காரர் பார்க்க துணிப் புகைப்படத்தைச் சேர்க்கவும்.', 'The selected fabric surcharge is included in the quote.': 'தேர்ந்தெடுத்த துணிக்கான கூடுதல் கட்டணம் விலையில் சேர்க்கப்பட்டுள்ளது.' });
Object.assign(T.te, { 'Who supplies the cloth?': 'వస్త్రాన్ని ఎవరు అందిస్తారు?', 'Tailor supplies cloth': 'దర్జీ వస్త్రాన్ని అందిస్తారు', 'I have my own cloth': 'నా దగ్గర సొంత వస్త్రం ఉంది', 'Cloth color': 'వస్త్రం రంగు', 'Photo of your cloth (optional, JPEG/PNG/WebP)': 'మీ వస్త్రం ఫోటో (ఐచ్ఛికం, JPEG/PNG/WebP)', 'Customer supplied': 'కస్టమర్ అందించినది', 'Tailor supplied': 'దర్జీ అందించినది', Cloth: 'వస్త్రం', 'The fabric surcharge is removed. Add a cloth photo so your tailor can review it.': 'వస్త్రం అదనపు ఛార్జీ తీసివేయబడింది. దర్జీ పరిశీలించడానికి ఫోటో జోడించండి.', 'The selected fabric surcharge is included in the quote.': 'ఎంచుకున్న వస్త్రం అదనపు ఛార్జీ ధరలో చేర్చబడింది.' });
Object.assign(T.ml, { 'Who supplies the cloth?': 'തുണി ആര് നൽകും?', 'Tailor supplies cloth': 'തയ്യൽക്കാരൻ തുണി നൽകും', 'I have my own cloth': 'എന്റെ കൈയിൽ സ്വന്തം തുണിയുണ്ട്', 'Cloth color': 'തുണിയുടെ നിറം', 'Photo of your cloth (optional, JPEG/PNG/WebP)': 'നിങ്ങളുടെ തുണിയുടെ ഫോട്ടോ (ഓപ്ഷണൽ, JPEG/PNG/WebP)', 'Customer supplied': 'ഉപഭോക്താവ് നൽകിയത്', 'Tailor supplied': 'തയ്യൽക്കാരൻ നൽകിയത്', Cloth: 'തുണി', 'The fabric surcharge is removed. Add a cloth photo so your tailor can review it.': 'തുണിയുടെ അധിക ചാർജ് ഒഴിവാക്കി. തയ്യൽക്കാരന് പരിശോധിക്കാൻ ഫോട്ടോ ചേർക്കുക.', 'The selected fabric surcharge is included in the quote.': 'തിരഞ്ഞെടുത്ത തുണിയുടെ അധിക ചാർജ് വിലയിൽ ഉൾപ്പെടുത്തിയിട്ടുണ്ട്.' });
function translateMarkup(html) {
  const dict = T[S.settings.language] || {};
  const template = document.createElement('template');
  template.innerHTML = html;
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    node.textContent = Object.entries(dict).sort((a, b) => b[0].length - a[0].length)
      .reduce((text, [from, to]) => text.replaceAll(from, to), node.textContent);
  }
  return template.innerHTML;
}
const NEXT = (o) => ({ pending: ['accepted', 'declined'], accepted: [o.pickup && o.pickup.requested ? 'pickup_collected' : 'stitching'], pickup_collected: ['stitching'],
  stitching: ['quality_check'], quality_check: ['stitching', 'ready'], ready: ['out_for_delivery'], out_for_delivery: ['delivered'] }[o.status] || []);
const localSettings = (() => { try { return JSON.parse(localStorage.getItem('sn-settings')) || {}; } catch { return {}; } })();
const defaultSettings = {
  theme: ['system', 'light', 'dark'].includes(localSettings.theme) ? localSettings.theme : 'light',
  language: Object.hasOwn(LANGUAGE_NAMES, localSettings.language) ? localSettings.language : 'en'
};
const S = { view: 'home', user: null, token: null, cat: 'All', designs: [], design: null, fabric: 'Cotton', fabricSource: 'tailor', fabricColor: '#5c2d25', clothPhoto: null, m: {}, notes: '', express: false, pickup: false, slot: '', sort: 'near',
  tid: null, quotes: [], loc: null, addr: '', phone: '', orders: [], alts: [], prof: null, stats: null, pending: [], tailors: [], adminDesigns: [], qd: null, mode: 'login', f: {}, specs: [], role: 'customer',
  alt: null, af: { area: 'Waist', diff: '', note: '' }, nd: { category: 'Blouses' }, after: null, rate: '', cap: '', profile: null,
  newAddress: { label: '', street: '', phone: '' }, settings: defaultSettings,
  listings: [], listingForm: { category: 'Blouses' }, shop: null, shopId: null, conversations: [], messages: [], conversationId: null, messageText: '', pendingImage: null, tailorOrderIds: null };
try { const s = JSON.parse(sessionStorage.getItem('sn')); if (s) { S.token = s.token; S.user = s.user; } } catch {}
function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = S.settings.theme === 'system' ? '' : S.settings.theme;
  root.lang = S.settings.language;
}
applyTheme();

let tt; const toast = (m) => { const e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('show'), 3200); };
async function api(p, o = {}) {
  const r = await fetch(p, { method: o.method || 'GET', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) }, body: o.body ? JSON.stringify(o.body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 401 && S.token) logout(); throw new Error(d.message || 'Request failed'); }
  return d;
}
function logout() {
  if (!confirm('Are you sure you want to sign out?')) return;
  S.token = S.user = S.profile = null; S.tailorOrderIds = null; sessionStorage.removeItem('sn'); go('home');
}
const slots = () => [1, 2, 3].flatMap((n) => ['10am–1pm', '3pm–6pm'].map((w) => fmt(Date.now() + n * 864e5) + ', ' + w));
const ic = (d) => ICON[d.category] ? ICON[d.category][0] : '🧵';

/* ---------- data loading ---------- */
async function loadDesigns() { S.designs = await api('/api/designs' + (S.cat !== 'All' ? '?category=' + encodeURIComponent(S.cat) : '')); render(); }
async function loadQuotes(id) {
  if (!id) return;
  const p = new URLSearchParams({ designId: id, fabric: S.fabric, fabricSource: S.fabricSource, sort: S.sort });
  if (S.express) p.set('express', '1'); if (S.pickup) p.set('pickup', '1');
  if (S.loc) { p.set('lat', S.loc[1]); p.set('lng', S.loc[0]); }
  S.quotes = await api('/api/tailors?' + p); render();
}
const refresh = () => loadQuotes(S.view === 'order' ? S.design && S.design._id : S.qd);
async function go(v) {
  if (v === 'order' && S.user && S.user.role !== 'customer') {
    toast('Ordering is only available to customer accounts');
    v = S.user.role === 'tailor' ? 'tailor' : 'admin';
  }
  if (v === 'tailors' && S.user && S.user.role === 'tailor') {
    toast('Your tailor dashboard shows orders assigned to you');
    v = 'tailor';
  }
  S.view = v; S.alt = null; render(); window.scrollTo(0, 0);
  try {
    if (v === 'home') {
      if (S.user && S.user.role === 'customer' && !S.profile) S.profile = await api('/api/auth/me');
      const address = S.profile && (S.profile.addresses || []).find((a) => a.isDefault);
      if (address && !S.addr) { S.addr = address.street; S.phone = address.phone; }
      await loadDesigns();
    }
    if (v === 'account' || v === 'settings') {
      if (S.user) {
        S.profile = await api('/api/auth/me');
        S.settings = { theme: S.profile.settings && S.profile.settings.theme || S.settings.theme, language: S.profile.settings && S.profile.settings.language || S.settings.language };
        applyTheme();
      }
    }
    if (v === 'tailors') { if (!S.designs.length) await loadDesigns(); S.qd = S.qd || (S.designs[0] && S.designs[0]._id); await loadQuotes(S.qd); }
    if (v === 'orders') [S.orders, S.alts] = await Promise.all([api('/api/orders/my'), api('/api/alterations/my')]);
    if (v === 'tailor') await loadTailorDashboard();
    if (v === 'shop') S.shop = await api(`/api/tailors/${S.shopId}/listings`);
    if (v === 'messages') {
      S.conversations = await api('/api/conversations');
      if (S.conversationId) S.messages = await api(`/api/conversations/${S.conversationId}/messages`);
    }
    if (v === 'admin') {
      [S.stats, S.tailors, S.adminDesigns, S.alts] = await Promise.all([
        api('/api/admin/stats'), api('/api/admin/tailors'), api('/api/designs/manage'), api('/api/alterations/my')
      ]);
      S.pending = S.tailors.filter((t) => !t.approved);
    }
  } catch (e) { toast(e.message); }
  render();
}
async function loadTailorDashboard() {
  const [prof, orders, alts, listings] = await Promise.all([
    api('/api/tailors/me'), api('/api/orders/my'), api('/api/alterations/my'), api('/api/tailors/me/listings')
  ]);
  const previous = S.tailorOrderIds;
  S.prof = prof; S.orders = orders; S.alts = alts; S.listings = listings;
  S.rate = prof.rateMultiplier; S.cap = prof.capacity;
  const newOrders = previous ? orders.filter((o) => o.status === 'pending' && !previous.has(o._id)) : [];
  S.tailorOrderIds = new Set(orders.map((o) => o._id));
  if (newOrders.length && S.view === 'tailor') toast(`${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} received`);
  if (S.view === 'tailor') render();
}

/* ---------- views ---------- */
function render() {
  const u = S.user, L = [['home', 'Collection']];
  if (!u || u.role !== 'tailor') L.push(['tailors', 'Tailors']);
  if (u && u.role === 'customer') L.push(['orders', 'My orders'], ['account', 'My account']);
  if (u && u.role === 'tailor') L.push(['tailor', 'Tailor dashboard']);
  if (u && u.role === 'admin') L.push(['admin', 'Admin']);
  if (u && ['customer', 'tailor'].includes(u.role)) L.push(['messages', 'Messages']);
  L.push(['settings', 'Settings']);
  $('#nav').innerHTML = translateMarkup(L.map(([k, l]) => `<button class="${S.view === k ? 'on' : ''}" data-a="nav" data-v="${k}">${l}</button>`).join('') +
    (u ? `<button data-a="logout">Sign out (${esc(u.name.split(' ')[0])})</button>` : `<button class="${S.view === 'auth' ? 'on' : ''}" data-a="nav" data-v="auth">Sign in</button>`));
  $('#main').innerHTML = translateMarkup(V[S.view] ? V[S.view]() : V.home());
}
function dcard(d) {
  const [e, bg] = ICON[d.category] || ['🧵', '#eee'];
  return `<article class="dcard"><div class="dimg" style="background:${bg}">${/^https:\/\//.test(d.image || '') ? `<img src="${esc(d.image)}" alt="">` : e}</div>
<div class="dinfo"><h3>${esc(d.name)}</h3><p class="s">${esc(d.category)} · about ${d.stitchDays} days</p><div class="tl" style="margin-top:8px;align-items:center"><b>from ${R(d.startingPrice)}</b><div>${S.user && S.user.role === 'customer' ? `<button class="btn alt sm" style="margin:0 6px 0 0" aria-label="${S.profile && (S.profile.wishlist || []).some((w) => (w._id || w) === d._id) ? 'Remove from wishlist' : 'Add to wishlist'}" data-a="wishlist" data-id="${d._id}">${S.profile && (S.profile.wishlist || []).some((w) => (w._id || w) === d._id) ? '♥' : '♡'}</button>` : ''}${!S.user || S.user.role === 'customer' ? `<button class="btn sm" style="margin:0" data-a="pick" data-id="${d._id}">Customise</button>` : '<span class="s">Customer ordering only</span>'}</div></div></div></article>`;
}
function qcard(t, mode) {
  const ok = t.availability === 'accepting' && t.specialtyMatch;
  return `<div class="card ${ok ? '' : 'dim'}"><div class="tl"><div><h3>${esc(t.name)}</h3><span class="s">${esc(t.area || '')}${t.distanceKm != null ? ' · ' + t.distanceKm + ' km' : ''}</span></div><b>${R(t.stitch)}</b></div>
<div><span class="tag">★ ${t.rating && t.rating.count ? t.rating.avg.toFixed(1) + ' (' + t.rating.count + ')' : 'New'}</span><span class="tag ${t.availability === 'accepting' ? 'ok' : 'bad'}">${AV[t.availability]}</span>${(t.specialties || []).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}${t.offersPickup ? '<span class="tag ok">Home pickup</span>' : ''}</div>
<p class="s" style="margin-top:6px">${t.specialtyMatch ? '' : 'Not a specialty for this design. '}Ready by <b>${fmt(t.readyDate)}</b>, delivered by ${fmt(t.deliveryDate)} · delivery ${R(t.delivery)}${S.pickup && !t.offersPickup ? ' · no home pickup' : ''} · ${t.activeOrders} in queue</p>
${S.user && S.user.role === 'tailor' ? '<p class="s">Tailor accounts cannot place customer orders.</p>' : `<button class="btn alt sm" ${ok ? '' : 'disabled'} data-a="${mode === 'dir' ? 'dchoose' : 'choose'}" data-id="${t._id}">${ok ? 'Choose this tailor' : t.specialtyMatch ? AV[t.availability] : 'Not offered'}</button>`}<button class="btn alt sm" data-a="shop" data-id="${t._id}">View tailor page</button></div>`;
}
function designEditor(d) {
  return `<div class="card" data-design="${d._id}"><div class="tl"><b>${esc(d.name)}</b><span class="tag ${d.active ? 'ok' : 'bad'}">${d.active ? 'Active' : 'Archived'}</span></div>
<label>Name</label><input data-field="name" value="${esc(d.name)}"><label>Category</label><select data-field="category">${CATS.map((c) => `<option ${d.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
<div class="row"><div><label>Starting price (₹)</label><input type="number" min="0" data-field="startingPrice" value="${d.startingPrice}"></div><div><label>Stitching days</label><input type="number" min="1" max="60" data-field="stitchDays" value="${d.stitchDays}"></div></div>
<label>Image URL (HTTPS)</label><input type="url" data-field="image" value="${esc(d.image || '')}"><label>Description</label><textarea rows="2" data-field="description">${esc(d.description || '')}</textarea>
<label><input type="checkbox" data-field="active" ${d.active ? 'checked' : ''}> Available in collection</label><button class="btn sm" data-a="savedesign" data-id="${d._id}">Save design</button><button class="btn alt sm" data-a="archivedesign" data-id="${d._id}">${d.active ? 'Remove from collection' : 'Restore design'}</button></div>`;
}
function tailorEditor(t) {
  return `<div class="card" data-tailor="${t._id}"><div class="tl"><b>${esc(t.name)}</b><span class="tag ${t.approved ? 'ok' : 'bad'}">${t.approved ? 'Approved' : 'Not approved'}</span></div>
<div class="row"><div><label>Name</label><input data-field="name" value="${esc(t.name)}"></div><div><label>Email</label><input type="email" data-field="email" value="${esc(t.email)}"></div></div>
<div class="row"><div><label>Phone</label><input data-field="phone" value="${esc(t.phone || '')}"></div><div><label>Area</label><input data-field="area" value="${esc(t.area || '')}"></div></div>
<label>Specialties (comma-separated)</label><input data-field="specialties" value="${esc((t.specialties || []).join(', '))}">
<div class="row"><div><label>Price multiplier (0.7–2)</label><input type="number" min="0.7" max="2" step="0.1" data-field="rateMultiplier" value="${t.rateMultiplier}"></div><div><label>Orders per day</label><input type="number" min="1" max="20" data-field="capacity" value="${t.capacity}"></div></div>
<label><input type="checkbox" data-field="approved" ${t.approved ? 'checked' : ''}> Approved for marketplace</label><label><input type="checkbox" data-field="accepting" ${t.accepting ? 'checked' : ''}> Accepting orders</label><label><input type="checkbox" data-field="offersPickup" ${t.offersPickup ? 'checked' : ''}> Offers home pickup</label>
<button class="btn sm" data-a="savetailor" data-id="${t._id}">Save tailor</button><button class="btn alt sm" data-a="${t.approved ? 'removetailor' : 'approvetailor'}" data-id="${t._id}">${t.approved ? 'Remove from marketplace' : 'Approve tailor'}</button></div>`;
}
function formFields(root) {
  const fields = {};
  root.querySelectorAll('[data-field]').forEach((el) => {
    const key = el.dataset.field;
    if (el.type === 'checkbox') fields[key] = el.checked;
    else if (key === 'specialties') fields[key] = el.value.split(',').map((s) => s.trim()).filter(Boolean);
    else if (['startingPrice', 'stitchDays', 'rateMultiplier', 'capacity'].includes(key)) fields[key] = Number(el.value);
    else fields[key] = el.value;
  });
  return fields;
}
const opts = () => `<div class="chips"><button class="chip ${S.express ? 'on' : ''}" data-a="opt" data-k="express">Express delivery</button><button class="chip ${S.pickup ? 'on' : ''}" data-a="opt" data-k="pickup">Home pickup of fabric and measurements</button>
<button class="chip ${S.loc ? 'on' : ''}" data-a="loc">${S.loc ? 'Location shared' : 'Use my location'}</button></div>`;
function checkout(q) {
  const addresses = S.profile && S.profile.addresses || [];
  return `<div class="card" id="co"><h3>Delivery and confirmation</h3>${addresses.length ? `<label>Use a saved address</label><select data-ch="useaddress"><option value="">Choose address</option>${addresses.map((a, i) => `<option value="${i}" ${S.addr === a.street ? 'selected' : ''}>${esc(a.label)}${a.isDefault ? ' (default)' : ''}</option>`).join('')}</select>` : ''}${q.pickup ? `<label>Pickup slot</label><select data-ch="slot">${slots().map((s) => `<option ${S.slot === s ? 'selected' : ''}>${s}</option>`).join('')}</select>` : ''}
<label>Delivery address</label><textarea rows="2" data-in="addr">${esc(S.addr)}</textarea><label>Phone</label><input inputmode="tel" data-in="phone" value="${esc(S.phone)}" autocomplete="tel">
<div class="sum" style="margin-top:12px"><div><span>Stitching (${esc(S.fabric)})</span><span>${R(q.stitch)}</span></div><div><span>Cloth</span><span>${S.fabricSource === 'customer' ? 'Customer supplied' : 'Tailor supplied'}</span></div><div><span>Delivery fee${q.distanceKm != null ? ', ' + q.distanceKm + ' km' : ''}${S.express ? ' + express' : ''}</span><span>${R(q.delivery)}</span></div>${q.pickup ? `<div><span>Home pickup</span><span>${R(q.pickupFee)}</span></div>` : ''}<div class="tot"><span>Total, pay on delivery</span><span>${R(q.total)}</span></div></div>
<p class="s">Delivered by ${fmt(q.deliveryDate)}. Prices are confirmed by the server when you place the order. Cash on delivery; no card details are stored. Covered by the 7-day fit guarantee.</p>
<button class="btn full" data-a="place">${S.user ? 'Place order' : 'Sign in to place order'}</button></div>`;
}
function acard(a, role) {
  const act = role === 'tailor' || role === 'admin';
  return `<div class="card"><b>Alteration: ${esc(a.area)}</b> <span class="tag ${a.status === 'declined' ? 'bad' : 'ok'}">${a.status}</span><p class="s">${esc(a.diffInches)}" off the agreed measurement. ${a.covered ? 'Covered by the free fit guarantee.' : 'Within tolerance, so the tailor may charge.'} ${esc(a.note || '')}${a.reason ? ' Reason: ' + esc(a.reason) : ''}</p>
${act && (a.status === 'requested' || (role === 'admin' && a.status === 'escalated')) ? `<button class="btn sm" data-a="altact" data-id="${a._id}" data-v="approve">Approve free re-fit</button><button class="btn alt sm" data-a="altact" data-id="${a._id}" data-v="decline">Decline</button>` : ''}
${act && a.status === 'approved' && role === 'tailor' ? `<button class="btn sm" data-a="altact" data-id="${a._id}" data-v="complete">Mark re-fit delivered</button>` : ''}</div>`;
}
function ocard(o, role) {
  const d = o.design || {}, done = new Set((o.statusHistory || []).map((h) => h.status)), steps = ST.filter((s) => s !== 'pickup_collected' || (o.pickup && o.pickup.requested));
  const als = S.alts.filter((a) => (a.order && a.order._id || a.order) === o._id), open = als.some((a) => ['requested', 'approved', 'escalated'].includes(a.status));
  const m = Object.entries(o.measurements || {}).map(([k, v]) => k + ' ' + v + '"').join(', ');
  const can = role === 'customer' && o.status === 'delivered' && Date.now() - new Date(o.deliveredAt) < 7 * 864e5 && !open;
  return `<div class="card"><div class="tl"><div><h3>${ic(d)} ${esc(d.name || 'Design')}</h3><span class="s">#${o._id.slice(-6)} · ${role === 'customer' ? esc(o.tailor && o.tailor.name) : esc(o.customer && o.customer.name) + ' · ' + esc(o.deliveryAddress)}</span></div><b>${R(o.totalAmount)}</b></div>
${['cancelled', 'declined'].includes(o.status) ? `<p class="err">${LBL[o.status]}${o.status === 'cancelled' && o.cancelReason ? ` · Reason: ${esc(o.cancelReason)}` : ''}</p>` : `<ul class="tr">${steps.map((s) => `<li class="${done.has(s) ? 'd' : ''}">${LBL[s]}</li>`).join('')}</ul>`}
${o.pickup && o.pickup.requested && o.status === 'pending' ? `<p class="s">Pickup slot: ${esc(o.pickup.slot || '')}</p>` : ''}
<div class="sum"><div><span class="s">${o.status === 'delivered' ? 'Delivered' : 'Expected delivery'}</span><span>${fmt(o.deliveredAt || o.deliveryDate)}</span></div><div><span class="s">Stitching</span><span>${R(o.tailoringCharge)}</span></div><div><span class="s">Delivery fee</span><span>${R(o.deliveryCharge)}</span></div>${o.pickupCharge ? `<div><span class="s">Home pickup</span><span>${R(o.pickupCharge)}</span></div>` : ''}</div>
<p class="s">${esc(o.fabric)}${o.fabricColor ? ` · Cloth color <span class="color-chip" style="background:${esc(o.fabricColor)}" aria-label="${esc(o.fabricColor)}"></span> ${esc(o.fabricColor)}` : ''}${o.fabricSource ? ` · ${o.fabricSource === 'customer' ? 'Customer supplied cloth' : 'Tailor supplied cloth'}` : ''}${m ? ' · ' + esc(m) : ''}${o.customizationNotes ? '<br>Notes: ' + esc(o.customizationNotes) : ''}</p>${o.clothPhoto ? `<img class="order-cloth-photo" src="${esc(o.clothPhoto)}" alt="Cloth photo attached to order">` : ''}${als.map((a) => acard(a, role)).join('')}
${role === 'tailor' ? NEXT(o).map((n) => `<button class="btn ${n === 'declined' ? 'alt ' : ''}sm" data-a="status" data-id="${o._id}" data-v="${n}">${n === 'declined' ? 'Decline' : 'Mark: ' + LBL[n]}</button>`).join('') : ''}
${role === 'customer' && ['pending', 'accepted'].includes(o.status) ? `<button class="btn alt sm" data-a="cancel" data-id="${o._id}">Cancel order</button>` : ''}
${role === 'customer' ? `<button class="btn alt sm" data-a="invoice" data-id="${o._id}">Download invoice</button>` : ''}
${role === 'customer' && o.tailor && o.tailor._id ? `<button class="btn alt sm" data-a="messageTailor" data-id="${o.tailor._id}">Message tailor</button>` : ''}
${role === 'customer' && o.status === 'delivered' && !(o.review && o.review.rating) ? `<select data-ch="rate" style="width:auto;display:inline-block"><option value="">Rate tailor</option>${[5, 4, 3, 2, 1].map((n) => `<option value="${o._id}:${n}">${'★'.repeat(n)}</option>`).join('')}</select>` : ''}
${can && S.alt !== o._id ? `<button class="btn sm" data-a="altopen" data-id="${o._id}">Request alteration</button>` : ''}
${S.alt === o._id ? `<div class="card"><label>What does not fit?</label><select data-ch="afarea">${['Chest', 'Waist', 'Hip', 'Length', 'Other'].map((x) => `<option ${S.af.area === x ? 'selected' : ''}>${x}</option>`).join('')}</select><label>Inches off the agreed measurement</label><input inputmode="decimal" data-in="af.diff" value="${esc(S.af.diff)}"><p class="s" id="hint">Over 0.5 in is covered by the free fit guarantee.</p><label>Details</label><textarea rows="2" data-in="af.note">${esc(S.af.note)}</textarea><button class="btn sm" data-a="altsend" data-id="${o._id}">Send request</button><button class="btn alt sm" data-a="nav" data-v="orders">Cancel</button></div>` : ''}</div>`;
}
function accountView() {
  const p = S.profile;
  if (!p) return '<p class="empty">Loading account…</p>';
  const sizes = p.sizeProfile || {}, styles = p.stylePreferences || {}, notify = p.notificationPreferences || { priceDrops: true, backInStock: true, promoCodes: true, email: true, sms: false }, newsletter = p.newsletterPreferences || { email: false, sms: false };
  const toggles = (group, values, names) => Object.entries(names).map(([k, name]) => `<label class="pref-row"><span>${name}</span><input type="checkbox" data-pref="${group}.${k}" ${values[k] ? 'checked' : ''}></label>`).join('');
  return `<h2 style="margin-top:0">My account</h2><p class="s">Manage your customer profile, preferences and saved items.</p>
<section class="account-section card"><h3>Account details & security</h3><div class="row"><div><label>Name</label><input data-profile="name" value="${esc(p.name || '')}"></div><div><label>Email</label><input type="email" data-profile="email" autocomplete="email" value="${esc(p.email || '')}"></div><div><label>Phone</label><input data-profile="phone" autocomplete="tel" value="${esc(p.phone || '')}"></div></div><button class="btn sm" data-a="profileSave">Save account details</button>
<div class="row password-row"><div><label>Current password</label><input type="password" data-credential="current" autocomplete="current-password"></div><div><label>New password (8+ characters)</label><input type="password" data-credential="new" autocomplete="new-password"></div></div><button class="btn alt sm" data-a="passwordSave">Update password</button></section>
<section class="account-section card"><h3>Order tracking & history</h3><p class="s">Track active orders, review past purchases, and download an invoice for each order.</p><button class="btn sm" data-a="nav" data-v="orders">View my orders</button></section>
<section class="account-section card"><h3>Returns, exchanges & fit guarantee</h3><p class="s">StitchNear orders are custom-made. Instead of standard apparel returns, eligible fit issues can be sent to the tailor within 7 days of delivery. Issues more than 0.5 inch off the agreed measurements qualify for a free re-fit and pickup/delivery.</p><button class="btn alt sm" data-a="nav" data-v="orders">View orders & request a fit adjustment</button></section>
<section class="account-section card"><h3>Saved addresses</h3><p class="s">Save up to 10 delivery addresses for faster checkout.</p>${(p.addresses || []).map((a, i) => `<div class="saved-address"><div><b>${esc(a.label)}</b>${a.isDefault ? ' <span class="tag ok">Default</span>' : ''}<p class="s">${esc(a.street)} · ${esc(a.phone)}</p></div><div>${!a.isDefault ? `<button class="link" data-a="addressDefault" data-i="${i}">Make default</button>` : ''}<button class="link remove-link" data-a="addressRemove" data-i="${i}">Remove</button></div></div>`).join('') || '<p class="empty">No saved addresses yet.</p>'}
<div class="row address-form"><div><label>Label (Home, Work…)</label><input data-address="label" value="${esc(S.newAddress.label)}"></div><div><label>Delivery address</label><input data-address="street" value="${esc(S.newAddress.street)}"></div><div><label>Phone</label><input data-address="phone" value="${esc(S.newAddress.phone)}"></div></div><button class="btn sm" data-a="addressAdd">Add address</button></section>
<section class="account-section card"><h3>Payment methods</h3><p class="s">Checkout currently supports cash on delivery only. Card and wallet payments are not enabled, so payment details are not collected or stored.</p></section>
<section class="account-section card"><h3>Size profile</h3><p class="s">Use these saved sizes as a personal reference. Tailors still use the measurements you enter for each order.</p><div class="row">${[['tops','Tops'],['bottoms','Bottoms'],['shoes','Shoes']].map(([k, label]) => `<div><label>${label}</label><input data-size="${k}" value="${esc(sizes[k] || '')}" placeholder="e.g. M, 32, 7"></div>`).join('')}</div>
<h3 class="subheading">Style preferences</h3><p class="s">Separate entries with commas.</p><div class="row">${[['styles','Favorite styles'],['fits','Favorite fits'],['brands','Favorite brands']].map(([k, label]) => `<div><label>${label}</label><input data-style="${k}" value="${esc((styles[k] || []).join(', '))}" placeholder="e.g. ethnic, relaxed"></div>`).join('')}</div><button class="btn sm" data-a="preferencesSave">Save shopping preferences</button></section>
<section class="account-section card"><h3>Communications & alerts</h3><div class="pref-list"><div><b>Shopping alerts</b>${toggles('notificationPreferences', notify, { priceDrops: 'Wishlist price drops', backInStock: 'Back-in-stock updates', promoCodes: 'Exclusive promo codes', email: 'Email alerts', sms: 'SMS alerts' })}</div><div><b>Newsletter</b>${toggles('newsletterPreferences', newsletter, { email: 'Email style drops and seasonal sales', sms: 'SMS style drops and seasonal sales' })}</div></div><p class="s">Preferences are saved to your account. Email/SMS delivery will be available when notification services are connected.</p><button class="btn sm" data-a="preferencesSave">Save communication preferences</button></section>
<section class="account-section card"><h3>Wishlist / saved items</h3><div class="grid">${(p.wishlist || []).filter((d) => d && d.active !== false).map(dcard).join('') || '<p class="empty">Save designs from the collection to see them here.</p>'}</div><button class="btn alt sm" data-a="nav" data-v="home">Browse collection</button></section>
<section class="account-section card"><h3>Help & customer care</h3><p class="s">For sizing, use the size profile as a reference and enter exact measurements on each order. Fit requests and order support are available from your order history.</p><details><summary>Return and fit policy</summary><p class="s">Because each garment is made to your specifications, standard change-of-mind returns are not available. Report fit issues within 7 days after delivery. A difference greater than 0.5 inch from the agreed measurements qualifies for one free re-fit with free pickup and delivery. The tailor responds within 48 hours; unresolved covered claims can be escalated to platform support.</p></details></section>`;
}
function listingForm(l = S.listingForm, id = '') {
  const saved = !!id;
  return `<div class="card listing-editor" ${saved ? `data-listing="${id}"` : 'data-listing-new'}><div class="row"><div><label>Garment name</label><input data-listing-field="name" value="${esc(l.name || '')}"></div><div><label>Category</label><select data-listing-field="category">${CATS.map((c) => `<option ${l.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
<label>Description</label><textarea rows="2" data-listing-field="description">${esc(l.description || '')}</textarea><label>Image URL (HTTPS, optional)</label><input type="url" data-listing-field="image" value="${esc(l.image || '')}" placeholder="https://...">
<div class="row"><div><label>Price (₹)</label><input type="number" min="0" max="100000" data-listing-field="price" value="${esc(l.price ?? '')}"></div><div><label>Stitching days</label><input type="number" min="1" max="60" data-listing-field="stitchDays" value="${esc(l.stitchDays ?? '')}"></div><div><label>Delivery days</label><input type="number" min="1" max="60" data-listing-field="deliveryDays" value="${esc(l.deliveryDays ?? '')}"></div><div><label>Delivery charge (₹)</label><input type="number" min="0" max="100000" data-listing-field="deliveryCharge" value="${esc(l.deliveryCharge ?? 0)}"></div></div>
<button class="btn sm" data-a="${saved ? 'listingSave' : 'listingAdd'}" ${saved ? `data-id="${id}"` : ''}>${saved ? 'Save garment' : 'Add garment'}</button>${saved ? `<button class="btn alt sm" data-a="listingRemove" data-id="${id}">Remove listing</button>` : ''}</div>`;
}
function listingCard(l) {
  const [emoji, bg] = ICON[l.category] || ['🧵', '#eee'];
  return `<article class="tailor-garment-card"><div class="tailor-garment-photo" style="--garment-bg:${bg}">${l.image ? `<img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy">` : `<span aria-hidden="true">${emoji}</span>`}</div><div class="tailor-garment-info"><span class="eyebrow">${esc(l.category)}</span><h3>${esc(l.name)}</h3>${l.description ? `<p class="tailor-garment-description">${esc(l.description)}</p>` : ''}<div class="tailor-garment-details"><div><span class="s">Stitching</span><b>${l.stitchDays} days</b></div><div><span class="s">Delivery</span><b>${l.deliveryDays} days</b></div><div><span class="s">Delivery charge</span><b>₹${Number(l.deliveryCharge).toLocaleString('en-IN')}</b></div></div><div class="tailor-garment-footer"><b class="tailor-garment-price">₹${Number(l.price).toLocaleString('en-IN')}</b><button class="btn sm" data-a="messageTailor" data-id="${S.shop && S.shop.tailor._id}">Message to order</button></div></div></article>`;
}
function settingsView() {
  const p = S.profile || {}, settings = S.settings;
  return `<h2 style="margin-top:0">Settings</h2>${S.user ? `<section class="card"><h3>Account information</h3><p class="s">Signed in as ${esc(p.name || S.user.name)} · ${esc(p.role || S.user.role)}</p><div class="row"><div><label>Name</label><input data-setting-profile="name" value="${esc(p.name || S.user.name)}"></div><div><label>Email</label><input type="email" data-setting-profile="email" value="${esc(p.email || '')}"></div><div><label>Phone</label><input data-setting-profile="phone" value="${esc(p.phone || '')}"></div></div><button class="btn sm" data-a="settingsProfileSave">Save account information</button><div class="row"><div><label>Current password</label><input type="password" data-credential="current" autocomplete="current-password"></div><div><label>New password</label><input type="password" data-credential="new" autocomplete="new-password"></div></div><button class="btn alt sm" data-a="passwordSave">Update password</button></section>` : `<section class="card"><h3>Account</h3><p class="s">Sign in to see and update your account information.</p><button class="btn sm" data-a="nav" data-v="auth">Sign in</button><button class="btn alt sm" data-a="registerView">Create account</button></section>`}
<section class="card"><h3>App appearance</h3><div class="row"><div><label>Theme</label><select data-setting="theme"><option value="system" ${settings.theme === 'system' ? 'selected' : ''}>System default</option><option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option></select></div><div><label>Language</label><select data-setting="language">${Object.entries(LANGUAGE_NAMES).map(([code, name]) => `<option value="${code}" ${settings.language === code ? 'selected' : ''}>${name}</option>`).join('')}</select></div></div><p class="s">Languages: English, Hindi, Tamil, Telugu and Malayalam.</p><button class="btn sm" data-a="settingsSave">Save settings</button></section>
${S.user ? `<section class="card"><h3>Sign out</h3><button class="btn alt sm" data-a="logout">Sign out</button></section>` : ''}`;
}
function shopView() {
  if (!S.shop) return '<p class="empty">Loading tailor page…</p>';
  const t = S.shop.tailor;
  return `<button class="link" data-a="nav" data-v="tailors">‹ Tailors</button><section class="hero"><span class="eyebrow">Tailor profile</span><h1>${esc(t.name)}</h1><p>${esc(t.area || '')} · ${(t.specialties || []).map(esc).join(', ')} · ${t.rating && t.rating.count ? `★ ${t.rating.avg} (${t.rating.count})` : 'New tailor'}</p><button class="btn sm" data-a="messageTailor" data-id="${t._id}">Ask about stitching</button></section><h2>Garments by ${esc(t.name)}</h2><p class="s">Prices, tailoring time and delivery charges are set by this tailor. Contact the tailor in the app to discuss details before placing an order.</p><div class="grid">${S.shop.listings.map(listingCard).join('') || '<p class="empty">No garments listed yet.</p>'}</div>`;
}
function messagesView() {
  const active = S.conversations.find((c) => c._id === S.conversationId);
  const peer = (c) => S.user.role === 'customer' ? c.tailor : c.customer;
  return `<h2 style="margin-top:0">Messages</h2><div class="messaging-layout"><section class="card inbox"><h3>Conversations</h3>${S.conversations.map((c) => `<button class="inbox-item ${c._id === S.conversationId ? 'selected' : ''}" data-a="openConversation" data-id="${c._id}"><b>${esc(peer(c) && peer(c).name || 'User')}</b><span class="s">${esc(c.latestMessage && (c.latestMessage.text || (c.latestMessage.hasPhoto ? 'Photo' : '')) || 'Start a conversation')}</span></button>`).join('') || '<p class="empty">No conversations yet.</p>'}</section>
<section class="card chat-panel">${active ? `<h3>${esc(peer(active) && peer(active).name || 'Conversation')}</h3><div class="chat-messages">${S.messages.map((m) => `<article class="chat-message ${m.sender === String(S.user.id) ? 'mine' : ''}">${m.text ? `<p>${esc(m.text)}</p>` : ''}${m.image ? `<img class="chat-photo" src="${esc(m.image)}" alt="Photo shared in chat">` : ''}<span class="s">${new Date(m.createdAt).toLocaleString()}</span></article>`).join('') || '<p class="empty">Ask the tailor about stitching, fabric or fit.</p>'}</div><textarea rows="3" data-in="messageText" placeholder="Type your message">${esc(S.messageText)}</textarea><label class="photo-pick">Attach cloth photo <input type="file" accept="image/jpeg,image/png,image/webp" data-file="chatImage"></label>${S.pendingImage ? '<p class="s">Photo ready to send (JPEG, max 350 KB).</p>' : ''}<button class="btn sm" data-a="sendMessage">Send message</button>` : '<p class="empty">Choose a conversation to view messages.</p>'}</section></div>`;
}
const V = {
  home: () => `<section class="hero"><span class="eyebrow">Made just for you</span><h1>Your style. Your fit. Your tailor.</h1><p>Pick a design, compare trusted local tailors on price and delivery date, and get it stitched and delivered home.</p></section>
<div class="chips">${['All', ...CATS].map((c) => `<button class="chip ${S.cat === c ? 'on' : ''}" data-a="cat" data-v="${c}">${c}</button>`).join('')}</div><div class="grid">${S.designs.map(dcard).join('') || '<p class="empty">No designs yet.</p>'}</div>`,
  order: () => {
    if (S.user && S.user.role !== 'customer') return '<p class="empty">Ordering is only available to customer accounts.</p>';
    const d = S.design; if (!d) return '<p class="empty">Pick a design first.</p>'; const q = S.quotes.find((x) => x._id === S.tid);
    return `<button class="link" data-a="nav" data-v="home">‹ Collection</button><h2>${ic(d)} ${esc(d.name)}</h2><div class="card"><label>Fabric</label><div class="chips">${Object.entries(FABS).map(([f, a]) => `<button class="chip ${S.fabric === f ? 'on' : ''}" data-a="fab" data-v="${f}">${f}${a ? ' +' + R(a) : ''}</button>`).join('')}</div>
<label>Who supplies the cloth?</label><div class="chips"><button class="chip ${S.fabricSource === 'tailor' ? 'on' : ''}" data-a="fabricSource" data-v="tailor">Tailor supplies cloth</button><button class="chip ${S.fabricSource === 'customer' ? 'on' : ''}" data-a="fabricSource" data-v="customer">I have my own cloth</button></div><p class="s">${S.fabricSource === 'customer' ? 'The fabric surcharge is removed. Add a cloth photo so your tailor can review it.' : 'The selected fabric surcharge is included in the quote.'}</p>
<label>Cloth color</label><div class="color-boxes" role="group" aria-label="Choose cloth color">${COLORS.map(([name, color]) => `<button type="button" class="color-box ${S.fabricColor.toLowerCase() === color ? 'selected' : ''}" style="background-color:${color} !important" data-a="colorPick" data-v="${color}" aria-label="${name}" aria-pressed="${S.fabricColor.toLowerCase() === color}" title="${name}"></button>`).join('')}<label class="custom-color-box" title="Custom color"><input type="color" aria-label="Choose custom cloth color" data-in="fabricColor" value="${esc(S.fabricColor)}">+</label></div><p class="s">Selected: ${esc((COLORS.find(([, color]) => color === S.fabricColor.toLowerCase()) || ['Custom color'])[0])} · ${esc(S.fabricColor.toUpperCase())}</p>${S.fabricSource === 'customer' ? `<label>Photo of your cloth (optional, JPEG/PNG/WebP)</label><input type="file" accept="image/jpeg,image/png,image/webp" data-file="orderClothPhoto">${S.clothPhoto ? `<div class="cloth-preview"><img class="order-cloth-photo" src="${esc(S.clothPhoto)}" alt="Preview of your cloth"><button class="link" data-a="clearClothPhoto">Remove photo</button></div>` : ''}` : ''}
<label>Measurements in inches (the tailor is held to these)</label><div class="row">${['chest', 'waist', 'hip', 'length'].map((k) => `<input inputmode="decimal" aria-label="${k}" placeholder="${k[0].toUpperCase() + k.slice(1)}" data-in="m.${k}" value="${esc(S.m[k] || '')}">`).join('')}</div>
<label>Design notes</label><textarea rows="3" data-in="notes" placeholder="Neck style, sleeves, embroidery…">${esc(S.notes)}</textarea><label>Options</label>${opts()}</div>
<h2>Tailors for this design</h2>${S.quotes.length ? S.quotes.map((t) => qcard(t, 'pick')).join('') : '<p class="empty">Loading tailors…</p>'}${q ? checkout(q) : ''}`;
  },
  tailors: () => `<h2 style="margin-top:0">Tailors near you</h2><div class="card"><label>Compare prices for</label><select data-ch="qd">${S.designs.map((d) => `<option value="${d._id}" ${d._id === S.qd ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>
<label>Fabric</label><div class="chips">${Object.keys(FABS).map((f) => `<button class="chip ${S.fabric === f ? 'on' : ''}" data-a="fab" data-v="${f}">${f}</button>`).join('')}</div>${opts()}
<label>Sort by</label><div class="chips">${[['near', 'Nearest'], ['rating', 'Top rated'], ['price', 'Lowest price'], ['soon', 'Earliest ready']].map(([k, l]) => `<button class="chip ${S.sort === k ? 'on' : ''}" data-a="sort" data-v="${k}">${l}</button>`).join('')}</div></div>
${S.quotes.map((t) => qcard(t, 'dir')).join('') || '<p class="empty">No tailors found.</p>'}`,
  orders: () => `<h2 style="margin-top:0">My orders</h2>${S.orders.map((o) => ocard(o, 'customer')).join('') || '<p class="empty">No orders yet. Pick a design to start.</p>'}
<div class="card"><h3>Fit guarantee</h3><p class="s">Report a fit problem within 7 days of delivery. Garments more than 0.5 inch off your agreed measurements get a free re-fit with free pickup and delivery. One free re-fit per order. The tailor replies within 48 hours, and unresolved cases go to platform support.</p></div>`,
  account: accountView,
  shop: shopView,
  settings: settingsView,
  messages: messagesView,
  tailor: () => { const p = S.prof; if (!p) return '<p class="empty">Loading…</p>'; return `<h2 style="margin-top:0">Tailor dashboard</h2><div class="card"><div class="tl"><b>${esc(p.name)}</b><span class="tag ${p.accepting ? 'ok' : 'bad'}">${p.accepting ? 'Accepting orders' : 'Paused'}</span></div><p class="s">${p.activeOrders} active orders · ★ ${p.rating.count ? p.rating.avg + ' (' + p.rating.count + ')' : 'New'}${p.location ? '' : ' · location not set, so you will not appear in nearby search'}</p>
<button class="btn sm" data-a="tprof" data-k="accepting">${p.accepting ? 'Pause new orders' : 'Start accepting orders'}</button><button class="btn alt sm" data-a="tprof" data-k="offersPickup">Home pickup: ${p.offersPickup ? 'on' : 'off'}</button><button class="btn alt sm" data-a="tloc">Set my shop location</button>
<div class="row" style="margin-top:12px"><div><label>Price multiplier (0.7 to 2)</label><input inputmode="decimal" data-in="rate" value="${esc(S.rate)}"></div><div><label>Orders finished per day</label><input inputmode="numeric" data-in="cap" value="${esc(S.cap)}"></div></div><button class="btn sm" data-a="tsave">Save pricing and capacity</button></div>
<h2>My garments</h2><p class="s">These listings appear only on your tailor profile. Customers can message you to discuss the garment.</p>${listingForm()}
<div class="grid">${S.listings.map((l) => listingForm(l, l._id)).join('')}</div>
<h2>Orders <button class="btn alt sm" data-a="refreshTailorOrders">Refresh orders</button></h2>${S.orders.map((o) => ocard(o, 'tailor')).join('') || '<p class="empty">No orders yet. New customer orders will appear here automatically.</p>'}<h2>Fit requests</h2>${S.alts.filter((a) => !a.order || true).map((a) => acard(a, 'tailor')).join('') || '<p class="empty">No requests.</p>'}`; },
  admin: () => { const s = S.stats || {}; return `<h2 style="margin-top:0">Platform admin</h2><div class="kpis"><div class="kpi"><span class="s">Orders</span><b>${s.orders || 0}</b></div><div class="kpi"><span class="s">Order value</span><b>${R(s.orderValue || 0)}</b></div><div class="kpi"><span class="s">Commission</span><b>${R(s.commission || 0)}</b></div><div class="kpi"><span class="s">Alteration rate</span><b>${s.alterationRate || 0}%</b></div><div class="kpi"><span class="s">Open fit claims</span><b>${s.openClaims || 0}</b></div></div>
<h2>Tailors awaiting approval</h2>${S.pending.map((t) => `<div class="card tl"><div><b>${esc(t.name)}</b><div class="s">${esc(t.email)} · ${esc(t.area || '')} · ${(t.specialties || []).map(esc).join(', ')}</div></div><button class="btn sm" data-a="approvetailor" data-id="${t._id}">Approve</button></div>`).join('') || '<p class="empty">None waiting.</p>'}
<h2>Escalated and open fit claims</h2>${S.alts.filter((a) => ['requested', 'escalated'].includes(a.status)).map((a) => acard(a, 'admin')).join('') || '<p class="empty">No open claims.</p>'}
<h2>Manage designs</h2><div class="card"><h3>Add a design</h3><label>Name</label><input data-in="nd.name"><label>Category</label><select data-ch="ndcat">${CATS.map((c) => `<option>${c}</option>`).join('')}</select><div class="row"><div><label>Starting price (₹)</label><input inputmode="numeric" data-in="nd.startingPrice"></div><div><label>Stitching days</label><input inputmode="numeric" data-in="nd.stitchDays"></div></div><label>Image URL (HTTPS)</label><input data-in="nd.image"><label>Description</label><textarea rows="2" data-in="nd.description"></textarea><button class="btn sm" data-a="adddesign">Add design</button></div>
${S.adminDesigns.map(designEditor).join('') || '<p class="empty">No designs yet.</p>'}
<h2>Manage tailors</h2><div class="card" data-tailor-new><h3>Add a tailor</h3><label>Name</label><input data-field="name"><label>Email</label><input type="email" data-field="email"><label>Temporary password (8+ characters)</label><input type="password" data-field="password" autocomplete="new-password"><div class="row"><div><label>Phone</label><input data-field="phone"></div><div><label>Area</label><input data-field="area"></div></div><label>Specialties (comma-separated)</label><input data-field="specialties" placeholder="Blouses, Dresses"><button class="btn sm" data-a="addtailor">Add and approve tailor</button></div>
${S.tailors.map(tailorEditor).join('') || '<p class="empty">No tailors yet.</p>'}</div>`; },
  auth: () => `<h2 style="margin-top:0">${S.mode === 'login' ? 'Sign in' : 'Create account'}</h2><div class="card">${S.mode === 'register' ? `<p class="s">Customer and tailor registration is available here. Admin accounts are provisioned securely by the system administrator.</p><div class="chips"><button class="chip ${S.role === 'customer' ? 'on' : ''}" data-a="role" data-v="customer">I am a customer</button><button class="chip ${S.role === 'tailor' ? 'on' : ''}" data-a="role" data-v="tailor">I am a tailor</button></div><label>Name</label><input data-in="f.name" value="${esc(S.f.name || '')}"><label>Phone</label><input data-in="f.phone" value="${esc(S.f.phone || '')}">${S.role === 'tailor' ? `<label>Area</label><input data-in="f.area" value="${esc(S.f.area || '')}"><label>Specialties</label><div class="chips">${CATS.map((c) => `<button class="chip ${S.specs.includes(c) ? 'on' : ''}" data-a="spec" data-v="${c}">${c}</button>`).join('')}</div>` : ''}` : ''}
<label>Email</label><input type="email" data-in="f.email" value="${esc(S.f.email || '')}" autocomplete="email"><label>Password</label><input type="password" data-in="f.password" autocomplete="${S.mode === 'login' ? 'current-password' : 'new-password'}">
<button class="btn full" data-a="${S.mode}">${S.mode === 'login' ? 'Sign in' : 'Create account'}</button><button class="link" data-a="mode" data-v="${S.mode === 'login' ? 'register' : 'login'}">${S.mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></div>`
};

/* ---------- actions ---------- */
async function openTailorChat(tailorId) {
  if (!S.user) { S.pendingTailorId = tailorId; S.after = 'message'; return go('auth'); }
  if (S.user.role !== 'customer') throw new Error('Sign in as a customer to message a tailor');
  const c = await api(`/api/conversations/with/${tailorId}`, { method: 'POST' });
  S.conversationId = c._id; S.messageText = ''; S.pendingImage = null;
  return go('messages');
}
async function compressChatImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose an image file');
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.82, 0.68, 0.52, 0.38, 0.25]) {
    const data = canvas.toDataURL('image/jpeg', quality);
    if (data.length < 465000) return data;
  }
  throw new Error('Image is too large to attach');
}
const A = {
  nav: ({ v }) => go(v), logout,
  colorPick: ({ v }) => { S.fabricColor = v; render(); },
  refreshTailorOrders: () => loadTailorDashboard(),
  shop: async ({ id }) => { S.shopId = id; return go('shop'); },
  messageTailor: ({ id }) => openTailorChat(id),
  fabricSource: ({ v }) => {
    if (!['customer', 'tailor'].includes(v)) throw new Error('Choose a valid cloth supplier');
    S.fabricSource = v; S.clothPhoto = v === 'customer' ? S.clothPhoto : null;
    return refresh();
  },
  clearClothPhoto: () => { S.clothPhoto = null; render(); },
  openConversation: ({ id }) => { S.conversationId = id; S.messageText = ''; S.pendingImage = null; return go('messages'); },
  sendMessage: async () => {
    if (!S.conversationId) throw new Error('Choose a conversation first');
    const message = await api(`/api/conversations/${S.conversationId}/messages`, { method: 'POST', body: { text: S.messageText, image: S.pendingImage } });
    S.messages.push(message); S.messageText = ''; S.pendingImage = null;
    return go('messages');
  },
  listingAdd: async () => {
    const form = document.querySelector('[data-listing-new]');
    const body = {};
    form.querySelectorAll('[data-listing-field]').forEach((el) => { body[el.dataset.listingField] = el.value; });
    for (const key of ['price', 'stitchDays', 'deliveryDays', 'deliveryCharge']) body[key] = Number(body[key]);
    if (!body.name.trim() || !Number.isFinite(body.price) || !Number.isFinite(body.stitchDays) || !Number.isFinite(body.deliveryDays) || !Number.isFinite(body.deliveryCharge))
      throw new Error('Complete the garment name, price, stitching time, delivery time and delivery charge');
    await api('/api/tailors/me/listings', { method: 'POST', body });
    S.listingForm = { category: 'Blouses' }; toast('Garment added to your tailor page'); return go('tailor');
  },
  listingSave: async ({ id }) => {
    const form = document.querySelector(`[data-listing="${id}"]`), body = {};
    form.querySelectorAll('[data-listing-field]').forEach((el) => { body[el.dataset.listingField] = el.value; });
    for (const key of ['price', 'stitchDays', 'deliveryDays', 'deliveryCharge']) body[key] = Number(body[key]);
    await api(`/api/tailors/me/listings/${id}`, { method: 'PATCH', body });
    toast('Garment listing saved'); return go('tailor');
  },
  listingRemove: async ({ id }) => {
    if (!confirm('Remove this garment from your tailor page?')) return;
    await api(`/api/tailors/me/listings/${id}`, { method: 'DELETE' }); toast('Garment listing removed'); return go('tailor');
  },
  settingsSave: async () => {
    localStorage.setItem('sn-settings', JSON.stringify(S.settings));
    if (S.user) S.profile = await api('/api/auth/me', { method: 'PATCH', body: { settings: S.settings } });
    applyTheme(); toast('Settings saved'); render();
  },
  settingsProfileSave: async () => {
    const read = (key) => document.querySelector(`[data-setting-profile="${key}"]`).value;
    const p = await api('/api/auth/me', { method: 'PATCH', body: { name: read('name'), email: read('email'), phone: read('phone') } });
    S.profile = p; S.user.name = p.name; sessionStorage.setItem('sn', JSON.stringify({ token: S.token, user: S.user }));
    toast('Account information saved'); return go('settings');
  },
  registerView: () => { S.mode = 'register'; return go('auth'); },
  useaddress: (v) => {
    if (v === '') return;
    const a = S.profile && S.profile.addresses && S.profile.addresses[Number(v)];
    if (!a) throw new Error('Saved address not found');
    S.addr = a.street; S.phone = a.phone; render();
  },
  profileSave: async () => {
    const get = (k) => document.querySelector(`[data-profile="${k}"]`).value;
    const p = await api('/api/auth/me', { method: 'PATCH', body: { name: get('name'), email: get('email'), phone: get('phone') } });
    S.user.name = p.name; S.profile = p; sessionStorage.setItem('sn', JSON.stringify({ token: S.token, user: S.user }));
    toast('Account details saved'); return go('account');
  },
  passwordSave: async () => {
    const currentPassword = document.querySelector('[data-credential="current"]').value;
    const newPassword = document.querySelector('[data-credential="new"]').value;
    const d = await api('/api/auth/password', { method: 'PATCH', body: { currentPassword, newPassword } });
    document.querySelector('[data-credential="current"]').value = '';
    document.querySelector('[data-credential="new"]').value = '';
    toast(d.message);
  },
  addressAdd: async () => {
    const get = (k) => document.querySelector(`[data-address="${k}"]`).value.trim();
    const addresses = [...(S.profile.addresses || [])].map((a) => ({ label: a.label, street: a.street, phone: a.phone, isDefault: a.isDefault }));
    if (addresses.length >= 10) throw new Error('You can save up to 10 addresses');
    addresses.push({ label: get('label'), street: get('street'), phone: get('phone'), isDefault: addresses.length === 0 });
    await api('/api/auth/me', { method: 'PATCH', body: { addresses } });
    S.newAddress = { label: '', street: '', phone: '' }; toast('Address saved'); return go('account');
  },
  addressDefault: async ({ i }) => {
    const addresses = S.profile.addresses.map((a, n) => ({ label: a.label, street: a.street, phone: a.phone, isDefault: n === Number(i) }));
    await api('/api/auth/me', { method: 'PATCH', body: { addresses } }); return go('account');
  },
  addressRemove: async ({ i }) => {
    const addresses = S.profile.addresses.filter((_, n) => n !== Number(i)).map((a) => ({ label: a.label, street: a.street, phone: a.phone, isDefault: a.isDefault }));
    if (addresses.length && !addresses.some((a) => a.isDefault)) addresses[0].isDefault = true;
    await api('/api/auth/me', { method: 'PATCH', body: { addresses } }); toast('Address removed'); return go('account');
  },
  preferencesSave: async () => {
    const list = (k) => (document.querySelector(`[data-style="${k}"]`).value || '').split(',').map((v) => v.trim()).filter(Boolean);
    const groups = {};
    document.querySelectorAll('[data-pref]').forEach((el) => {
      const [group, key] = el.dataset.pref.split('.');
      groups[group] = groups[group] || {}; groups[group][key] = el.checked;
    });
    const sizeProfile = {};
    document.querySelectorAll('[data-size]').forEach((el) => { sizeProfile[el.dataset.size] = el.value.trim(); });
    await api('/api/auth/me', { method: 'PATCH', body: {
      sizeProfile, stylePreferences: { styles: list('styles'), fits: list('fits'), brands: list('brands') },
      notificationPreferences: groups.notificationPreferences, newsletterPreferences: groups.newsletterPreferences
    } });
    toast('Shopping and communication preferences saved'); return go('account');
  },
  wishlist: async ({ id }) => {
    if (!S.user) { S.after = 'account'; return go('auth'); }
    if (S.user.role !== 'customer') throw new Error('Wishlist is available to customer accounts');
    const saved = (S.profile && S.profile.wishlist || []).some((w) => (w._id || w) === id);
    await api('/api/auth/wishlist/' + id, { method: saved ? 'DELETE' : 'POST' });
    S.profile = await api('/api/auth/me'); render();
  },
  invoice: ({ id }) => {
    const o = S.orders.find((order) => order._id === id);
    if (!o) throw new Error('Order not found');
    const d = o.design || {};
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Invoice ${esc(id.slice(-6))}</title><body style="font:16px Arial,sans-serif;max-width:720px;margin:40px auto;color:#28221f"><h1>StitchNear</h1><h2>Order invoice</h2><p>Order #${esc(id)} · ${esc(fmt(o.createdAt))}</p><p>Customer: ${esc(S.profile && S.profile.name || S.user.name)}<br>Design: ${esc(d.name || 'Custom garment')} · ${esc(d.category || '')}<br>Tailor: ${esc(o.tailor && o.tailor.name || '')}<br>Cloth: ${esc(o.fabricSource === 'customer' ? 'Customer supplied' : 'Tailor supplied')} · color ${esc(o.fabricColor || '')}<br>Delivery address: ${esc(o.deliveryAddress)}</p><table style="width:100%;border-collapse:collapse"><tr><td>Stitching (${esc(o.fabric)})</td><td style="text-align:right">${R(o.tailoringCharge)}</td></tr><tr><td>Delivery</td><td style="text-align:right">${R(o.deliveryCharge)}</td></tr>${o.pickupCharge ? `<tr><td>Pickup</td><td style="text-align:right">${R(o.pickupCharge)}</td></tr>` : ''}<tr><th style="text-align:left;border-top:1px solid #ccc;padding-top:10px">Total · ${esc(o.paymentStatus === 'paid' ? 'Paid' : 'Cash on delivery')}</th><th style="text-align:right;border-top:1px solid #ccc;padding-top:10px">${R(o.totalAmount)}</th></tr></table><p>Thank you for choosing StitchNear.</p></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const link = document.createElement('a'); link.href = url; link.download = `StitchNear-invoice-${id.slice(-6)}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  cat: ({ v }) => { S.cat = v; return loadDesigns(); },
  pick: ({ id }) => {
    if (S.user && S.user.role !== 'customer') { toast('Ordering is only available to customer accounts'); return go(S.user.role === 'tailor' ? 'tailor' : 'admin'); }
    S.design = S.designs.find((d) => d._id === id); S.tid = null; S.quotes = []; S.view = 'order'; render(); scrollTo(0, 0); return loadQuotes(id);
  },
  fab: ({ v }) => { S.fabric = v; return refresh(); },
  opt: ({ k }) => { S[k] = !S[k]; return refresh(); },
  sort: ({ v }) => { S.sort = v; return refresh(); },
  loc: () => new Promise((ok, no) => navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => { S.loc = [p.coords.longitude, p.coords.latitude]; ok(refresh()); }, () => no(new Error('Location permission was denied'))) : no(new Error('Location is not available'))),
  choose: ({ id }) => { S.tid = id; render(); const e = $('#co'); if (e) e.scrollIntoView({ behavior: 'smooth' }); },
  dchoose: async ({ id }) => { S.design = S.designs.find((d) => d._id === S.qd); S.tid = id; S.view = 'order'; render(); await loadQuotes(S.design._id); const e = $('#co'); if (e) e.scrollIntoView(); },
  qd: (v) => { S.qd = v; return loadQuotes(v); }, slot: (v) => { S.slot = v; }, afarea: (v) => { S.af.area = v; }, ndcat: (v) => { S.nd.category = v; },
  place: async () => {
    if (!S.user) { S.after = 'order'; return go('auth'); }
    if (S.user.role !== 'customer') throw new Error('Only customers can place orders');
    const o = await api('/api/orders', { method: 'POST', body: { tailorId: S.tid, designId: S.design._id, fabric: S.fabric, fabricSource: S.fabricSource, fabricColor: S.fabricColor, clothPhoto: S.fabricSource === 'customer' ? S.clothPhoto : null, measurements: S.m, customizationNotes: S.notes, deliveryAddress: S.addr, contactPhone: S.phone,
      express: S.express, pickup: S.pickup, pickupSlot: S.slot || slots()[0], coordinates: S.loc } });
    S.m = {}; S.notes = ''; S.tid = null; S.clothPhoto = null; toast('Order placed. Your tailor will confirm shortly.'); return go('orders');
  },
  mode: ({ v }) => { S.mode = v; render(); }, role: ({ v }) => { S.role = v; render(); },
  spec: ({ v }) => { S.specs = S.specs.includes(v) ? S.specs.filter((x) => x !== v) : [...S.specs, v]; render(); },
  login: async () => {
    const d = await api('/api/auth/login', { method: 'POST', body: { email: S.f.email, password: S.f.password } });
    S.token = d.token; S.user = d.user; S.f = {}; sessionStorage.setItem('sn', JSON.stringify({ token: d.token, user: d.user }));
    S.profile = await api('/api/auth/me');
    S.settings = { theme: S.profile.settings && S.profile.settings.theme || S.settings.theme, language: S.profile.settings && S.profile.settings.language || S.settings.language };
    applyTheme();
    if (d.user.role === 'customer') {
      const address = (S.profile.addresses || []).find((a) => a.isDefault);
      if (address && !S.addr) { S.addr = address.street; S.phone = address.phone; }
    }
    const to = S.after || (d.user.role === 'tailor' ? 'tailor' : d.user.role === 'admin' ? 'admin' : 'home'); S.after = null;
    if (to === 'message' && S.pendingTailorId) { const id = S.pendingTailorId; S.pendingTailorId = null; return openTailorChat(id); }
    if (to === 'order' && S.design) { S.view = 'order'; render(); } else go(to);
  },
  register: async () => {
    const d = await api('/api/auth/register', { method: 'POST', body: { name: S.f.name, email: S.f.email, password: S.f.password, phone: S.f.phone, role: S.role, area: S.f.area, specialties: S.specs } });
    toast(d.message); S.mode = 'login'; S.f = { email: S.f.email }; render();
  },
  status: async ({ id, v }) => { await api(`/api/orders/${id}/status`, { method: 'PATCH', body: { status: v } }); return go(S.view); },
  cancel: async ({ id }) => {
    const reason = prompt('Why are you cancelling this order?');
    if (reason === null) return;
    if (!reason.trim()) throw new Error('Please enter a cancellation reason');
    if (reason.trim().length > 500) throw new Error('Cancellation reason must be 500 characters or fewer');
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    await api(`/api/orders/${id}/cancel`, { method: 'PATCH', body: { reason: reason.trim() } });
    toast('Order cancelled');
    return go('orders');
  },
  rate: async (v) => { if (!v) return; const [id, r] = v.split(':'); await api(`/api/orders/${id}/review`, { method: 'POST', body: { rating: Number(r) } }); toast('Thanks for rating your tailor.'); return go('orders'); },
  altopen: ({ id }) => { S.alt = id; S.af = { area: 'Waist', diff: '', note: '' }; render(); },
  altsend: async ({ id }) => { await api('/api/alterations', { method: 'POST', body: { orderId: id, area: S.af.area, diffInches: S.af.diff, note: S.af.note } }); toast('Alteration request sent.'); return go('orders'); },
  altact: async ({ id, v }) => { const body = { action: v }; if (v === 'decline') { body.reason = prompt('Reason for declining'); if (!body.reason) return; } await api('/api/alterations/' + id, { method: 'PATCH', body }); return go(S.view); },
  tprof: async ({ k }) => { await api('/api/tailors/me', { method: 'PATCH', body: { [k]: !S.prof[k] } }); return go('tailor'); },
  tsave: async () => { await api('/api/tailors/me', { method: 'PATCH', body: { rateMultiplier: Number(S.rate), capacity: Number(S.cap) } }); toast('Saved'); return go('tailor'); },
  tloc: () => new Promise((ok, no) => navigator.geolocation ? navigator.geolocation.getCurrentPosition(async (p) => { try { await api('/api/tailors/me', { method: 'PATCH', body: { lat: p.coords.latitude, lng: p.coords.longitude } }); toast('Shop location saved'); ok(go('tailor')); } catch (e) { no(e); } }, () => no(new Error('Location permission was denied'))) : no(new Error('Location is not available'))),
  approvetailor: async ({ id }) => { await api(`/api/admin/tailors/${id}/approve`, { method: 'PATCH', body: { approved: true } }); return go('admin'); },
  removetailor: async ({ id }) => {
    if (!confirm('Remove this tailor from the marketplace? This action cannot be undone.')) return;
    await api(`/api/admin/tailors/${id}`, { method: 'DELETE' }); toast('Tailor removed from marketplace'); return go('admin');
  },
  addtailor: async () => {
    const form = document.querySelector('[data-tailor-new]');
    await api('/api/admin/tailors', { method: 'POST', body: formFields(form) });
    toast('Tailor added and approved'); return go('admin');
  },
  savetailor: async ({ id }) => {
    const form = document.querySelector(`[data-tailor="${id}"]`);
    await api(`/api/admin/tailors/${id}`, { method: 'PATCH', body: formFields(form) });
    toast('Tailor updated'); return go('admin');
  },
  adddesign: async () => {
    const n = S.nd;
    await api('/api/designs', { method: 'POST', body: { name: n.name, category: n.category, startingPrice: Number(n.startingPrice), stitchDays: Number(n.stitchDays) || 4, image: n.image, description: n.description } });
    S.nd = { category: 'Blouses' }; toast('Design added'); return go('admin');
  },
  savedesign: async ({ id }) => {
    const form = document.querySelector(`[data-design="${id}"]`);
    await api(`/api/designs/${id}`, { method: 'PATCH', body: formFields(form) });
    toast('Design updated'); return go('admin');
  },
  archivedesign: async ({ id }) => {
    const design = S.adminDesigns.find((d) => d._id === id);
    if (design.active) {
      if (!confirm('Remove this design from the collection? This action cannot be undone.')) return;
      await api(`/api/designs/${id}`, { method: 'DELETE' });
    }
    else await api(`/api/designs/${id}`, { method: 'PATCH', body: { active: true } });
    toast(design.active ? 'Design removed from collection' : 'Design restored'); return go('admin');
  }
};
const fail = (e) => toast(e.message || 'Something went wrong');
setInterval(() => {
  const active = document.activeElement;
  const editing = active && ['INPUT', 'SELECT', 'TEXTAREA'].includes(active.tagName);
  if (S.view === 'tailor' && S.user && S.user.role === 'tailor' && !editing)
    loadTailorDashboard().catch(fail);
}, 15000);
document.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; e.preventDefault(); try { Promise.resolve(A[b.dataset.a](b.dataset)).catch(fail); } catch (x) { fail(x); } });
document.addEventListener('change', (e) => {
  const k = e.target.dataset.ch;
  if (k && A[k]) Promise.resolve(A[k](e.target.value)).catch(fail);
  if (e.target.dataset.setting) { S.settings[e.target.dataset.setting] = e.target.value; applyTheme(); render(); }
  if (e.target.type === 'color') render();
  if (e.target.dataset.file === 'chatImage' && e.target.files[0]) {
    compressChatImage(e.target.files[0]).then((image) => { S.pendingImage = image; render(); }).catch(fail);
  }
  if (e.target.dataset.file === 'orderClothPhoto' && e.target.files[0]) {
    compressChatImage(e.target.files[0]).then((image) => { S.clothPhoto = image; render(); }).catch(fail);
  }
});
document.addEventListener('input', (e) => {
  const p = e.target.dataset.in; if (!p) return; const [a, b] = p.split('.'); if (b) (S[a] = S[a] || {})[b] = e.target.value; else S[a] = e.target.value;
  if (p === 'af.diff') { const d = parseFloat(e.target.value); $('#hint').textContent = isNaN(d) ? 'Over 0.5 in is covered by the free fit guarantee.' : d > 0.5 ? 'Covered by the free fit guarantee.' : 'Within 0.5 in: the tailor may charge for adjustments.'; }
});
render(); go('home');
})();
