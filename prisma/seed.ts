import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, type PaymentMethod, type OrderStatus } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Real product photos: DummyJSON CDN + Wikimedia Commons
const dj = (cat: string, slug: string, n = 3) =>
  Array.from({ length: n }, (_, i) => `https://cdn.dummyjson.com/product-images/${cat}/${slug}/${i + 1}.webp`);
const wm = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/960px-${path.split("/").pop()}`;

const categories = [
  { name: "Laptops", description: "Ultrabooks, workstations and everyday laptops", icon: "laptop" },
  { name: "Desktops", description: "Office and home desktop computers", icon: "monitor" },
  { name: "Smartphones", description: "iPhone, Samsung, Oppo, Realme, Vivo and more", icon: "smartphone" },
  { name: "Tablets", description: "iPads and Android tablets", icon: "tablet" },
  { name: "Audio", description: "Headphones, earbuds and smart speakers", icon: "headphones" },
  { name: "Keyboards & Mice", description: "Wireless, mechanical and compact keyboards", icon: "keyboard" },
  { name: "Storage", description: "SSDs, hard drives and portable storage", icon: "hard-drive" },
  { name: "Memory (RAM)", description: "DDR3 and DDR4 memory upgrades", icon: "memory-stick" },
  { name: "Chargers & Power", description: "Chargers, power banks and adapters", icon: "battery-charging" },
  { name: "Accessories", description: "Monitors, webcams, watches and cases", icon: "watch" },
];

type P = {
  name: string; brand: string; category: string; price: number; compare?: number; stock: number;
  images: string[]; featured?: boolean; sold?: number; description: string; highlights: string[];
  specs: Record<string, string>;
};

const products: P[] = [
  // Laptops
  { name: "Apple MacBook Pro 14-inch Space Grey", brand: "Apple", category: "Laptops", price: 1999, compare: 2199, stock: 6, featured: true, sold: 21,
    images: dj("laptops", "apple-macbook-pro-14-inch-space-grey"),
    description: "A pro-grade laptop for developers, designers and creators. The MacBook Pro 14 combines Apple silicon performance with a stunning Liquid Retina XDR display and all-day battery life.",
    highlights: ["Apple M-series chip with 10-core CPU", "14.2-inch Liquid Retina XDR display", "Up to 17 hours battery life"],
    specs: { Processor: "Apple M1 Pro (10-core CPU)", RAM: "16 GB unified memory", Storage: "512 GB SSD", Display: "14.2\" 3024×1964 XDR", Battery: "Up to 17 hours", Weight: "1.6 kg", Warranty: "1 year" } },
  { name: "ASUS Zenbook Pro Duo Dual Screen", brand: "ASUS", category: "Laptops", price: 1799, stock: 4, sold: 8,
    images: dj("laptops", "asus-zenbook-pro-dual-screen-laptop"),
    description: "Two screens, endless possibilities. The Zenbook Pro Duo adds a full-width ScreenPad Plus above the keyboard, perfect for video editing, coding and multitasking.",
    highlights: ["Second 14\" ScreenPad Plus touchscreen", "Intel Core i9 + NVIDIA RTX graphics", "4K OLED main display"],
    specs: { Processor: "Intel Core i9-10980HK", RAM: "32 GB DDR4", Storage: "1 TB NVMe SSD", Display: "15.6\" 4K OLED touch", Graphics: "NVIDIA RTX 2060", Weight: "2.5 kg", Warranty: "1 year" } },
  { name: "Huawei MateBook X Pro", brand: "Huawei", category: "Laptops", price: 1199, compare: 1399, stock: 7, featured: true, sold: 14,
    images: dj("laptops", "huawei-matebook-x-pro"),
    description: "Thin, light and beautifully built. The MateBook X Pro features a near-borderless 3K touchscreen and an all-metal body that slips easily into any bag.",
    highlights: ["3K FullView touchscreen", "Ultra-slim 14.6 mm metal body", "Fast charging: 3 hours of use in 15 minutes"],
    specs: { Processor: "Intel Core i7", RAM: "16 GB LPDDR4X", Storage: "1 TB SSD", Display: "13.9\" 3000×2000 touch", Weight: "1.33 kg", Warranty: "1 year" } },
  { name: "Lenovo Yoga 920 2-in-1", brand: "Lenovo", category: "Laptops", price: 899, compare: 999, stock: 9, sold: 11,
    images: dj("laptops", "lenovo-yoga-920"),
    description: "A flexible 2-in-1 that works as a laptop, tablet or presentation stand thanks to its 360° watchband hinge. Great for students and professionals on the move.",
    highlights: ["360° convertible design", "Pen support for notes and sketching", "Thunderbolt 3 ports"],
    specs: { Processor: "Intel Core i7-8550U", RAM: "8 GB DDR4", Storage: "256 GB SSD", Display: "13.9\" FHD touch", Weight: "1.37 kg", Warranty: "1 year" } },
  { name: "Dell XPS 13 9300", brand: "Dell", category: "Laptops", price: 1299, stock: 5, featured: true, sold: 17,
    images: dj("laptops", "new-dell-xps-13-9300-laptop"),
    description: "The compact laptop by which others are judged. The XPS 13 packs a 16:10 InfinityEdge display into a machined aluminium body that is smaller than most 13-inch laptops.",
    highlights: ["16:10 InfinityEdge display", "Premium CNC aluminium design", "Long battery life for full workdays"],
    specs: { Processor: "Intel Core i7-1065G7", RAM: "16 GB LPDDR4x", Storage: "512 GB SSD", Display: "13.4\" FHD+", Weight: "1.2 kg", Warranty: "1 year" } },

  // Desktops
  { name: "Dell OptiPlex 3060 Small Form Factor", brand: "Dell", category: "Desktops", price: 449, compare: 499, stock: 12, sold: 9,
    images: [wm("0/0d/Dell_OptiPlex_3060_SFF.jpg")],
    description: "A reliable, compact desktop for offices, schools and internet cafés. Fast enough for everyday business apps and easy to service and upgrade.",
    highlights: ["Space-saving small form factor", "Intel 8th-gen Core i5", "Easy tool-less upgrades"],
    specs: { Processor: "Intel Core i5-8500", RAM: "8 GB DDR4", Storage: "256 GB SSD", OS: "Windows 11 Pro", Ports: "USB 3.1, DisplayPort, HDMI", Warranty: "1 year" } },
  { name: "Dell OptiPlex 5060 Micro", brand: "Dell", category: "Desktops", price: 399, stock: 3, sold: 6,
    images: [wm("b/bf/Dell_OptiPlex_5060_Micro.jpg")],
    description: "A tiny but capable PC that mounts behind a monitor or under a desk. Ideal for reception desks, point-of-sale and home offices with limited space.",
    highlights: ["Ultra-compact 1.2 L chassis", "Silent, low-power operation", "VESA-mountable"],
    specs: { Processor: "Intel Core i5-8500T", RAM: "8 GB DDR4", Storage: "256 GB NVMe SSD", OS: "Windows 11 Pro", Warranty: "1 year" } },

  // Smartphones
  { name: "iPhone 13 Pro", brand: "Apple", category: "Smartphones", price: 899, compare: 999, stock: 8, featured: true, sold: 34,
    images: dj("smartphones", "iphone-13-pro"),
    description: "Pro camera system, ProMotion display and A15 Bionic performance. The iPhone 13 Pro shoots stunning photos day and night and lasts all day on a single charge.",
    highlights: ["Triple 12MP Pro camera system", "6.1\" Super Retina XDR with ProMotion", "A15 Bionic chip"],
    specs: { Display: "6.1\" OLED 120Hz", Chip: "A15 Bionic", Storage: "128 GB", Camera: "12MP triple + LiDAR", Battery: "3095 mAh", Network: "5G", Warranty: "1 year" } },
  { name: "iPhone X", brand: "Apple", category: "Smartphones", price: 349, stock: 10, sold: 19,
    images: dj("smartphones", "iphone-x"),
    description: "The iPhone that started the all-screen era. A great-value iPhone with Face ID, an edge-to-edge OLED display and a dual camera.",
    highlights: ["5.8\" Super Retina OLED", "Face ID", "Dual 12MP cameras"],
    specs: { Display: "5.8\" OLED", Chip: "A11 Bionic", Storage: "64 GB", Camera: "12MP dual", Network: "4G LTE", Warranty: "6 months" } },
  { name: "Samsung Galaxy S10", brand: "Samsung", category: "Smartphones", price: 329, compare: 379, stock: 11, sold: 22,
    images: dj("smartphones", "samsung-galaxy-s10"),
    description: "A flagship experience at a friendly price. The Galaxy S10 brings a Dynamic AMOLED display, ultrasonic fingerprint sensor and a versatile triple camera.",
    highlights: ["6.1\" Dynamic AMOLED display", "Triple rear camera with ultra-wide", "Wireless PowerShare"],
    specs: { Display: "6.1\" Dynamic AMOLED", RAM: "8 GB", Storage: "128 GB", Camera: "12MP + 12MP + 16MP", Battery: "3400 mAh", Warranty: "6 months" } },
  { name: "Samsung Galaxy S8", brand: "Samsung", category: "Smartphones", price: 199, stock: 6, sold: 12,
    images: dj("smartphones", "samsung-galaxy-s8"),
    description: "Sleek curved design and a bright Infinity Display. A dependable Samsung phone for calls, social media and mobile money apps.",
    highlights: ["5.8\" Infinity Display", "Water and dust resistant (IP68)", "Expandable storage"],
    specs: { Display: "5.8\" Super AMOLED", RAM: "4 GB", Storage: "64 GB", Camera: "12MP", Battery: "3000 mAh", Warranty: "6 months" } },
  { name: "Oppo F19 Pro+ 5G", brand: "Oppo", category: "Smartphones", price: 279, stock: 14, sold: 15,
    images: dj("smartphones", "oppo-f19-pro-plus"),
    description: "Fast 5G, 50W flash charging and a 48MP quad camera. The F19 Pro+ is built for people who are always on the move.",
    highlights: ["50W Flash Charge", "48MP AI quad camera", "5G ready"],
    specs: { Display: "6.43\" AMOLED", RAM: "8 GB", Storage: "128 GB", Camera: "48MP quad", Battery: "4310 mAh", Network: "5G", Warranty: "1 year" } },
  { name: "Oppo K1", brand: "Oppo", category: "Smartphones", price: 189, stock: 9, sold: 7,
    images: dj("smartphones", "oppo-k1", 4),
    description: "An affordable phone with an in-display fingerprint sensor and a big AMOLED screen for videos and gaming.",
    highlights: ["In-display fingerprint", "6.4\" AMOLED display", "25MP selfie camera"],
    specs: { Display: "6.4\" AMOLED", RAM: "6 GB", Storage: "64 GB", Battery: "3600 mAh", Warranty: "1 year" } },
  { name: "Realme XT", brand: "Realme", category: "Smartphones", price: 219, stock: 15, sold: 10,
    images: dj("smartphones", "realme-xt"),
    description: "A 64MP quad camera phone at a budget price. Capture sharp detail, wide landscapes and close-up macro shots.",
    highlights: ["64MP quad camera", "20W VOOC fast charging", "Super AMOLED display"],
    specs: { Display: "6.4\" Super AMOLED", RAM: "6 GB", Storage: "128 GB", Battery: "4000 mAh", Warranty: "1 year" } },
  { name: "Realme C35", brand: "Realme", category: "Smartphones", price: 139, stock: 25, featured: true, sold: 41,
    images: dj("smartphones", "realme-c35"),
    description: "The best-value everyday smartphone. Big battery, big screen and a 50MP camera, perfect as a first smartphone or a reliable backup phone.",
    highlights: ["5000 mAh battery", "50MP AI triple camera", "6.6\" FHD+ display"],
    specs: { Display: "6.6\" FHD+", RAM: "4 GB", Storage: "64 GB", Battery: "5000 mAh", Warranty: "1 year" } },
  { name: "Vivo V9", brand: "Vivo", category: "Smartphones", price: 179, stock: 8, sold: 5,
    images: dj("smartphones", "vivo-v9"),
    description: "A stylish phone with a 24MP AI selfie camera and a full-view display. Great for photos and video calls.",
    highlights: ["24MP AI selfie camera", "6.3\" FullView display", "Face Access unlock"],
    specs: { Display: "6.3\" IPS LCD", RAM: "4 GB", Storage: "64 GB", Battery: "3260 mAh", Warranty: "1 year" } },
  { name: "Vivo X21", brand: "Vivo", category: "Smartphones", price: 259, stock: 2, sold: 4,
    images: dj("smartphones", "vivo-x21"),
    description: "One of the first phones with an in-display fingerprint scanner. Premium glass design with a sharp Super AMOLED screen.",
    highlights: ["In-display fingerprint scanner", "Super AMOLED display", "Dual-pixel camera"],
    specs: { Display: "6.28\" Super AMOLED", RAM: "6 GB", Storage: "128 GB", Battery: "3200 mAh", Warranty: "1 year" } },

  // Tablets
  { name: "iPad mini 2021 Starlight", brand: "Apple", category: "Tablets", price: 499, stock: 7, featured: true, sold: 13,
    images: dj("tablets", "ipad-mini-2021-starlight", 4),
    description: "Mega power in a mini design. The iPad mini fits in one hand and is perfect for reading, note-taking with Apple Pencil, and entertainment on the go.",
    highlights: ["8.3\" Liquid Retina display", "A15 Bionic chip", "USB-C and Apple Pencil support"],
    specs: { Display: "8.3\" Liquid Retina", Chip: "A15 Bionic", Storage: "64 GB", Connectivity: "Wi-Fi", Warranty: "1 year" } },
  { name: "Samsung Galaxy Tab S8+ Grey", brand: "Samsung", category: "Tablets", price: 649, compare: 749, stock: 5, sold: 6,
    images: dj("tablets", "samsung-galaxy-tab-s8-plus-grey", 4),
    description: "A premium Android tablet with a vivid Super AMOLED display and an S Pen included in the box. Ideal for study, work and creativity.",
    highlights: ["12.4\" Super AMOLED 120Hz", "S Pen included", "DeX desktop mode"],
    specs: { Display: "12.4\" Super AMOLED", RAM: "8 GB", Storage: "128 GB", Battery: "10090 mAh", Warranty: "1 year" } },
  { name: "Samsung Galaxy Tab White", brand: "Samsung", category: "Tablets", price: 299, stock: 10, sold: 9,
    images: dj("tablets", "samsung-galaxy-tab-white", 4),
    description: "An affordable family tablet for videos, online classes and browsing, with a big screen and long battery life.",
    highlights: ["10.5\" display", "Long-lasting battery", "Kids mode"],
    specs: { Display: "10.5\" TFT", RAM: "3 GB", Storage: "32 GB", Battery: "7300 mAh", Warranty: "1 year" } },

  // Audio
  { name: "Apple AirPods", brand: "Apple", category: "Audio", price: 129, stock: 20, featured: true, sold: 38,
    images: dj("mobile-accessories", "apple-airpods"),
    description: "Wireless audio made simple. AirPods connect instantly to your iPhone and deliver clear sound and calls with a charging case for all-day listening.",
    highlights: ["Instant pairing with iPhone", "Up to 24 hours with case", "Hey Siri support"],
    specs: { Type: "True wireless earbuds", Battery: "5 h (24 h with case)", Connectivity: "Bluetooth 5.0", Warranty: "1 year" } },
  { name: "Apple AirPods Max Silver", brand: "Apple", category: "Audio", price: 549, stock: 3, sold: 4,
    images: dj("mobile-accessories", "apple-airpods-max-silver", 1),
    description: "High-fidelity over-ear headphones with industry-leading Active Noise Cancellation and spatial audio. Premium materials and all-day comfort.",
    highlights: ["Active Noise Cancellation", "Spatial audio", "20 hours battery"],
    specs: { Type: "Over-ear", Battery: "20 hours", Connectivity: "Bluetooth 5.0", Warranty: "1 year" } },
  { name: "Beats Flex Wireless Earphones", brand: "Beats", category: "Audio", price: 49, stock: 30, sold: 27,
    images: dj("mobile-accessories", "beats-flex-wireless-earphones", 1),
    description: "Everyday wireless earphones with magnetic earbuds that auto-pause music. Light, comfortable and great value.",
    highlights: ["12 hours of listening", "Magnetic auto-pause earbuds", "Fast Fuel charging"],
    specs: { Type: "Neckband earphones", Battery: "12 hours", Connectivity: "Bluetooth Class 1", Warranty: "1 year" } },
  { name: "Amazon Echo Plus Smart Speaker", brand: "Amazon", category: "Audio", price: 89, stock: 8, sold: 5,
    images: dj("mobile-accessories", "amazon-echo-plus", 2),
    description: "A smart speaker with room-filling sound and a built-in smart home hub. Play music, set alarms and control devices with your voice.",
    highlights: ["Premium 360° sound", "Built-in smart home hub", "Voice control"],
    specs: { Type: "Smart speaker", Connectivity: "Wi-Fi, Bluetooth, Zigbee", Warranty: "1 year" } },
  { name: "Apple HomePod mini Cosmic Grey", brand: "Apple", category: "Audio", price: 99, stock: 6, sold: 3,
    images: dj("mobile-accessories", "apple-homepod-mini-cosmic-grey", 1),
    description: "Big sound in a small speaker. HomePod mini delivers rich 360° audio and works seamlessly with your iPhone.",
    highlights: ["360° computational audio", "Handoff from iPhone", "Compact design"],
    specs: { Type: "Smart speaker", Connectivity: "Wi-Fi, Bluetooth 5.0", Warranty: "1 year" } },

  // Keyboards & Mice
  { name: "Apple Magic Keyboard", brand: "Apple", category: "Keyboards & Mice", price: 99, stock: 9, sold: 8,
    images: [wm("b/b3/Apple_Magic_Keyboard_-_US.jpg")],
    description: "A slim, rechargeable wireless keyboard with a stable scissor mechanism for comfortable, precise typing on Mac, iPad and iPhone.",
    highlights: ["Rechargeable — about a month per charge", "Scissor-switch keys", "Pairs automatically with Mac"],
    specs: { Layout: "US English", Connectivity: "Bluetooth / Lightning", Battery: "Built-in rechargeable", Warranty: "1 year" } },
  { name: "Logitech K380 Multi-Device Keyboard", brand: "Logitech", category: "Keyboards & Mice", price: 39, stock: 18, featured: true, sold: 25,
    images: [wm("e/e6/Logitech_K380_CJK_Keyboard.jpg")],
    description: "Type on your computer, tablet and phone with one compact keyboard. Switch between three devices at the touch of a button.",
    highlights: ["Connect up to 3 devices", "2-year battery life", "Compact and portable"],
    specs: { Connectivity: "Bluetooth", Battery: "2 × AAA (up to 2 years)", Compatibility: "Windows, macOS, Android, iOS", Warranty: "1 year" } },
  { name: "RGB Mechanical Gaming Keyboard", brand: "Redragon", category: "Keyboards & Mice", price: 59, compare: 75, stock: 13, sold: 16,
    images: [wm("7/7f/Beautiful_Mechanical_Keyboard.jpg")],
    description: "Tactile mechanical switches and vibrant RGB lighting for gaming and fast typing. Durable build with anti-ghosting on every key.",
    highlights: ["Mechanical switches", "Full RGB backlight", "100% anti-ghosting"],
    specs: { Switches: "Blue (clicky)", Connectivity: "USB wired", Backlight: "RGB", Warranty: "1 year" } },

  // Storage
  { name: "Samsung 860 EVO 250GB SATA SSD", brand: "Samsung", category: "Storage", price: 39, stock: 22, featured: true, sold: 30,
    images: [wm("2/21/SSD-Samsung-EVO-860-250Gb.jpg")],
    description: "The easiest upgrade for an old laptop or PC. Replace a slow hard drive with this SSD and boot Windows in seconds.",
    highlights: ["Up to 550 MB/s read speed", "2.5\" SATA — fits most laptops", "5-year limited warranty"],
    specs: { Capacity: "250 GB", Interface: "SATA III 6Gb/s", "Read speed": "550 MB/s", "Write speed": "520 MB/s", "Form factor": "2.5 inch", Warranty: "5 years" } },
  { name: "TechPro 256GB NVMe M.2 2230 SSD", brand: "TechPro", category: "Storage", price: 35, stock: 16, sold: 11,
    images: ["https://upload.wikimedia.org/wikipedia/commons/6/6f/256GB_2230_NVME_SSD.jpg"],
    description: "A compact high-speed NVMe drive for ultrabooks, Steam Deck and mini PCs that use the short M.2 2230 slot.",
    highlights: ["NVMe PCIe speeds", "M.2 2230 compact size", "Low power consumption"],
    specs: { Capacity: "256 GB", Interface: "PCIe NVMe", "Form factor": "M.2 2230", Warranty: "3 years" } },
  { name: "Seagate 1TB Portable External Hard Drive", brand: "Seagate", category: "Storage", price: 59, stock: 14, sold: 18,
    images: [wm("c/cb/Seagate_SRD0NF1_portable_hard_drive_HS1.jpg"), wm("a/a4/Seagate_SRD0NF1_portable_hard_drive_HS2.jpg")],
    description: "Back up your photos, documents and videos. Plug-and-play USB storage that works with Windows and Mac with no setup.",
    highlights: ["1 TB of portable storage", "USB 3.0 plug-and-play", "Pocket-size design"],
    specs: { Capacity: "1 TB", Interface: "USB 3.0", Compatibility: "Windows, macOS", Warranty: "2 years" } },
  { name: "WD 1TB Internal Hard Drive 3.5\"", brand: "Western Digital", category: "Storage", price: 45, stock: 10, sold: 7,
    images: [wm("1/10/Hard_disk_WD3000HLFS_IMGP6577_wp.jpg")],
    description: "Reliable bulk storage for desktop PCs and CCTV recorders. A cost-effective way to store large files.",
    highlights: ["7200 RPM", "3.5\" desktop drive", "SATA interface"],
    specs: { Capacity: "1 TB", Interface: "SATA III", Speed: "7200 RPM", "Form factor": "3.5 inch", Warranty: "2 years" } },

  // Memory
  { name: "Corsair Vengeance 8GB (2×4GB) DDR3 1600MHz", brand: "Corsair", category: "Memory (RAM)", price: 29, stock: 12, sold: 9,
    images: [wm("e/e2/2014_Corsair_Vengeance_2x4GB%2C_1600MHz.jpg")],
    description: "Give an older desktop PC a speed boost. A dual-channel kit with aluminium heat spreaders for stable performance.",
    highlights: ["2 × 4GB dual-channel kit", "1600 MHz", "Aluminium heat spreaders"],
    specs: { Capacity: "8 GB (2 × 4 GB)", Type: "DDR3 DIMM", Speed: "1600 MHz", Warranty: "Lifetime limited" } },
  { name: "TechPro 16GB DDR4 3200MHz Desktop RAM", brand: "TechPro", category: "Memory (RAM)", price: 45, stock: 20, featured: true, sold: 23,
    images: [wm("6/6c/RAM_Module_%28SDRAM-DDR4%29.jpg")],
    description: "Upgrade to 16GB and run more browser tabs, apps and games without slowdowns. Compatible with most modern desktop motherboards.",
    highlights: ["16 GB single module", "3200 MHz DDR4", "Plug-and-play"],
    specs: { Capacity: "16 GB", Type: "DDR4 DIMM", Speed: "3200 MHz", Voltage: "1.2 V", Warranty: "3 years" } },

  // Chargers & Power
  { name: "Apple 20W USB-C iPhone Charger", brand: "Apple", category: "Chargers & Power", price: 19, stock: 40, sold: 45,
    images: dj("mobile-accessories", "apple-iphone-charger", 2),
    description: "Fast, safe charging for iPhone and iPad. Charge an iPhone up to 50% in about 30 minutes.",
    highlights: ["20W fast charging", "USB-C port", "Original Apple adapter"],
    specs: { Output: "20 W", Port: "USB-C", Compatibility: "iPhone 8 and later, iPad", Warranty: "1 year" } },
  { name: "Apple MagSafe Battery Pack", brand: "Apple", category: "Chargers & Power", price: 89, stock: 7, sold: 6,
    images: dj("mobile-accessories", "apple-magsafe-battery-pack", 2),
    description: "Snap it on the back of your iPhone for extra battery whenever you need it — no cables required.",
    highlights: ["Magnetic MagSafe attachment", "Wireless charging on the go", "Compact design"],
    specs: { Compatibility: "iPhone 12 and later", Charging: "MagSafe wireless", Warranty: "1 year" } },
  { name: "Wireless Charging Pad", brand: "Apple", category: "Chargers & Power", price: 39, stock: 2, sold: 3,
    images: dj("mobile-accessories", "apple-airpower-wireless-charger", 1),
    description: "Drop your phone on the pad and it starts charging. Works with any Qi-enabled phone and earbuds.",
    highlights: ["Qi wireless charging", "Slim design", "LED status indicator"],
    specs: { Output: "15 W", Standard: "Qi", Warranty: "1 year" } },
  { name: "65W USB-C Laptop Charger (Dell / HP / Lenovo)", brand: "TechPro", category: "Chargers & Power", price: 35, stock: 15, featured: true, sold: 20,
    images: [wm("a/a3/USB-C-PD_to_Dell_Adapter_2.jpg")],
    description: "Replace a lost or broken laptop charger. Universal USB-C Power Delivery charger with adapters for popular laptop brands.",
    highlights: ["65W USB-C Power Delivery", "Works with most USB-C laptops", "Overheat and surge protection"],
    specs: { Output: "65 W", Port: "USB-C PD", Compatibility: "Dell, HP, Lenovo, MacBook", Warranty: "1 year" } },

  // Accessories
  { name: "Apple Watch Series 4 Gold", brand: "Apple", category: "Accessories", price: 199, compare: 249, stock: 5, sold: 8,
    images: dj("mobile-accessories", "apple-watch-series-4-gold"),
    description: "Track your fitness, heart rate and notifications from your wrist. A great companion for your iPhone.",
    highlights: ["Heart-rate and ECG", "Fall detection", "Water resistant 50m"],
    specs: { Case: "44 mm gold aluminium", Display: "Retina OLED", Battery: "18 hours", Warranty: "1 year" } },
  { name: "iPhone 12 Silicone Case with MagSafe", brand: "Apple", category: "Accessories", price: 25, stock: 35, sold: 29,
    images: dj("mobile-accessories", "iphone-12-silicone-case-with-magsafe-plum", 4),
    description: "Soft-touch silicone protection with built-in magnets for MagSafe chargers and accessories.",
    highlights: ["Built-in MagSafe magnets", "Soft microfibre lining", "Drop protection"],
    specs: { Compatibility: "iPhone 12 / 12 Pro", Material: "Silicone", Colour: "Plum", Warranty: "6 months" } },
  { name: "TechPro 24\" Full HD IPS Monitor", brand: "TechPro", category: "Accessories", price: 149, compare: 179, stock: 8, sold: 10,
    images: [wm("7/73/Monitor_-_Flickr_-_davispuh.jpg")],
    description: "A sharp 24-inch Full HD IPS monitor for work and entertainment, with wide viewing angles and slim bezels.",
    highlights: ["24\" Full HD IPS panel", "75Hz refresh rate", "HDMI + VGA inputs"],
    specs: { Size: "24 inch", Resolution: "1920×1080", Panel: "IPS", "Refresh rate": "75 Hz", Warranty: "1 year" } },
  { name: "TechPro 1080p HD Webcam", brand: "TechPro", category: "Accessories", price: 39, stock: 17, sold: 14,
    images: [wm("5/55/Webcam_01.jpg")],
    description: "Look sharp in online classes and Zoom meetings. Full HD video with a built-in microphone and plug-and-play USB.",
    highlights: ["1080p Full HD video", "Built-in noise-reducing mic", "Plug-and-play USB"],
    specs: { Resolution: "1920×1080 @ 30fps", Connection: "USB 2.0", Microphone: "Built-in", Warranty: "1 year" } },
];

const CITIES = ["Mogadishu", "Hargeisa", "Garowe", "Bosaso", "Kismayo", "Baidoa", "Galkayo", "Beledweyne"];
const METHODS: PaymentMethod[] = ["EVC_PLUS", "ZAAD", "SAHAL", "EDAHAB", "CASH_ON_DELIVERY"];

async function main() {
  console.log("Clearing data…");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.brand.deleteMany();

  console.log("Categories & brands…");
  const catMap = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const row = await db.category.create({
      data: { name: c.name, slug: slugify(c.name), description: c.description, image: c.icon, sortOrder: i },
    });
    catMap.set(c.name, row.id);
  }
  const brandMap = new Map<string, string>();
  for (const b of [...new Set(products.map((p) => p.brand))]) {
    const row = await db.brand.create({ data: { name: b, slug: slugify(b) } });
    brandMap.set(b, row.id);
  }

  console.log("Products…");
  const now = Date.now();
  const created = [];
  for (const [i, p] of products.entries()) {
    created.push(
      await db.product.create({
        data: {
          name: p.name, slug: slugify(p.name), description: p.description, highlights: p.highlights,
          price: p.price, comparePrice: p.compare ?? null, stock: p.stock, specs: p.specs, images: p.images,
          featured: p.featured ?? false, soldCount: p.sold ?? 0,
          categoryId: catMap.get(p.category)!, brandId: brandMap.get(p.brand)!,
          createdAt: new Date(now - (products.length - i) * 36e5 * 7), // staggered for "New arrivals"
        },
      })
    );
  }

  console.log("Users…");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@onlinetech.so";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe-Admin-2026";
  const customerEmail = process.env.DEMO_CUSTOMER_EMAIL ?? "customer@onlinetech.so";
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD ?? "ChangeMe-Customer-2026";

  async function upsertUser(email: string, password: string, name: string, role: "ADMIN" | "CUSTOMER", phone: string) {
    const user = await db.user.upsert({
      where: { email },
      update: { role, emailVerified: true, name },
      create: { id: crypto.randomUUID(), email, name, role, emailVerified: true, phone },
    });
    await db.account.deleteMany({ where: { userId: user.id, providerId: "credential" } });
    await db.account.create({
      data: { id: crypto.randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: await hashPassword(password) },
    });
    return user;
  }
  await upsertUser(adminEmail, adminPassword, "OnlineTech Admin", "ADMIN", "+252610000001");
  const customer = await upsertUser(customerEmail, customerPassword, "Amina Hassan", "CUSTOMER", "+252615550123");

  console.log("Sample orders for the dashboard…");
  const statuses: OrderStatus[] = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "PROCESSING", "PAID", "PENDING", "CANCELLED"];
  for (let i = 0; i < 28; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now - daysAgo * 864e5 - Math.random() * 864e5);
    const picks = [...created].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 3));
    const items = picks.map((p) => ({ productId: p.id, name: p.name, image: p.images[0], unitPrice: p.price, quantity: 1 + Math.floor(Math.random() * 2) }));
    const subtotal = items.reduce((s, it) => s + Number(it.unitPrice) * it.quantity, 0);
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const deliveryFee = city === "Mogadishu" ? (subtotal >= 300 ? 0 : 2) : city === "Hargeisa" ? 3 : 4;
    const method = METHODS[Math.floor(Math.random() * METHODS.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paid = status !== "PENDING" && status !== "CANCELLED" && (method !== "CASH_ON_DELIVERY" || status === "DELIVERED");
    await db.order.create({
      data: {
        orderNumber: `OT-${createdAt.toISOString().slice(2, 10).replace(/-/g, "")}-${String(1000 + i)}`,
        userId: customer.id, status, paymentMethod: method, paymentStatus: paid ? "PAID" : "UNPAID",
        transactionRef: paid && method !== "CASH_ON_DELIVERY" ? `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}` : null,
        subtotal, deliveryFee, total: subtotal + deliveryFee,
        fullName: "Amina Hassan", phone: "+252615550123", city, district: "Hodan", landmark: "Near KM4 junction",
        createdAt, items: { create: items },
      },
    });
  }

  console.log(`Done: ${created.length} products, ${categories.length} categories, 28 orders.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
