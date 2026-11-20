# Règles

- Référence : code-couleurs-1.0.
- Cette variante pédagogique s’inspire du [Mastermind](https://instructions.hasbro.com/fr-fr/instruction/mastermind-board-game-for-families-and-kids-the-classic-code-cracking-game-family-gifts-family-games). Pour le projet, les règles ci-dessous font foi ; elles ne reprennent pas toutes les variantes commerciales.
- La palette est commune : rouge, bleu, vert, jaune, orange, violet. Ce sont aussi les six identifiants exacts de l’API, en minuscules, dans cet ordre. Au début, l’application choisit au hasard quatre de ces couleurs, avec répétitions possibles. Cette combinaison reste fixe et cachée.
- La personne dispose de dix essais. Chaque proposition comporte quatre couleurs ordonnées de gauche à droite, modifiables avant validation.
- Une proposition incomplète ou contenant une couleur non autorisée est refusée avec une explication, sans consommer d’essai ni modifier l’historique.
- Chaque proposition valide consomme un essai. La proposition et ses indices restent consultables jusqu’à la nouvelle partie.
- L’indice donne deux nombres : couleurs bien placées et couleurs présentes mais mal placées. Comptez d’abord les bien placées, puis les mal placées parmi les occurrences restantes. Chaque occurrence du secret et de la proposition compte au maximum une fois. Les indices ne désignent pas les positions concernées.
- Quatre couleurs bien placées donnent la victoire, même au dixième essai. Après dix propositions sans victoire, la partie est perdue.
- Après victoire ou défaite, les propositions ne changent plus la partie. « Nouvelle partie » choisit un code et remet à zéro les essais, l’historique et les indices.

# Choix

- Le jeu tient dans un fichier `index.html` autonome, sans installation ni dépendance externe, pour faciliter son ouverture, son partage et son utilisation hors ligne.
- Quatre sélecteurs permettent de choisir et de modifier les couleurs avant validation, pour rendre explicite l’ordre des positions et limiter les erreurs de saisie.
- Les couleurs sont accompagnées de leur nom pour permettre de les identifier sans dépendre uniquement de leur apparence.
- L’historique conserve les propositions et leurs indices jusqu’à la nouvelle partie, pour permettre de comparer les essais et de construire un raisonnement.

# Vérifications

Les vérifications ci-dessous ont été exécutées automatiquement sur la logique JavaScript extraite de `index.html`, selon les règles `code-couleurs-1.0`. La version essayée est celle du commit GitHub `2befa09` ; son fichier de jeu est identique à la version locale testée. Ces résultats ne constituent pas un test de l’interface dans un navigateur.

Sauf indication contraire, le code secret utilisé est `rouge, bleu, rouge, vert`. Les couleurs sont données de gauche à droite.

| Cas testé | Résultat attendu | Résultat obtenu | Version essayée |
| --- | --- | --- | --- |
| 1. Couleurs répétées : proposer `rouge, rouge, bleu, rouge`. | 1 bien placée et 2 mal placées ; la dernière occurrence de rouge proposée ne compte pas. | 1 bien placée et 2 mal placées. Conforme. | `2befa09` |
| 2. Aucune couleur présente : proposer `jaune, jaune, orange, violet`. | 0 bien placée et 0 mal placée. | 0 bien placée et 0 mal placée. Conforme. | `2befa09` |
| 3. Toutes les couleurs mal placées : proposer `bleu, rouge, vert, rouge`. | 0 bien placée et 4 mal placées. | 0 bien placée et 4 mal placées. Conforme. | `2befa09` |
| 4. Proposition incomplète : après un essai valide, proposer `rouge, bleu, vide, vert`. | Refus avec une explication ; le nombre d’essais reste à 1 et l’historique reste identique. | Refus avec une explication ; 1 essai et historique inchangé. Conforme. | `2befa09` |
| 5. Couleur interdite : après un essai valide, proposer `rouge, bleu, rose, vert`. | Refus avec une explication ; le nombre d’essais reste à 1 et l’historique reste identique. | Refus avec une explication ; 1 essai et historique inchangé. Conforme. | `2befa09` |
| 6. Victoire au dixième essai : proposer neuf fois `jaune, jaune, jaune, jaune`, puis le code exact. | Victoire au dixième essai, avec 4 bien placées et 0 mal placée. | État de victoire, 10 essais, 4 bien placées et 0 mal placée. Conforme. | `2befa09` |
| 7. Défaite au dixième essai : proposer dix fois `jaune, jaune, jaune, jaune`. | Défaite après exactement 10 essais. | État de défaite et 10 essais enregistrés. Conforme. | `2befa09` |
| 8. Partie terminée : après une victoire, puis dans une autre partie après une défaite, proposer le code exact. | Refus dans les deux cas, sans modifier l’état de la partie, les essais ni l’historique. | Refus et état complet inchangé dans les deux cas. Conforme. | `2befa09` |
| 9. Nouvelle partie dans la logique : après une victoire, créer une nouvelle partie avec `creerPartie()`. | État en cours et historique vide, soit 0 essai. | État en cours et historique vide. Conforme. | `2befa09` |
| 10. Conservation des propositions : valider `jaune, jaune, jaune, jaune`, puis modifier le tableau de saisie et une copie de l’historique retournée par `consulter()`. | La proposition enregistrée reste `jaune, jaune, jaune, jaune`, avec 0 bien placée et 0 mal placée. | Proposition et indices enregistrés inchangés. Conforme. | `2befa09` |

# Limites

- Le rendu visuel reste à vérifier dans un navigateur, sur ordinateur et sur mobile.
- L’utilisation au clavier et avec un lecteur d’écran n’a pas été testée.
- La remise à zéro des sélections, du compteur, de l’historique et des indices par le bouton « Nouvelle partie » reste à vérifier dans l’interface.
- L’affichage des messages de refus, de victoire et de défaite, ainsi que le blocage des commandes en fin de partie, restent à vérifier dans l’interface.
