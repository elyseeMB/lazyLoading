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
   * We create a function with a signature similar to what createLazy() should return
   */
  const tryImport = async (): Promise<{ default: ComponentType<any> }> => {
    /**
     * Initialize the retry counter
     */
    let retryCount: number = 0;

    /**
     * Internal function to handle import retries.
     * We wrap it in 'attempt' so that retryCount is local to each call
     * and we avoid sharing state between multiple imports.
     * This way, we have a local function managing its own state and operations.
     */
    const attempt = async (): Promise<{ default: ComponentType<any> }> => {
      try {
        return await importFunction();
      } catch (error) {
        /**
         * If the retry count is less than the parameter provided (default is 3),
         * increment it and retry the function (recursion)
         */
        if (retryCount < importRetries) {
          retryCount++;
          /**
           * Pause for the specified delay before retrying
           */
          if (retryDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }

          return attempt();
        }

        /**
         * If all retries fail, throw the error
         */
        throw error;
      }
    };

    return attempt();
  };

  /**
   * Automatic reload handling
   */
  return reactLazy(async () => {
    /**
     * Use the function's string representation as a key in sessionStorage.
     * Convert it to a string to create a unique identifier.
     */
    const functionString = importFunction.toString();

    try {
      /**
       * Execute tryImport to import the component
       * and handle pre-processing before any reload
       */
      const component = await tryImport();

      /**
       * On success, remove the sessionStorage key
       * for a clean reset in case of future failures
       */
      sessionStorage.removeItem(functionString);

      return component;
    } catch (error) {
      /**
       * Get the stored value from sessionStorage using the "functionString" key.
       * Compare it to maxRetries. If it is less than maxRetries, increment it
       * and reload the page using window.location.reload().
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
         * React.lazy() expects a Promise that resolves to { default: Component }.
         * Here we return a placeholder that will never be displayed
         * because the page reloads immediately.
         */
        const EmptyComponent: FC = () => null;
        return { default: EmptyComponent };
      }

      /**
       * If the maximum retries are exceeded, propagate the error
       */
      throw error;
    }
  });
}
