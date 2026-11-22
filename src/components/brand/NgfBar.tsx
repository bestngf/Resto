import { APP_NAME } from "@/config/app";

/** Barre de marque NGF : bande kente, motif africain, mot NGF en dégradé néon et nom de l'application. */
export default function NgfBar() {
  return (
    <div className="ngf-bar" role="banner" aria-label={`${APP_NAME}, par New Generation Form`}>
      <div className="ngf-kente" aria-hidden="true" />
      <div className="ngf-bar-in">
        <span className="ngf-word" aria-hidden="true">NGF</span>
        <span className="ngf-sub"><b>{APP_NAME}</b>par New Generation Form</span>
      </div>
    </div>
  );
}
