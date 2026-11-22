"use client";
import { HelpBubble, PageHeader } from "@/components/dashboard/ui";
import { OrdersBoard } from "@/components/orders/OrdersBoard";

export default function CommandesPage() {
  return (
    <>
      <PageHeader title="Commandes en direct" subtitle="Chaque commande arrive ici avec une sonnerie." />
      <HelpBubble id="commandes" title="Bienvenue dans vos commandes">
        Touchez « Démarrer le service » en arrivant. Pour chaque commande, un seul bouton fait avancer l&apos;étape.
        Si le réseau coupe, vos actions sont gardées et envoyées ensuite.
      </HelpBubble>
      <OrdersBoard />
    </>
  );
}
