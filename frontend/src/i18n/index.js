import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import es from "./es.json";
import ru from "./ru.json";
import ar from "./ar.json";
import zh from "./zh.json";
import pt from "./pt.json";
import de from "./de.json";
import fr from "./fr.json";
import nl from "./nl.json";
import ja from "./ja.json";
import it from "./it.json";
import tr from "./tr.json";
import ko from "./ko.json";
import af from "./af.json";
import hi from "./hi.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      ru: { translation: ru },
      ar: { translation: ar },
      zh: { translation: zh },
      pt: { translation: pt },
      de: { translation: de },
      fr: { translation: fr },
      nl: { translation: nl },
      ja: { translation: ja },
      it: { translation: it },
      tr: { translation: tr },
      ko: { translation: ko },
      af: { translation: af },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;