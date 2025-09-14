import { lazy as reactLazy, type ComponentType, type FC } from "react";

type Options = {
  maxRetries: number;
  importRetries: number;

  retryDelay: number;
};

export function createLazy(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  { maxRetries, importRetries, retryDelay }: Options = {
    maxRetries: 3,
    importRetries: 3,
    retryDelay: 300,
  }
) {
  /**
   * Retry feature
   *
   * On crée une fonction avec une signature similaire à ce que doit retourner createLazy()
   */
  const tryImport = async (): Promise<{ default: ComponentType<any> }> => {
    /**
     * On initialise le compteur
     */
    let retryCount: number = 0;

    /**
     * Fonction interne pour gérer le retry d'import.
     * On encapsule attempt pour que retryCount soit local à chaque appel
     * et éviter de partager l'état entre plusieurs imports.
     * Ainsi, on a une fonction locale qui gère son propre état et ses manipulations.
     */
    const attempt = async (): Promise<{ default: ComponentType<any> }> => {
      try {
        return await importFunction();
      } catch (error) {
        /**
         * Si le nombre de reprises est inférieur à l'argument mis en paramètre (qui était de 3),
         * on incrémente et réexécute la fonction (récursivité)
         */
        if (retryCount < importRetries) {
          retryCount++;
          /**
           * On marque un temps d'arrêt pour chaque reprise
           */

          if (retryDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }

          return attempt();
        }

        /**
         * En cas d'échec répété, on arrête et on renvoie l'erreur
         */
        throw error;
      }
    };

    return attempt();
  };

  /**
   * Gestion du reload automatique
   */
  return reactLazy(async () => {
    /**
     * On utilise la signature de la fonction comme clé pour le sessionStorage.
     * On la transforme en chaîne de caractères pour créer un identifiant unique.
     */
    const functionString = importFunction.toString();

    try {
      /**
       * Ici on exécute la fonction tryImport qui importe notre composant
       * et fait des traitements au préalable avant de faire un reload
       */
      const component = await tryImport();

      /**
       * En cas de succès, on supprime au préalable la clé du sessionStorage
       * pour une réinitialisation propre lors du prochain échec éventuel
       */
      sessionStorage.removeItem(functionString);

      return component;
    } catch (error) {
      /**
       * On récupère la valeur stockée dans le sessionStorage avec la clé "functionString".
       * Ensuite on la compare à notre paramètre maxRetries.
       * Si elle est inférieure à maxRetries, on l'incrémente jusqu'à ce qu'elle devienne supérieure.
       * Puis on rafraîchit la page avec window.location.reload().
       */
      const currentFailures = parseInt(
        sessionStorage.getItem(functionString) || "0"
      );

      if (currentFailures < maxRetries) {
        sessionStorage.setItem(
          functionString,
          (currentFailures + 1).toString()
        );
        window.location.reload();

        /**
         * React.lazy() attend une Promise qui se résout vers { default: Component }.
         * Ici c'est un placeholder qui ne sera jamais affiché car la page se recharge.
         * On retourne une signature similaire à l'API React.lazy().
         */
        const EmptyComponent: FC = () => null;
        return { default: EmptyComponent };
      }

      /**
       * Si on a dépassé le nombre maximum de tentatives, on propage l'erreur
       */
      throw error;
    }
  });
}
