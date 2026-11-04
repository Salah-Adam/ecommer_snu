import {
  BatteryCharging, HardDrive, Headphones, Keyboard, Laptop, MemoryStick, Monitor, Smartphone, Tablet, Watch,
  type LucideIcon,
} from "lucide-react";

export const SHOP_CATEGORIES: { label: string; slug: string; icon: LucideIcon; desc: string }[] = [
  { label: "Laptops", slug: "laptops", icon: Laptop, desc: "MacBook, Dell XPS, Lenovo" },
  { label: "Desktops", slug: "desktops", icon: Monitor, desc: "Office & home PCs" },
  { label: "Smartphones", slug: "smartphones", icon: Smartphone, desc: "iPhone, Samsung, Oppo" },
  { label: "Tablets", slug: "tablets", icon: Tablet, desc: "iPad & Galaxy Tab" },
  { label: "Audio", slug: "audio", icon: Headphones, desc: "AirPods, speakers" },
  { label: "Keyboards & Mice", slug: "keyboards-and-mice", icon: Keyboard, desc: "Wireless & mechanical" },
  { label: "Storage", slug: "storage", icon: HardDrive, desc: "SSD, HDD, portable" },
  { label: "Memory (RAM)", slug: "memory-ram", icon: MemoryStick, desc: "DDR3 & DDR4" },
  { label: "Chargers & Power", slug: "chargers-and-power", icon: BatteryCharging, desc: "Chargers, power banks" },
  { label: "Accessories", slug: "accessories", icon: Watch, desc: "Monitors, webcams, cases" },
];

export const MAIN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products?deals=1", label: "Deals" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/account/orders", label: "Track Order" },
];
