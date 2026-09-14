export type ProductCategory = "panel" | "inverter" | "battery" | "portable" | "system";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  brand: string;
  brandLabel: string;
  power: string;
  priceText: string;
  price: number | null;
  oldPriceText: string | null;
  oldPrice: number | null;
  apps: string[];
  search: string;
  warranty: string;
  image: string;
  role: string;
  bestFor: string[];
  physical?: {
    modelReference?: string;
    dimensionsMm?: {
      length: number;
      width: number;
      depth: number;
    };
    foldedDimensionsMm?: {
      length: number;
      width: number;
      depth: number;
    };
    weightKg?: number;
  };
  featuredOrder: number;
};

export const products: Product[] = [
  {
    "id": "ecoflow45",
    "name": "EcoFlow 45W Portable Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "ecoflow",
    "brandLabel": "EcoFlow",
    "power": "45 W",
    "priceText": "৳ 6,500",
    "price": 6500,
    "oldPriceText": "৳ 6,900",
    "oldPrice": 6900,
    "apps": [
      "home",
      "portable"
    ],
    "search": "ecoflow 45w portable solar panel ecoflow solar panel 45 w home portable portable compact pv outdoor",
    "warranty": "See current listing",
    "image": "/assets/products-real/ecoflow45.jpg",
    "role": "Generation",
    "bestFor": [
      "Portable",
      "Compact PV",
      "Outdoor"
    ],
    "physical": {
      "modelReference": "EcoFlow 45W Portable Solar Panel",
      "dimensionsMm": {
        "length": 980,
        "width": 309,
        "depth": 25
      },
      "foldedDimensionsMm": {
        "length": 222,
        "width": 309,
        "depth": 45
      },
      "weightKg": 1.4
    },
    "featuredOrder": 0
  },
  {
    "id": "ecoflow60",
    "name": "EcoFlow 60W Portable Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "ecoflow",
    "brandLabel": "EcoFlow",
    "power": "60 W",
    "priceText": "৳ 9,500",
    "price": 9500,
    "oldPriceText": "৳ 10,500",
    "oldPrice": 10500,
    "apps": [
      "home",
      "portable"
    ],
    "search": "ecoflow 60w portable solar panel ecoflow solar panel 60 w home portable portable compact pv outdoor",
    "warranty": "See current listing",
    "image": "/assets/products-real/ecoflow60.jpg",
    "role": "Generation",
    "bestFor": [
      "Portable",
      "Compact PV",
      "Outdoor"
    ],
    "physical": {
      "modelReference": "EcoFlow 60W Portable Solar Panel",
      "dimensionsMm": {
        "length": 1356,
        "width": 309,
        "depth": 25
      },
      "foldedDimensionsMm": {
        "length": 317,
        "width": 309,
        "depth": 45
      },
      "weightKg": 2.0
    },
    "featuredOrder": 1
  },
  {
    "id": "ecoflow160",
    "name": "EcoFlow 160W Portable Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "ecoflow",
    "brandLabel": "EcoFlow",
    "power": "160 W",
    "priceText": "৳ 24,300",
    "price": 24300,
    "oldPriceText": "৳ 25,700",
    "oldPrice": 25700,
    "apps": [
      "home",
      "portable"
    ],
    "search": "ecoflow 160w portable solar panel ecoflow solar panel 160 w home portable portable higher portable output outdoor",
    "warranty": "See current listing",
    "image": "/assets/products-real/ecoflow160.jpg",
    "role": "Generation",
    "bestFor": [
      "Portable",
      "Higher portable output",
      "Outdoor"
    ],
    "physical": {
      "modelReference": "EcoFlow 160W Portable Solar Panel",
      "dimensionsMm": {
        "length": 1570,
        "width": 680,
        "depth": 24
      },
      "foldedDimensionsMm": {
        "length": 420,
        "width": 680,
        "depth": 24
      },
      "weightKg": 5.6
    },
    "featuredOrder": 2
  },
  {
    "id": "jinko590",
    "name": "Jinko Tiger Neo 590W Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "jinko",
    "brandLabel": "Jinko",
    "power": "590 W",
    "priceText": "৳ 11,990",
    "price": 11990,
    "oldPriceText": "৳ 14,990",
    "oldPrice": 14990,
    "apps": [
      "home",
      "business",
      "industrial"
    ],
    "search": "jinko tiger neo 590w solar panel jinko solar panel 590 w home business industrial residential commercial roof-efficient pv",
    "warranty": "25 years listed",
    "image": "/assets/products-real/jinko590.jpg",
    "role": "Generation",
    "bestFor": [
      "Residential",
      "Commercial",
      "Roof-efficient PV"
    ],
    "physical": {
      "modelReference": "Jinko JKM590N-72HL4 family",
      "dimensionsMm": {
        "length": 2278,
        "width": 1134,
        "depth": 30
      }
    },
    "featuredOrder": 3
  },
  {
    "id": "longi355",
    "name": "Longi 355W Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "longi",
    "brandLabel": "Longi",
    "power": "355 W",
    "priceText": "৳ 9,940",
    "price": 9940,
    "oldPriceText": "৳ 10,650",
    "oldPrice": 10650,
    "apps": [
      "home",
      "business"
    ],
    "search": "longi 355w solar panel longi solar panel 355 w home business residential smaller arrays general pv",
    "warranty": "See current listing",
    "image": "/assets/products-real/longi355.jpg",
    "role": "Generation",
    "bestFor": [
      "Residential",
      "Smaller arrays",
      "General PV"
    ],
    "featuredOrder": 4
  },
  {
    "id": "jinko715",
    "name": "Jinko 715W Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "jinko",
    "brandLabel": "Jinko",
    "power": "715 W",
    "priceText": "৳ 16,445",
    "price": 16445,
    "oldPriceText": "৳ 17,875",
    "oldPrice": 17875,
    "apps": [
      "business",
      "industrial"
    ],
    "search": "jinko 715w solar panel jinko solar panel 715 w business industrial high-output pv commercial industrial",
    "warranty": "See current listing",
    "image": "/assets/products-real/jinko715.jpg",
    "role": "Generation",
    "bestFor": [
      "High-output PV",
      "Commercial",
      "Industrial"
    ],
    "physical": {
      "modelReference": "Jinko 715W bifacial dual-glass listing",
      "dimensionsMm": {
        "length": 2384,
        "width": 1303,
        "depth": 33
      },
      "weightKg": 37.5
    },
    "featuredOrder": 5
  },
  {
    "id": "jinko625",
    "name": "Jinko Tiger Neo 625W Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "jinko",
    "brandLabel": "Jinko",
    "power": "625 W",
    "priceText": "৳ 14,375",
    "price": 14375,
    "oldPriceText": "৳ 15,625",
    "oldPrice": 15625,
    "apps": [
      "home",
      "business",
      "industrial"
    ],
    "search": "jinko tiger neo 625w solar panel jinko solar panel 625 w home business industrial n-type topcon commercial high-output pv",
    "warranty": "12-year product / 30-year linear listed",
    "image": "/assets/products-real/jinko625.png",
    "role": "Generation",
    "bestFor": [
      "N-Type TOPCon",
      "Commercial",
      "High-output PV"
    ],
    "physical": {
      "modelReference": "Jinko JKM625N-66HL4M-BDV",
      "dimensionsMm": {
        "length": 2382,
        "width": 1134,
        "depth": 30
      },
      "weightKg": 32.4
    },
    "featuredOrder": 6
  },
  {
    "id": "ecoflow125",
    "name": "EcoFlow 125W Portable Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "ecoflow",
    "brandLabel": "EcoFlow",
    "power": "125 W",
    "priceText": "৳ 17,100",
    "price": 17100,
    "oldPriceText": "৳ 17,500",
    "oldPrice": 17500,
    "apps": [
      "home",
      "portable"
    ],
    "search": "ecoflow 125w portable solar panel ecoflow solar panel 125 w home portable portable bifacial outdoor",
    "warranty": "18 months listed",
    "image": "/assets/products-real/ecoflow125.png",
    "role": "Generation",
    "bestFor": [
      "Portable",
      "Bifacial",
      "Outdoor"
    ],
    "physical": {
      "modelReference": "EcoFlow 125W Solar Panel",
      "dimensionsMm": {
        "length": 1154,
        "width": 612,
        "depth": 22
      },
      "weightKg": 4.2
    },
    "featuredOrder": 7
  },
  {
    "id": "longi615",
    "name": "LONGI Hi-MO 7 615W Bifacial Double Glass Solar Panel",
    "category": "panel",
    "categoryLabel": "Solar Panel",
    "brand": "longi",
    "brandLabel": "Longi",
    "power": "615 W",
    "priceText": "৳ 17,220",
    "price": 17220,
    "oldPriceText": "৳ 18,490",
    "oldPrice": 18490,
    "apps": [
      "home",
      "business",
      "industrial"
    ],
    "search": "longi hi-mo 7 615w bifacial double glass solar panel longi solar panel 615 w home business industrial bifacial commercial industrial",
    "warranty": "See current listing",
    "image": "/assets/products-real/longi615.png",
    "role": "Generation",
    "bestFor": [
      "Bifacial",
      "Commercial",
      "Industrial"
    ],
    "physical": {
      "modelReference": "LONGi Hi-MO 7 615W family",
      "dimensionsMm": {
        "length": 2382,
        "width": 1134,
        "depth": 30
      }
    },
    "featuredOrder": 8
  },
  {
    "id": "hithium-max8",
    "name": "HiTHIUM HeroEE MaxPower 8 AIO Portable Solar Power Station 5000W / 8000Wh",
    "category": "portable",
    "categoryLabel": "Portable Power",
    "brand": "hithium",
    "brandLabel": "HiTHIUM",
    "power": "5000 W / 8038.4Wh",
    "priceText": "৳ 285,990",
    "price": 285990,
    "oldPriceText": "৳ 420,000",
    "oldPrice": 420000,
    "apps": [
      "home",
      "business",
      "backup",
      "portable"
    ],
    "search": "hithium heroee maxpower 8 aio portable solar power station 5000w / 8000wh hithium portable power 5000 w / 8038.4wh home business backup portable large portable backup small business emergency power",
    "warranty": "5 years listed",
    "image": "/assets/products-real/hithium-max8.jpg",
    "role": "Portable Storage",
    "bestFor": [
      "Large Portable Backup",
      "Small Business",
      "Emergency Power"
    ],
    "featuredOrder": 9
  },
  {
    "id": "hithium-light200",
    "name": "Hithium HeroEE Light 1 200W Portable Power Station | Lithium IPS",
    "category": "portable",
    "categoryLabel": "Portable Power",
    "brand": "hithium",
    "brandLabel": "HiTHIUM",
    "power": "200 W",
    "priceText": "৳ 34,490",
    "price": 34490,
    "oldPriceText": "৳ 35,990",
    "oldPrice": 35990,
    "apps": [
      "home",
      "backup",
      "portable"
    ],
    "search": "hithium heroee light 1 200w portable power station | lithium ips hithium portable power 200 w home backup portable small loads portable emergency backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/hithium-light200.webp",
    "role": "Portable Storage",
    "bestFor": [
      "Small Loads",
      "Portable",
      "Emergency Backup"
    ],
    "featuredOrder": 10
  },
  {
    "id": "hithium-light500",
    "name": "Hithium HeroEE Light 1 500W Portable Power Station",
    "category": "portable",
    "categoryLabel": "Portable Power",
    "brand": "hithium",
    "brandLabel": "HiTHIUM",
    "power": "500 W / 1004.8Wh",
    "priceText": "৳ 47,990",
    "price": 47990,
    "oldPriceText": "৳ 55,000",
    "oldPrice": 55000,
    "apps": [
      "home",
      "backup",
      "portable"
    ],
    "search": "hithium heroee light 1 500w portable power station hithium portable power 500 w / 1004.8wh home backup portable portable small loads emergency backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/hithium-light500.webp",
    "role": "Portable Storage",
    "bestFor": [
      "Portable",
      "Small Loads",
      "Emergency Backup"
    ],
    "featuredOrder": 11
  },
  {
    "id": "vestwoods1000",
    "name": "Vestwoods 1000W Portable Power Station 2009Wh LFP Battery 600W Solar MPPT",
    "category": "portable",
    "categoryLabel": "Portable Power",
    "brand": "vestwoods",
    "brandLabel": "Vestwoods",
    "power": "1000 W / 2009Wh",
    "priceText": "৳ 85,990",
    "price": 85990,
    "oldPriceText": "৳ 89,990",
    "oldPrice": 89990,
    "apps": [
      "home",
      "backup",
      "portable"
    ],
    "search": "vestwoods 1000w portable power station 2009wh lfp battery 600w solar mppt vestwoods portable power 1000 w / 2009wh home backup portable large portable backup home essentials outdoor",
    "warranty": "See current listing",
    "image": "/assets/products-real/vestwoods1000.jpg",
    "role": "Portable Storage",
    "bestFor": [
      "Large Portable Backup",
      "Home Essentials",
      "Outdoor"
    ],
    "featuredOrder": 12
  },
  {
    "id": "vestwood-rescube",
    "name": "Vestwood Rescube 1kWh Portable Power Station 500W",
    "category": "portable",
    "categoryLabel": "Portable Power",
    "brand": "vestwoods",
    "brandLabel": "Vestwoods",
    "power": "500 W / 1kWh",
    "priceText": "৳ 42,990",
    "price": 42990,
    "oldPriceText": "৳ 45,990",
    "oldPrice": 45990,
    "apps": [
      "home",
      "backup",
      "portable"
    ],
    "search": "vestwood rescube 1kwh portable power station 500w vestwoods portable power 500 w / 1kwh home backup portable portable small loads emergency backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/vestwood-rescube.png",
    "role": "Portable Storage",
    "bestFor": [
      "Portable",
      "Small Loads",
      "Emergency Backup"
    ],
    "featuredOrder": 13
  },
  {
    "id": "hithium16",
    "name": "HiTHIUM HEROEE 16 LiFePO4 Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "hithium",
    "brandLabel": "HiTHIUM",
    "power": "Approx. 15kWh class",
    "priceText": "৳ 309,990",
    "price": 309990,
    "oldPriceText": "৳ 349,990",
    "oldPrice": 349990,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "hithium heroee 16 lifepo4 lithium battery hithium lithium battery approx. 15kwh class home business backup long backup large home commercial",
    "warranty": "See current listing",
    "image": "/assets/products-real/hithium16.webp",
    "role": "Storage",
    "bestFor": [
      "Long Backup",
      "Large Home",
      "Commercial"
    ],
    "featuredOrder": 14
  },
  {
    "id": "sako512300",
    "name": "SAKO 51.2V 300Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "sako",
    "brandLabel": "Sako",
    "power": "51.2V / 300Ah",
    "priceText": "৳ 274,990",
    "price": 274990,
    "oldPriceText": "৳ 349,990",
    "oldPrice": 349990,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "sako 51.2v 300ah lithium lifepo4 battery sako lithium battery 51.2v / 300ah home business backup large storage hybrid backup commercial",
    "warranty": "See current listing",
    "image": "/assets/products-real/sako512300.jpg",
    "role": "Storage",
    "bestFor": [
      "Large Storage",
      "Hybrid Backup",
      "Commercial"
    ],
    "featuredOrder": 15
  },
  {
    "id": "lvt-g3-314",
    "name": "LVTOPSUN G3 51.2V 314Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "51.2V / 314Ah",
    "priceText": "৳ 234,990",
    "price": 234990,
    "oldPriceText": "৳ 279,990",
    "oldPrice": 279990,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "lvtopsun g3 51.2v 314ah lithium lifepo4 battery lvtopsun lithium battery 51.2v / 314ah home business backup large storage hybrid backup commercial",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt-g3-314.jpg",
    "role": "Storage",
    "bestFor": [
      "Large Storage",
      "Hybrid Backup",
      "Commercial"
    ],
    "featuredOrder": 16
  },
  {
    "id": "lvt256200",
    "name": "LVTOPSUN 25.6V 200Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "25.6V / 200Ah",
    "priceText": "৳ 99,990",
    "price": 99990,
    "oldPriceText": "৳ 119,990",
    "oldPrice": 119990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "lvtopsun 25.6v 200ah lithium lifepo4 battery lvtopsun lithium battery 25.6v / 200ah home backup home backup mid-size storage hybrid",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt256200.jpg",
    "role": "Storage",
    "bestFor": [
      "Home Backup",
      "Mid-size Storage",
      "Hybrid"
    ],
    "featuredOrder": 17
  },
  {
    "id": "lvt512100",
    "name": "LVTOPSUN 51.2V 100Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "51.2V / 100Ah",
    "priceText": "৳ 99,990",
    "price": 99990,
    "oldPriceText": "৳ 119,990",
    "oldPrice": 119990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "lvtopsun 51.2v 100ah lithium lifepo4 battery lvtopsun lithium battery 51.2v / 100ah home backup home backup 48/51v class hybrid",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt512100.jpg",
    "role": "Storage",
    "bestFor": [
      "Home Backup",
      "48/51V Class",
      "Hybrid"
    ],
    "featuredOrder": 18
  },
  {
    "id": "lvt512200",
    "name": "LVTOPSUN 51.2V 200Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "51.2V / 200Ah",
    "priceText": "৳ 204,990",
    "price": 204990,
    "oldPriceText": "৳ 219,990",
    "oldPrice": 219990,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "lvtopsun 51.2v 200ah lithium lifepo4 battery lvtopsun lithium battery 51.2v / 200ah home business backup long backup large home commercial",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt512200.jpg",
    "role": "Storage",
    "bestFor": [
      "Long Backup",
      "Large Home",
      "Commercial"
    ],
    "featuredOrder": 19
  },
  {
    "id": "lvt256100",
    "name": "LVTOPSUN 25.6V 100Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "25.6V / 100Ah",
    "priceText": "৳ 51,990",
    "price": 51990,
    "oldPriceText": "৳ 57,990",
    "oldPrice": 57990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "lvtopsun 25.6v 100ah lithium lifepo4 battery lvtopsun lithium battery 25.6v / 100ah home backup compact storage home backup hybrid",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt256100.jpg",
    "role": "Storage",
    "bestFor": [
      "Compact Storage",
      "Home Backup",
      "Hybrid"
    ],
    "featuredOrder": 20
  },
  {
    "id": "lvt128200",
    "name": "LVTOPSUN 12.8V 200Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "12.8V / 200Ah",
    "priceText": "৳ 51,990",
    "price": 51990,
    "oldPriceText": "৳ 57,990",
    "oldPrice": 57990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "lvtopsun 12.8v 200ah lithium lifepo4 battery lvtopsun lithium battery 12.8v / 200ah home backup 12v systems backup compact storage",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt128200.jpg",
    "role": "Storage",
    "bestFor": [
      "12V Systems",
      "Backup",
      "Compact Storage"
    ],
    "featuredOrder": 21
  },
  {
    "id": "djdc50",
    "name": "DJDC 50Ah Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "djdc",
    "brandLabel": "DJDC",
    "power": "50Ah",
    "priceText": "৳ 13,990",
    "price": 13990,
    "oldPriceText": "৳ 19,990",
    "oldPrice": 19990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "djdc 50ah lithium battery djdc lithium battery 50ah home backup compact battery small backup 12v-class applications",
    "warranty": "See current listing",
    "image": "/assets/products-real/djdc50.jpg",
    "role": "Storage",
    "bestFor": [
      "Compact Battery",
      "Small Backup",
      "12V-class applications"
    ],
    "featuredOrder": 22
  },
  {
    "id": "djdc12-100",
    "name": "DJDC 12V 100Ah Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "djdc",
    "brandLabel": "DJDC",
    "power": "12V / 100Ah",
    "priceText": "৳ 22,990",
    "price": 22990,
    "oldPriceText": "৳ 27,990",
    "oldPrice": 27990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "djdc 12v 100ah lithium battery djdc lithium battery 12v / 100ah home backup compact storage home backup 12v systems",
    "warranty": "See current listing",
    "image": "/assets/products-real/djdc12-100.jpg",
    "role": "Storage",
    "bestFor": [
      "Compact Storage",
      "Home Backup",
      "12V Systems"
    ],
    "featuredOrder": 23
  },
  {
    "id": "djdc12-200",
    "name": "DJDC 12V 200Ah Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "djdc",
    "brandLabel": "DJDC",
    "power": "12V / 200Ah",
    "priceText": "৳ 42,990",
    "price": 42990,
    "oldPriceText": "৳ 54,990",
    "oldPrice": 54990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "djdc 12v 200ah lithium battery djdc lithium battery 12v / 200ah home backup home backup 12v systems higher ah",
    "warranty": "See current listing",
    "image": "/assets/products-real/djdc12-200.jpg",
    "role": "Storage",
    "bestFor": [
      "Home Backup",
      "12V Systems",
      "Higher Ah"
    ],
    "featuredOrder": 24
  },
  {
    "id": "djdc24-100",
    "name": "DJDC 24V 100Ah Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "djdc",
    "brandLabel": "DJDC",
    "power": "24V / 100Ah",
    "priceText": "৳ 94,990",
    "price": 94990,
    "oldPriceText": "৳ 119,990",
    "oldPrice": 119990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "djdc 24v 100ah lithium battery djdc lithium battery 24v / 100ah home backup 24v systems backup home",
    "warranty": "See current listing",
    "image": "/assets/products-real/djdc24-100.jpg",
    "role": "Storage",
    "bestFor": [
      "24V Systems",
      "Backup",
      "Home"
    ],
    "featuredOrder": 25
  },
  {
    "id": "hithium4",
    "name": "Hithium HeroEE 4 12.8V 314Ah 4kWh LiFePO4 Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "hithium",
    "brandLabel": "HiTHIUM",
    "power": "4kWh / 12.8V 314Ah",
    "priceText": "৳ 74,990",
    "price": 74990,
    "oldPriceText": "৳ 84,990",
    "oldPrice": 84990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "hithium heroee 4 12.8v 314ah 4kwh lifepo4 lithium battery hithium lithium battery 4kwh / 12.8v 314ah home backup 4kwh storage home backup lifepo4",
    "warranty": "See current listing",
    "image": "/assets/products-real/hithium4.png",
    "role": "Storage",
    "bestFor": [
      "4kWh Storage",
      "Home Backup",
      "LiFePO4"
    ],
    "featuredOrder": 26
  },
  {
    "id": "sako128100",
    "name": "Sako 12.8V 100Ah LiFePO4 Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "sako",
    "brandLabel": "Sako",
    "power": "12.8V / 100Ah",
    "priceText": "৳ 25,990",
    "price": 25990,
    "oldPriceText": "৳ 31,990",
    "oldPrice": 31990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "sako 12.8v 100ah lifepo4 lithium battery sako lithium battery 12.8v / 100ah home backup compact storage 12v systems backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sako128100.jpg",
    "role": "Storage",
    "bestFor": [
      "Compact Storage",
      "12V Systems",
      "Backup"
    ],
    "featuredOrder": 27
  },
  {
    "id": "sako128200",
    "name": "Sako 12.8V 200Ah LiFePO4 Lithium Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "sako",
    "brandLabel": "Sako",
    "power": "12.8V / 200Ah",
    "priceText": "৳ 53,490",
    "price": 53490,
    "oldPriceText": "৳ 64,990",
    "oldPrice": 64990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "sako 12.8v 200ah lifepo4 lithium battery sako lithium battery 12.8v / 200ah home backup home backup 12v systems higher ah",
    "warranty": "See current listing",
    "image": "/assets/products-real/sako128200.jpg",
    "role": "Storage",
    "bestFor": [
      "Home Backup",
      "12V Systems",
      "Higher Ah"
    ],
    "featuredOrder": 28
  },
  {
    "id": "lvt128100",
    "name": "LVTOPSUN 12.8V 100Ah Lithium LiFePO4 Battery",
    "category": "battery",
    "categoryLabel": "Lithium Battery",
    "brand": "lvtopsun",
    "brandLabel": "LVTOPSUN",
    "power": "12.8V / 100Ah",
    "priceText": "৳ 24,990",
    "price": 24990,
    "oldPriceText": "৳ 29,590",
    "oldPrice": 29590,
    "apps": [
      "home",
      "backup"
    ],
    "search": "lvtopsun 12.8v 100ah lithium lifepo4 battery lvtopsun lithium battery 12.8v / 100ah home backup compact storage 12v systems backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/lvt128100.jpg",
    "role": "Storage",
    "bestFor": [
      "Compact Storage",
      "12V Systems",
      "Backup"
    ],
    "featuredOrder": 29
  },
  {
    "id": "goodwe20",
    "name": "GoodWe 20kW 3-Phase On-Grid Solar Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "20 kW",
    "priceText": "৳ 145,000",
    "price": 145000,
    "oldPriceText": "৳ 149,990",
    "oldPrice": 149990,
    "apps": [
      "business",
      "industrial"
    ],
    "search": "goodwe 20kw 3-phase on-grid solar inverter goodwe solar inverter 20 kw business industrial commercial industrial three phase",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe20.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Commercial",
      "Industrial",
      "Three Phase"
    ],
    "featuredOrder": 30
  },
  {
    "id": "goodwe25",
    "name": "GoodWe 25kW 3-Phase On-Grid Solar Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "25 kW",
    "priceText": "৳ 155,000",
    "price": 155000,
    "oldPriceText": "৳ 165,000",
    "oldPrice": 165000,
    "apps": [
      "business",
      "industrial"
    ],
    "search": "goodwe 25kw 3-phase on-grid solar inverter goodwe solar inverter 25 kw business industrial commercial industrial three phase",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe25.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Commercial",
      "Industrial",
      "Three Phase"
    ],
    "featuredOrder": 31
  },
  {
    "id": "goodwe30",
    "name": "GoodWe 30kW 3-Phase On-Grid Solar Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "30 kW",
    "priceText": "৳ 175,000",
    "price": 175000,
    "oldPriceText": "৳ 184,990",
    "oldPrice": 184990,
    "apps": [
      "business",
      "industrial"
    ],
    "search": "goodwe 30kw 3-phase on-grid solar inverter goodwe solar inverter 30 kw business industrial commercial industrial three phase",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe30.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Commercial",
      "Industrial",
      "Three Phase"
    ],
    "featuredOrder": 32
  },
  {
    "id": "goodwe3",
    "name": "GoodWe 3kW Single Phase Off-Grid Hybrid Solar Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "3 kW",
    "priceText": "৳ 59,990",
    "price": 59990,
    "oldPriceText": "৳ 62,990",
    "oldPrice": 62990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "goodwe 3kw single phase off-grid hybrid solar inverter goodwe solar inverter 3 kw home backup home backup single phase",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe3.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Home",
      "Backup",
      "Single Phase"
    ],
    "featuredOrder": 33
  },
  {
    "id": "goodwe36",
    "name": "GoodWe 3.6kW Single Phase Off-Grid Hybrid Solar Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "3.6 kW",
    "priceText": "৳ 63,000",
    "price": 63000,
    "oldPriceText": "৳ 68,000",
    "oldPrice": 68000,
    "apps": [
      "home",
      "backup"
    ],
    "search": "goodwe 3.6kw single phase off-grid hybrid solar inverter goodwe solar inverter 3.6 kw home backup home backup single phase",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe36.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Home",
      "Backup",
      "Single Phase"
    ],
    "featuredOrder": 34
  },
  {
    "id": "goodwe5",
    "name": "GoodWe 5kW Single Phase Off-Grid Hybrid Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "5 kW",
    "priceText": "৳ 65,000",
    "price": 65000,
    "oldPriceText": "৳ 69,000",
    "oldPrice": 69000,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "goodwe 5kw single phase off-grid hybrid inverter goodwe solar inverter 5 kw home business backup home hybrid small business backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe5.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Home Hybrid",
      "Small Business",
      "Backup"
    ],
    "featuredOrder": 35
  },
  {
    "id": "goodwe6",
    "name": "GoodWe 6kW Single Phase Off-Grid Hybrid Inverter",
    "category": "inverter",
    "categoryLabel": "Solar Inverter",
    "brand": "goodwe",
    "brandLabel": "GoodWe",
    "power": "6 kW",
    "priceText": "৳ 70,000",
    "price": 70000,
    "oldPriceText": "৳ 72,000",
    "oldPrice": 72000,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "goodwe 6kw single phase off-grid hybrid inverter goodwe solar inverter 6 kw home business backup home hybrid small business backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/goodwe6.jpg",
    "role": "Control + Conversion",
    "bestFor": [
      "Home Hybrid",
      "Small Business",
      "Backup"
    ],
    "featuredOrder": 36
  },
  {
    "id": "sys18-15-15c",
    "name": "18kW / 15kWh (1.5C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 15.3kWh",
    "priceText": "৳ 1,192,500",
    "price": 1192500,
    "oldPriceText": "৳ 1,382,500",
    "oldPrice": 1382500,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 15kwh (1.5c) off-grid hybrid solar power system combo package complete system 18 kw / 15.3kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-15-15c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 37
  },
  {
    "id": "sys18-15-06c",
    "name": "18kW / 15kWh (0.6C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 15.3kWh",
    "priceText": "৳ 1,137,500",
    "price": 1137500,
    "oldPriceText": "৳ 1,350,000",
    "oldPrice": 1350000,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 15kwh (0.6c) off-grid hybrid solar power system combo package complete system 18 kw / 15.3kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-15-06c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 38
  },
  {
    "id": "sys18-15-05c",
    "name": "18kW / 15kWh (0.5C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 15.3kWh",
    "priceText": "৳ 1,052,000",
    "price": 1052000,
    "oldPriceText": "৳ 1,199,000",
    "oldPrice": 1199000,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 15kwh (0.5c) off-grid hybrid solar power system combo package complete system 18 kw / 15.3kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-15-05c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 39
  },
  {
    "id": "sys18-30-06c",
    "name": "18kW / 30kWh (0.6C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 30.7kWh",
    "priceText": "৳ 1,585,000",
    "price": 1585000,
    "oldPriceText": "৳ 1,745,000",
    "oldPrice": 1745000,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 30kwh (0.6c) off-grid hybrid solar power system combo package complete system 18 kw / 30.7kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-30-06c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 40
  },
  {
    "id": "sys18-30-05c",
    "name": "18kW / 30kWh (0.5C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 30.7kWh",
    "priceText": "৳ 1,495,000",
    "price": 1495000,
    "oldPriceText": "৳ 1,675,000",
    "oldPrice": 1675000,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 30kwh (0.5c) off-grid hybrid solar power system combo package complete system 18 kw / 30.7kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-30-05c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 41
  },
  {
    "id": "sys18-48-06c",
    "name": "18kW / 48kWh (0.6C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 48.2kWh",
    "priceText": "৳ 2,065,000",
    "price": 2065000,
    "oldPriceText": "৳ 2,300,000",
    "oldPrice": 2300000,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 48kwh (0.6c) off-grid hybrid solar power system combo package complete system 18 kw / 48.2kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-48-06c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 42
  },
  {
    "id": "sys18-48-05c",
    "name": "18kW / 48kWh (0.5C) Off-Grid Hybrid Solar Power System",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "18 kW / 48.2kWh",
    "priceText": "৳ 1,865,000",
    "price": 1865000,
    "oldPriceText": "৳ 2,000,000",
    "oldPrice": 2000000,
    "apps": [
      "business",
      "industrial",
      "backup"
    ],
    "search": "18kw / 48kwh (0.5c) off-grid hybrid solar power system combo package complete system 18 kw / 48.2kwh business industrial backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys18-48-05c.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 43
  },
  {
    "id": "sys12-24",
    "name": "12kW 24kWh Single Phase Off-Grid Hybrid Solar System | 17.2kW PV | Triple Utility Meter Distribution",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "12 kW / 24kWh / 17.2kW PV",
    "priceText": "Contact for price",
    "price": null,
    "oldPriceText": null,
    "oldPrice": null,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "12kw 24kwh single phase off-grid hybrid solar system | 17.2kw pv | triple utility meter distribution combo package complete system 12 kw / 24kwh / 17.2kw pv home business backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys12-24.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 44
  },
  {
    "id": "sys12-32",
    "name": "12kW 32kWh Single Phase Off-Grid Hybrid Solar System | 14.4kW PV | Double Utility Meter Distribution",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "12 kW / 32kWh / 14.4kW PV",
    "priceText": "৳ 1,279,000",
    "price": 1279000,
    "oldPriceText": "৳ 1,370,500",
    "oldPrice": 1370500,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "12kw 32kwh single phase off-grid hybrid solar system | 14.4kw pv | double utility meter distribution combo package complete system 12 kw / 32kwh / 14.4kw pv home business backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys12-32.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 45
  },
  {
    "id": "sys8-16",
    "name": "8kW 16kWh Single Phase Off-Grid Hybrid Solar System | 11.5kW PV | Double Utility Meter Distribution",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "8 kW / 16kWh / 11.5kW PV",
    "priceText": "৳ 813,500",
    "price": 813500,
    "oldPriceText": "৳ 849,490",
    "oldPrice": 849490,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "8kw 16kwh single phase off-grid hybrid solar system | 11.5kw pv | double utility meter distribution combo package complete system 8 kw / 16kwh / 11.5kw pv home business backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys8-16.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 46
  },
  {
    "id": "sys6-51",
    "name": "6kW 5.1kWh Single Phase Off-Grid Hybrid Solar System | 6.2kW PV | Double Utility Meter Distribution",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "6 kW / 5.1kWh / 6.2kW PV",
    "priceText": "৳ 425,000",
    "price": 425000,
    "oldPriceText": "৳ 475,000",
    "oldPrice": 475000,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "6kw 5.1kwh single phase off-grid hybrid solar system | 6.2kw pv | double utility meter distribution combo package complete system 6 kw / 5.1kwh / 6.2kw pv home business backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys6-51.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 47
  },
  {
    "id": "pump75-a",
    "name": "7.5HP Solar Submersible Pump Complete Solution — Variant A",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "7.5 HP",
    "priceText": "৳ 585,600",
    "price": 585600,
    "oldPriceText": "৳ 625,000",
    "oldPrice": 625000,
    "apps": [
      "agriculture",
      "industrial"
    ],
    "search": "7.5hp solar submersible pump complete solution — variant a pump package complete system 7.5 hp agriculture industrial agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump75-a.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 48
  },
  {
    "id": "pump55-a",
    "name": "5.5HP Solar Submersible Pump Complete Solution — Variant A",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "5.5 HP",
    "priceText": "৳ 498,000",
    "price": 498000,
    "oldPriceText": "৳ 539,500",
    "oldPrice": 539500,
    "apps": [
      "agriculture"
    ],
    "search": "5.5hp solar submersible pump complete solution — variant a pump package complete system 5.5 hp agriculture agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump55-a.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 49
  },
  {
    "id": "pump55-b",
    "name": "5.5HP Solar Submersible Pump Complete Solution — Variant B",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "5.5 HP",
    "priceText": "৳ 548,500",
    "price": 548500,
    "oldPriceText": "৳ 595,000",
    "oldPrice": 595000,
    "apps": [
      "agriculture"
    ],
    "search": "5.5hp solar submersible pump complete solution — variant b pump package complete system 5.5 hp agriculture agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump55-b.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 50
  },
  {
    "id": "pump55-c",
    "name": "5.5HP Solar Submersible Pump Complete Solution — Variant C",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "5.5 HP",
    "priceText": "৳ 620,500",
    "price": 620500,
    "oldPriceText": "৳ 660,500",
    "oldPrice": 660500,
    "apps": [
      "agriculture"
    ],
    "search": "5.5hp solar submersible pump complete solution — variant c pump package complete system 5.5 hp agriculture agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump55-c.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 51
  },
  {
    "id": "pump3",
    "name": "3HP Solar Submersible Pump Complete Solution",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "3 HP",
    "priceText": "৳ 354,000",
    "price": 354000,
    "oldPriceText": "৳ 405,000",
    "oldPrice": 405000,
    "apps": [
      "agriculture"
    ],
    "search": "3hp solar submersible pump complete solution pump package complete system 3 hp agriculture agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump3.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 52
  },
  {
    "id": "pump75-b",
    "name": "7.5HP Solar Submersible Pump Complete Solution — Variant B",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "7.5 HP",
    "priceText": "৳ 798,000",
    "price": 798000,
    "oldPriceText": "৳ 848,000",
    "oldPrice": 848000,
    "apps": [
      "agriculture",
      "industrial"
    ],
    "search": "7.5hp solar submersible pump complete solution — variant b pump package complete system 7.5 hp agriculture industrial agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump75-b.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 53
  },
  {
    "id": "pump75-c",
    "name": "7.5HP Solar Submersible Pump Complete Solution — Variant C",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "pump-package",
    "brandLabel": "Pump Package",
    "power": "7.5 HP",
    "priceText": "৳ 630,000",
    "price": 630000,
    "oldPriceText": "৳ 680,000",
    "oldPrice": 680000,
    "apps": [
      "agriculture",
      "industrial"
    ],
    "search": "7.5hp solar submersible pump complete solution — variant c pump package complete system 7.5 hp agriculture industrial agriculture irrigation solar pumping",
    "warranty": "See current listing",
    "image": "/assets/products-real/pump75-c.jpg",
    "role": "Complete Solar Pump Solution",
    "bestFor": [
      "Agriculture",
      "Irrigation",
      "Solar Pumping"
    ],
    "featuredOrder": 54
  },
  {
    "id": "sys3-complete",
    "name": "3kW Hybrid System – Complete Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "3 kW",
    "priceText": "৳ 127,990",
    "price": 127990,
    "oldPriceText": "৳ 139,499",
    "oldPrice": 139499,
    "apps": [
      "home",
      "backup"
    ],
    "search": "3kw hybrid system – complete combo package combo package complete system 3 kw home backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys3-complete.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 55
  },
  {
    "id": "sys12-hybrid",
    "name": "12kW Hybrid Solar System Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "12 kW",
    "priceText": "৳ 709,990",
    "price": 709990,
    "oldPriceText": "৳ 739,490",
    "oldPrice": 739490,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "12kw hybrid solar system combo package combo package complete system 12 kw home business backup industrial commercial large backup",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys12-hybrid.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Industrial",
      "Commercial",
      "Large Backup"
    ],
    "featuredOrder": 56
  },
  {
    "id": "sys6-offgrid",
    "name": "6kW Solar Off-Grid System Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "6 kW",
    "priceText": "৳ 488,490",
    "price": 488490,
    "oldPriceText": "৳ 499,990",
    "oldPrice": 499990,
    "apps": [
      "home",
      "business",
      "backup"
    ],
    "search": "6kw solar off-grid system combo package combo package complete system 6 kw home business backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys6-offgrid.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 57
  },
  {
    "id": "sys4-hybrid",
    "name": "4kW Hybrid Solar System – Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "4 kW",
    "priceText": "৳ 289,990",
    "price": 289990,
    "oldPriceText": "৳ 309,990",
    "oldPrice": 309990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "4kw hybrid solar system – combo package combo package complete system 4 kw home backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys4-hybrid.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 58
  },
  {
    "id": "sys4-complete",
    "name": "4kW Hybrid Solar System – Complete Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "4 kW",
    "priceText": "৳ 220,490",
    "price": 220490,
    "oldPriceText": "৳ 239,990",
    "oldPrice": 239990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "4kw hybrid solar system – complete combo package combo package complete system 4 kw home backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys4-complete.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 59
  },
  {
    "id": "sys2-complete",
    "name": "2kW Hybrid Solar System – Complete Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "2 kW",
    "priceText": "৳ 112,990",
    "price": 112990,
    "oldPriceText": "৳ 119,990",
    "oldPrice": 119990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "2kw hybrid solar system – complete combo package combo package complete system 2 kw home backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys2-complete.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 60
  },
  {
    "id": "sys1-complete",
    "name": "1kW Hybrid Solar System – Complete Combo Package",
    "category": "system",
    "categoryLabel": "Complete System",
    "brand": "combo-package",
    "brandLabel": "Combo Package",
    "power": "1 kW",
    "priceText": "৳ 71,990",
    "price": 71990,
    "oldPriceText": "৳ 89,990",
    "oldPrice": 89990,
    "apps": [
      "home",
      "backup"
    ],
    "search": "1kw hybrid solar system – complete combo package combo package complete system 1 kw home backup home hybrid backup complete system",
    "warranty": "See current listing",
    "image": "/assets/products-real/sys1-complete.jpg",
    "role": "Complete Solar System",
    "bestFor": [
      "Home",
      "Hybrid Backup",
      "Complete System"
    ],
    "featuredOrder": 61
  }
] as Product[];

export const productCategories = [
  { value: "all", label: "All Products" },
  { value: "panel", label: "Solar Panels" },
  { value: "inverter", label: "Inverters" },
  { value: "battery", label: "Batteries" },
  { value: "portable", label: "Portable Power" },
  { value: "system", label: "Complete Systems" },
] as const;

export const productApplications = [
  { value: "all", label: "Any application" },
  { value: "home", label: "Home" },
  { value: "business", label: "Business" },
  { value: "industrial", label: "Industrial" },
  { value: "backup", label: "Backup" },
  { value: "portable", label: "Portable" },
  { value: "agriculture", label: "Agriculture" },
] as const;
