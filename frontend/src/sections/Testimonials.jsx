import React from "react";
import { Star } from "lucide-react";
import james from "../assets/James.jpg";
import Laureen from "../assets/Laureen.jpg";
import Kath from "../assets/Kath.jpg";
import Queen from "../assets/Queen.jpg";
import Renee from "../assets/renee.jpg";
import Ruddy from "../assets/Ruddy.jpg";
import Zoey from "../assets/zoey.jpg";
import Timo from "../assets/Timo.jpg";
import { useTranslation } from "react-i18next";

const AVATARS = {
  sarah: Laureen,
  marcus: Ruddy,
  tiana: Kath,
  alex: Timo,
  james: james,
  amara: Queen,
};

function Card({ t }) {
  const [imageError, setImageError] = React.useState(false);

  // Generate random but consistent color based on name
  const getColor = (name) => {
    const colors = [
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#14b8a6",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="card rounded-2xl p-6 space-y-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
        "{t.text}"
      </p>

      {/* User Info with Avatar Image */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-white/5">
        {!imageError ? (
          <img
            src={t.avatar}
            alt={t.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-500/30 group-hover:ring-yellow-500/50 transition-all"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: getColor(t.name) }}
          >
            {t.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="text-gray-900 dark:text-white font-semibold text-sm">
            {t.name}
          </div>
          <div className="text-gray-500 dark:text-slate-500 text-xs">
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { t } = useTranslation();
  const TESTIMONIALS = [
    {
      name: "Sarah Johnson",
      role: t("professional_trader"),
      avatar: AVATARS.sarah,
      text: t("testimonial_sarah"),
    },
    {
      name: "Marcus Williams",
      role: t("defi_developer"),
      avatar: AVATARS.marcus,
      text: t("testimonial_marcus"),
    },
    {
      name: "Tiana Patel",
      role: t("crypto_investor"),
      avatar: AVATARS.tiana,
      text: t("testimonial_tiana"),
    },
    {
      name: "Alex Rodriguez",
      role: t("algorithmic_trader"),
      avatar: AVATARS.alex,
      text: t("testimonial_alex"),
    },
    {
      name: "James Smith",
      role: t("hedge_fund_manager"),
      avatar: AVATARS.james,
      text: t("testimonial_james"),
    },
    {
      name: "Renee Lee",
      role: t("retail_investor"),
      avatar: AVATARS.amara,
      text: t("testimonial_renee"),
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 fade-section bg-gray-50 dark:bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">
            {t("social_proof")}
          </p>
          <h2
            className="font-display font-extrabold text-gray-900 dark:text-white mb-4"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
          >
            {t("trusted_by")} <span className="gold-text">{t("members_proof")}</span>
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
             {t("social_proof_desc")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, index) => (
            <Card key={index} t={t} />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("verified_reviews")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
               {t("average_rating")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
               {t("active_traders_stat")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
