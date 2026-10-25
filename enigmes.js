const ALPHABET_OTAN = {
  A: "Alpha",   B: "Bravo",    C: "Charlie", D: "Delta",    E: "Echo",
  F: "Foxtrot", G: "Golf",     H: "Hotel",   I: "India",    J: "Juliett",
  K: "Kilo",    L: "Lima",     M: "Mike",    N: "November", O: "Oscar",
  P: "Papa",    Q: "Quebec",   R: "Romeo",   S: "Sierra",   T: "Tango",
  U: "Uniform", V: "Victor",   W: "Whiskey", X: "X-ray",    Y: "Yankee",
  Z: "Zulu"
};

const ALPHABET_MORSE = {
  A: ".-",    B: "-...",  C: "-.-.",  D: "-..",   E: ".",     F: "..-.",
  G: "--.",   H: "....",  I: "..",    J: ".---",  K: "-.-",   L: ".-..",
  M: "--",    N: "-.",    O: "---",   P: ".--.",  Q: "--.-",  R: ".-.",
  S: "...",   T: "-",     U: "..-",   V: "...-",  W: ".--",   X: "-..-",
  Y: "-.--",  Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----."
};

const ENIGMES = [
  {
    id: 1,
    etape: "ÉTAPE 01 // ACCÈS MODÉRATEUR DHARMA",
    secteur: "RDC : Bibliothèque du chat",
    histoire: "Le stream a crashé. Aminato a eu peur lors d'un jumpscare. Il faut relancer OBS avec le code DHARMA.",
    question: "CLÉ DE STREAM DHARMA :\nTapez la suite de 6 nombres (avec des espaces) pour relancer OBS.",
    reponses: [
      "4 8 15 16 23 42",
      "4, 8, 15, 16, 23, 42",
      "4-8-15-16-23-42",
      "4815162342"
    ],
    indices: [
      "Quatre, huit, quinze, seize, vingt-trois...",
      "Les 6 nombres de la station DHARMA."
    ],
    messageVictoire: "> Code validé. Le stream reprend."
  },
  {
    id: 2,
    etape: "ÉTAPE 02 // CODE OTAN - L'INFECTION DU TCHAT",
    secteur: "RDC : Bibliothèque du chat",
    histoire: "Le live a repris, mais un viewer spoile le jeu en permanence.",
    question: "DÉTECTION (CODE OTAN) :\nQuel est ce comportement signalé par le bot ?\n>> BRAVO - ALPHA - CHARLIE - KILO - SIERRA - ECHO - ALPHA - TANGO <<",
    audioOtan: "BACKSEAT",
    reponses: [
      "backseat",
      "le backseat",
      "back seat"
    ],
    indices: [
      "Prenez la première lettre de chaque mot.",
      "Le fait de dire au streamer comment jouer."
    ],
    messageVictoire: "> Bonne réponse. Le viewer a été mis sous silence."
  },
  {
    id: 3,
    etape: "ÉTAPE 03 // CODE MORSE - LE SUB-GOAL SECRET",
    secteur: "RDC : Bibliothèque du chat",
    histoire: "Une alerte de sub retentit, mais c'est un bruit terrifiant.",
    question: "ALERTE PARANORMALE (CODE MORSE) :\nImpulsion captée :\n...  /  -.-.  /  .-.  /  .  /  .-  /  --  /  .  /  .-.\nComment s'appelle cette frayeur soudaine ?\n(Astuce : tapez 'bip' pour entendre l'alerte)",
    audioMorse: "... -.-. .-. . .- -- . .-.",
    reponses: [
      "screamer",
      "un screamer",
      "le screamer",
      "jumpscare"
    ],
    indices: [
      "Décodage : ... (S) / -.-. (C) / .-. (R) / . (E) / .- (A) / -- (M) / . (E) / .-. (R)",
      "Une image effrayante qui apparaît soudainement."
    ],
    messageVictoire: "> Alerte décodée : SCREAMER. Aminato a sursauté."
  },
  {
    id: 4,
    etape: "ÉTAPE 04 // LE COMPTE À REBOURS DU LIVE",
    secteur: "SOUS-SOL : Modération",
    histoire: "Le stream s'arrêtera automatiquement à la fin du timer. Ce timer est la somme des chiffres de la clé de stream.",
    question: "MATHÉMATIQUES DU LIVE :\nLe chrono est l'addition exacte des nombres (4 + 8 + 15 + 16 + 23 + 42).\nCombien de minutes dure ce live au total ?",
    reponses: [
      "108",
      "108 minutes"
    ],
    indices: [
      "Calculez : 4 + 8 + 15 + 16 + 23 + 42 = ?",
      "C'est un nombre célèbre de la série LOST."
    ],
    messageVictoire: "> Timer calibré sur 108 minutes."
  },
  {
    id: 5,
    etape: "ÉTAPE 05 // CODE OTAN - L'ENTITÉ EN JEU",
    secteur: "SOUS-SOL : Modération",
    histoire: "Aminato explore la maison du jeu. Des objets volent dans toutes les directions.",
    question: "IDENTIFICATION DE L'ENTITÉ (CODE OTAN) :\nLe jeu indique ce fantôme :\n>> PAPA - OSCAR - LIMA - TANGO - ECHO - ROMEO - GOLF - ECHO - INDIA - SIERRA - TANGO <<\nQuelle est cette entité ?",
    audioOtan: "POLTERGEIST",
    reponses: [
      "poltergeist",
      "un poltergeist",
      "le poltergeist",
      "esprit frappeur"
    ],
    indices: [
      "Prenez les initiales des mots.",
      "Le fantôme connu pour jeter des objets."
    ],
    messageVictoire: "> Entité trouvée : Poltergeist."
  },
  {
    id: 6,
    etape: "ÉTAPE 06 // CODE MORSE - LE DÉFENSEUR DU TCHAT",
    secteur: "SOUS-SOL : Modération",
    histoire: "Le tchat est envahi de messages indésirables. Une seule personne peut nettoyer tout ça.",
    question: "LE RÔLE (CODE MORSE) :\nSignal intercepté :\n--  /  ---  /  -..  /  ---\nQuel est votre rôle sur le tchat ?\n(Astuce : tapez 'bip' pour écouter)",
    audioMorse: "-- --- -.. ---",
    reponses: [
      "modo",
      "modérateur",
      "moderateur",
      "un modo",
      "le modo"
    ],
    indices: [
      "Décodage : -- (M) / --- (O) / -.. (D) / --- (O)",
      "La personne qui gère le tchat Twitch."
    ],
    messageVictoire: "> Rôle confirmé : Modo."
  },
  {
    id: 7,
    etape: "ÉTAPE 07 // L'ÉMOTE HALLOWEEN",
    secteur: "SOUS-SOL : Modération",
    histoire: "Pour repousser les trolls, Aminato demande au tchat de spammer une émote d'Halloween.",
    question: "L'ÉNIGME DU TCHAT :\n'Je suis un légume orange que l'on évide et que l'on sculpte pour le 31 octobre. Il y a souvent une bougie à l'intérieur.'\nQuelle est cette émote ?",
    reponses: [
      "citrouille",
      "la citrouille",
      "une citrouille",
      "jack o lantern",
      "jack-o-lantern",
      "potiron"
    ],
    indices: [
      "Un grand légume orange.",
      "Le symbole classique d'Halloween."
    ],
    messageVictoire: "> Le tchat est rempli d'émotes Citrouille."
  },
  {
    id: 8,
    etape: "ÉTAPE 08 // LE JEU D'HORREUR DU MOIS",
    secteur: "LIMBES : Serveurs DHARMA",
    histoire: "Le stream d'horreur continue.",
    question: "CULTURE GAMING :\nQuel est ce célèbre jeu de coopération où l'on utilise un EMF et une Spirit Box ?",
    reponses: [
      "phasmophobia",
      "phasmo",
      "phasmaphobia"
    ],
    indices: [
      "Le nom commence par Phasm...",
      "Le jeu de chasse aux fantômes le plus connu."
    ],
    messageVictoire: "> Jeu identifié : Phasmophobia."
  },
  {
    id: 9,
    etape: "ÉTAPE 09 // LA SANCTION (OTAN + MORSE)",
    secteur: "LIMBES : Serveurs DHARMA",
    histoire: "Le pire troll du tchat est identifié. Il faut le bannir définitivement.",
    question: "COMMANDE DOUBLE (OTAN + MORSE) :\nPartie A (OTAN) : BRAVO - ALPHA - NOVEMBER\nPartie B (Morse) : .-.  /  ..  /  .--.\nCombinez les deux mots (séparés par un espace) pour le bannir :",
    audioOtan: "BAN",
    audioMorse: ".-. .. .--.",
    reponses: [
      "ban rip",
      "ban-rip",
      "ban / rip",
      "banrip",
      "ban r.i.p",
      "ban r.i.p."
    ],
    indices: [
      "Partie A : prenez la première lettre de chaque mot du code OTAN (3 lettres).",
      "Partie B : traduisez les 3 lettres du signal à l'aide de la table 'morse'.",
      "Associez la sanction d'un modérateur Twitch et l'inscription classique sur une pierre tombale."
    ],
    messageVictoire: "> Troll banni : BAN RIP. Le tchat est nettoyé."
  },
  {
    id: 10,
    etape: "ÉTAPE 10 // FIN DE LIVE",
    secteur: "LIMBES : Serveurs DHARMA",
    histoire: "Le live est sur le point de s'achever. Pour clôturer le stream, il faut lancer la horde de fantômes chez un autre streamer.",
    question: "CLÔTURE DU STREAM :\nQuelle est cette action finale pour envoyer tous nos fantômes terrifier une autre chaîne Twitch ?",
    reponses: [
      "raid fantomatique",
      "le raid fantomatique",
      "raid",
      "un raid",
      "un raid fantomatique"
    ],
    indices: [
      "C'est une action classique sur Twitch à la fin d'un live (R...).",
      "Raid... Fantomatique."
    ],
    messageVictoire: "> Le mot de passe ultime est validé. Raid fantomatique lancé avec succès."
  }
];

window.ALPHABET_OTAN = ALPHABET_OTAN;
window.ALPHABET_MORSE = ALPHABET_MORSE;
window.ENIGMES = ENIGMES;
