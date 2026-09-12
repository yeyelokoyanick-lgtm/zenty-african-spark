# Section « Intégrations et solutions compatibles »

## Objectif
Ajouter à la page d’accueil une section premium, discrète et cohérente avec le style AFRISELL, sans modifier les sections existantes.

## Mise en œuvre
- Créer un composant réutilisable `PartnerLogoMarquee` alimenté par une liste centrale de solutions, facilement modifiable.
- Utiliser des logos officiels ou des ressources de marque fidèles, conservés localement dans le projet. Si un logo officiel exploitable n’est pas disponible, afficher le nom de la solution sans inventer de symbole.
- Ajouter deux rangées continues : paiements sur la première, livraison et commerce sur la seconde, avec défilements opposés.
- Dupliquer chaque rangée de manière invisible pour garantir une boucle sans rupture.
- Ajouter les fondus latéraux blancs, une hauteur visuelle uniforme, un espacement généreux et un effet de survol subtil.
- Ralentir l’animation au survol et la désactiver proprement avec `prefers-reduced-motion`.
- Insérer la section après les fonctionnalités et avant les témoignages, donc avant « Comment ça marche », avec le titre, le sous-titre et la mention demandés.

## Vérification
- Contrôler l’affichage sur ordinateur et mobile, la fluidité des deux sens, les textes alternatifs et l’absence de débordement.
- Vérifier que la page compile et qu’aucune autre section n’a changé.
