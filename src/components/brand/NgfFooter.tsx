import { APP_NAME } from "@/config/app";

/** Pied de page des sites de restaurants : le restaurant garde ses couleurs, NGF signe discrètement. */
export default function NgfFooter() {
  return (
    <footer className="ngf-foot">
      <div className="ngf-kente mx-auto mb-3 max-w-xs rounded-full" aria-hidden="true" />
      <p><span className="ngf-word">NGF</span> · {APP_NAME} par New Generation Form</p>
    </footer>
  );
}
