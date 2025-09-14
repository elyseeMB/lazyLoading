import { createElement, type ComponentType } from "react";

export class Simulator {
  currentHash: string;
  hashCounter: number;
  deployedHash: string;
  components: Map<string, ComponentType<any>>;

  constructor() {
    this.hashCounter = 1;
    this.currentHash = this.generateHash();
    this.deployedHash = this.currentHash;
    this.components = new Map();
  }

  generateHash() {
    return (this.hashCounter++).toString();
  }

  deploy() {
    const oldHash = this.deployedHash;
    this.deployedHash = this.generateHash();
    console.log(`🚀 Déploiement: ${oldHash} → ${this.deployedHash}`);
    return { oldHash, newHash: this.deployedHash };
  }

  createComponent(name: string, hash: string): ComponentType<any> {
    const Component: ComponentType<any> = () => {
      return createElement("div", {}, [
        createElement("h3", { key: "title" }, `Component: ${name}`),
        createElement("p", { key: "paragraph" }, `Hash: ${hash}`), // ✅ Espace ajouté
        createElement(
          "span",
          { key: "time" },
          `${new Date().toLocaleTimeString()}`
        ),
      ]);
    };

    Component.displayName = name;
    this.components.set(`${name}-${hash}`, Component);
    return Component; // ✅ Retourner le composant
  }

  simulatorImport(name: string) {
    return new Promise<{ default: ComponentType<any> }>((resolve, reject) => {
      // ✅ reject corrigé
      setTimeout(() => {
        const requestKey = `${name}-${this.currentHash}`;

        if (this.currentHash !== this.deployedHash) {
          reject(new Error(`ChunkLoadError: ${name}-${this.currentHash}`));
          return;
        }

        let component = this.components.get(requestKey);
        if (!component) {
          component = this.createComponent(name, this.currentHash); // ✅ Utiliser currentHash
        }

        resolve({ default: component });
      }, Math.random() * 1000 + 500);
    });
  }

  updateClientHash() {
    this.currentHash = this.deployedHash;
    console.log(`🔄 Client mis à jour vers hash: ${this.currentHash}`);
  }

  // ✅ Méthode utilitaire pour debug
  getStatus() {
    return {
      clientHash: this.currentHash,
      deployedHash: this.deployedHash,
      isOutdated: this.currentHash !== this.deployedHash,
    };
  }
}
