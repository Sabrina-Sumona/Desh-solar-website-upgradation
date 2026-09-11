"use client";

import Image from "next/image";

type Brand = {
  name: string;
  image: string;
  logoClassName?: string;
};

const BRANDS: Brand[] = [
  {
    name: "Huawei",
    image: "/assets/brand/huawei.png",
    logoClassName: "brandLogoHuawei",
  },
  {
    name: "Crown Micro",
    image: "/assets/brand/crown-micro.png",
    logoClassName: "brandLogoCrown",
  },
  {
    name: "LVTOPSUN",
    image: "/assets/brand/lvtopsun.png",
    logoClassName: "brandLogoLvtopsun",
  },
  {
    name: "HiTHIUM",
    image: "/assets/brand/h'ithium.png",
    logoClassName: "brandLogoHithium",
  },
  {
    name: "Walton",
    image: "/assets/brand/walton.png",
    logoClassName: "brandLogoWalton",
  },
  {
    name: "JinkoSolar",
    image: "/assets/brand/jinkosolar.png",
    logoClassName: "brandLogoJinko",
  },
  {
    name: "LONGi",
    image: "/assets/brand/longi.png",
    logoClassName: "brandLogoLongi",
  },
  {
    name: "Growatt",
    image: "/assets/brand/growatt.png",
    logoClassName: "brandLogoGrowatt",
  },
  {
    name: "DJDC",
    image: "/assets/brand/dongjin.png",
    logoClassName: "brandLogoDjdc",
  },
  {
    name: "GoodWe",
    image: "/assets/brand/goodwe.png",
    logoClassName: "brandLogoGoodwe",
  },
  {
    name: "SAKO",
    image: "/assets/brand/sako.png",
    logoClassName: "brandLogoSako",
  },
  {
    name: "Haier",
    image: "/assets/brand/haier.png",
    logoClassName: "brandLogoHaier",
  },
];

function BrandGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className="brandMarqueeGroup"
      aria-hidden={duplicate ? "true" : undefined}
    >
      {BRANDS.map((brand) => (
        <div
          className="brandMarqueeLogo"
          key={`${duplicate ? "duplicate-" : ""}${brand.name}`}
        >
          <Image
            src={brand.image}
            alt={duplicate ? "" : `${brand.name} logo`}
            width={260}
            height={110}
            className={`brandMarqueeLogoImage ${brand.logoClassName ?? ""}`}
            sizes="(max-width: 720px) 145px, (max-width: 900px) 165px, 185px"
          />
        </div>
      ))}
    </div>
  );
}

export default function BrandMarquee() {
  return (
    <section className="brandMarquee" aria-label="Solar technology brands">
      <div className="brandMarqueeTop">
        <span className="brandMarqueeLine" />

        <div className="brandMarqueeEyebrow">Solar Technology Brands</div>

        <span className="brandMarqueeLine" />
      </div>

      <div className="brandMarqueeViewport">
        <div className="brandMarqueeTrack">
          <BrandGroup />
          <BrandGroup duplicate />
        </div>
      </div>
    </section>
  );
}
