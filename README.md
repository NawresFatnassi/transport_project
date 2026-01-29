# Transport Manager TN - Application MERN

## 🏗️ Architecture du Projet
Le projet est divisé en deux dossiers distincts :
- **/backend** : API Express + MongoDB.
- **/frontend** : Application React + Vite.

## 🚀 Installation & Démarrage

### Pré-requis
- Node.js installé.
- MongoDB installé et lancé localement (ou une URL Atlas).

### 1. Installation Rapide
À la racine du projet, lancez cette commande pour installer les dépendances du frontend ET du backend :
```bash
npm run install-all
```
*Note : Si vous avez une erreur "ERESOLVE", supprimez `node_modules` à la racine et relancez la commande.*

### 2. Démarrage
Pour lancer les deux serveurs en même temps (Backend port 5000, Frontend port 5173) :
```bash
npm start
```

## ⚠️ Dépannage "npm install"
Si vous rencontrez des erreurs de dépendances (conflit React / Lucide) :
1. Assurez-vous d'être à la racine du projet.
2. Supprimez le fichier `package-lock.json` à la racine (et dans `frontend/` si nécessaire).
3. Lancez : `npm run install-all`.
Le script utilise désormais `--legacy-peer-deps` pour résoudre automatiquement les conflits de version.

## 🗄️ Configuration Base de Données
Le backend se connecte par défaut à :
`mongodb://127.0.0.1:27017/gestion_transport_tn`

Vous pouvez modifier cela dans le fichier `backend/.env`.

### Identifiants Admin par défaut
- **Email :** `admin@transport.tn`
- **Mot de passe :** `password123`