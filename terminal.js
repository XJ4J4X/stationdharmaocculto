document.addEventListener("DOMContentLoaded", () => {
  const ecranDemarrage = document.getElementById("boot-screen");
  const boutonDemarrage = document.getElementById("boot-btn");
  const ecranTerminal = document.getElementById("terminal-screen");
  const sortie = document.getElementById("output");
  const formulaireSaisie = document.getElementById("formulaire-saisie");
  const ligneSaisie = document.getElementById("input-line");
  const affichageSaisie = document.getElementById("input-display");
  const entreeCachee = document.getElementById("hidden-input");
  const boutonValiderMobile = document.getElementById("bouton-valider-mobile");
  const compteurHud = document.getElementById("hud-timer");
  const progressionHud = document.getElementById("hud-progress");
  const boutonSon = document.getElementById("sound-btn");
  const barreRaccourcis = document.getElementById("shortcuts-bar");

  let enigmeActuelle = 0;
  let estEnTrainDEcrire = false;
  let passerTexte = false;
  let compteurIndices = 0;
  let texteTape = "";
  let terminalDemarre = false;

  let totalSecondes = 108 * 60;
  let intervalleCompteur = null;
  let minuteurBipEnigme = null;
  let enigmeMinuteurIndex = -1;

  const arreterMinuteurBipEnigme = () => {
    if (minuteurBipEnigme) {
      clearTimeout(minuteurBipEnigme);
      minuteurBipEnigme = null;
    }
    enigmeMinuteurIndex = -1;
    if (window.audioTerminal) {
      window.audioTerminal.arreterBoucleBipDharma();
    }
  };

  const demarrerMinuteurBipEnigme = (indexEnigme) => {
    if (enigmeMinuteurIndex === indexEnigme && (minuteurBipEnigme || (window.audioTerminal && window.audioTerminal.boucleBipActive))) {
      return;
    }
    arreterMinuteurBipEnigme();
    enigmeMinuteurIndex = indexEnigme;
    minuteurBipEnigme = setTimeout(() => {
      minuteurBipEnigme = null;
      if (enigmeMinuteurIndex === indexEnigme && window.audioTerminal) {
        window.audioTerminal.demarrerBoucleBipDharma();
      }
    }, 45000);
  };

  const carteDuManoir = 
`[ CARTOGRAPHIE DU MANOIR ]
---------------------------------------------------
  RDC      : Bibliothèque du chat
  SOUS-SOL : Modération
  LIMBES   : Serveurs DHARMA
---------------------------------------------------`;

  const ficheStationOcculto = 
`                     /\\
                    /  \\
                   / /\\ \\
             /\\   / /  \\ \\   /\\
            /  \\ / / /\\ \\ \\ /  \\
           / /\\ \\ / /  \\ \\ / /\\ \\
          | |  | | | OC | | |  | |
           \\ \\/ / \\ \\  / / \\ \\/ /
            \\  /   \\ \\/ /   \\  /
             \\/     \\  /     \\/
       [ DHARMA INITIATIVE • STATION OCCULTO ]
                Le manoir d'Aminato

  Mise en place par Aminato pour ses streams d'horreur.
  Objectif : Gérer le tchat et bloquer les trolls.`;

  const histoireDuManoir = [
    "À l'origine, Aminat0 était un explorateur urbain passionné par les lieux abandonnés. Un jour, il entendit parler d'un mystérieux manoir situé dans les hauteurs d'une montagne voisine. Intrigué, il décida de s'y aventurer, persuadé d'être le premier à explorer les lieux depuis des années. Malheureusement, au cours de son exploration, il fit une chute mortelle dans les escaliers du manoir et devint un fantôme, condamné à hanter les lieux.",
    "Frustré par sa nouvelle condition, il entreprit de nombreuses expériences dans l'espoir de revenir à la vie. Il aménagea alors un laboratoire secret dans la montagne, où il tenta de créer une potion capable de lui rendre son corps humain.",
    "Au fil du temps, de nouveaux fantômes rejoignirent le manoir. Ce lieu autrefois abandonné et sans vie devint progressivement un véritable foyer, où chacun pouvait se retrouver et profiter d'une seconde vie agréable. Aminat0 finit par s'attacher à ses nouveaux compagnons et abandonna peu à peu ses recherches sur la résurrection.",
    "Cependant, depuis son arrivée, Aminat0 avait toujours eu l'étrange sensation de ne pas être seul dans le manoir. Lorsqu'il en était encore l'unique habitant, il entendait parfois des bruits inexplicables résonner dans les couloirs et les pièces désertes. Avec l'arrivée des autres fantômes, les phénomènes se multiplièrent. Certains habitants affirmaient avoir aperçu Aminat0 à des endroits où il ne se trouvait pourtant pas, tandis que d'autres rapportaient des bruits indescriptibles et d'étranges manifestations, parfois même pendant les streams.",
    "Face à ces événements de plus en plus inquiétants, Aminat0 décida de reprendre ses recherches. Avec l'aide d'une amie sorcière maîtrisant l'art des potions, il entreprit cette fois de créer une potion capable de détruire l'entité fantomatique qui semblait hanter le manoir depuis bien avant son arrivée.",
    "Après de nombreuses expériences, la potion fut enfin prête. Un soir, Aminat0 décida d'affronter cette mystérieuse présence. Lorsqu'elle se manifesta devant lui, il lui lança la potion, provoquant sa disparition. Mais quelque chose d'inattendu se produisit : au lieu de simplement détruire l'entité, la potion provoqua le transfert de l'âme d'Aminat0 dans le corps fantomatique de cette dernière. Il avait réussi à éliminer la menace, mais avait involontairement pris sa place et son apparence, sans pour autant hériter de ses souvenirs.",
    "En cherchant à comprendre ce qui venait de lui arriver, Aminat0 découvrit peu à peu la véritable histoire du manoir. Celui-ci n'était pas une simple demeure abandonnée, mais une ancienne installation secrète de l'Initiative DHARMA, connue sous le nom de station Occulto. Cette station avait pour objectif de mener des expériences sur la vie après la mort, dans l'espoir de trouver un moyen de ressusciter les défunts.",
    "L'entité qui hantait le manoir était en réalité le fantôme d'un ancien employé de cette station, resté sur les lieux après l'abandon des recherches. Les circonstances de sa mort, tout comme les véritables raisons de la fermeture de la station, demeurent encore mystérieuses.",
    "Aujourd'hui, Aminat0_ continue de vivre dans le manoir aux côtés des autres fantômes, sous une apparence qui appartenait autrefois à cet employé de DHARMA. Si le manoir semble avoir retrouvé son calme, de nombreuses questions restent sans réponse. Que s'est-il réellement passé dans la station Occulto ? Pourquoi cet employé hantait-il encore les lieux ? Et surtout, les expériences de DHARMA ont-elles véritablement pris fin ?"
  ];

  const deverrouillerAudio = () => {
    if (window.audioTerminal) window.audioTerminal.initialiser();
  };
  window.addEventListener("click", deverrouillerAudio, { passive: true });
  window.addEventListener("touchend", deverrouillerAudio, { passive: true });
  window.addEventListener("keydown", deverrouillerAudio, { passive: true });

  const mettreAJourCompteurHud = () => {
    const mins = Math.floor(totalSecondes / 60);
    const secs = totalSecondes % 60;
    compteurHud.textContent = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");

    if (totalSecondes <= 240) {
      compteurHud.classList.add("urgent");
      if (totalSecondes % 30 === 0 && window.audioTerminal) {
        window.audioTerminal.jouerAlarmeDharma();
      }
    } else {
      compteurHud.classList.remove("urgent");
    }

    if (totalSecondes > 0) {
      totalSecondes--;
    } else {
      totalSecondes = 108 * 60;
      if (window.audioTerminal) window.audioTerminal.jouerAlarmeDharma();
    }
  };

  const mettreAJourProgression = () => {
    const liste = window.ENIGMES || [];
    if (enigmeActuelle < 0 || liste.length === 0) {
      progressionHud.textContent = "0%";
    } else {
      const pct = Math.min(100, Math.round((enigmeActuelle / liste.length) * 100));
      progressionHud.textContent = pct + "%";
    }
  };

  const demarrerCompteARebours = () => {
    if (!intervalleCompteur) {
      intervalleCompteur = setInterval(mettreAJourCompteurHud, 1000);
    }
  };

  if (boutonSon) {
    boutonSon.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.audioTerminal) {
        const actif = window.audioTerminal.basculerSon();
        boutonSon.textContent = actif ? "SON : ON" : "SON : MUTE";
        boutonSon.style.color = actif ? "var(--green)" : "#ff4444";
      }
    });
  }

  const focaliserEntree = () => {
    if (entreeCachee && !ligneSaisie.classList.contains("hidden") && !estEnTrainDEcrire) {
      entreeCachee.focus({ preventScroll: true });
    }
  };

  const activerSaisie = () => {
    ligneSaisie.classList.remove("hidden");
    defilerVersLeBas();
  };

  const defilerVersLeBas = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth"
    });
  };

  const initialiserDemarrage = (e) => {
    if (e) e.stopPropagation();
    if (terminalDemarre) return;
    terminalDemarre = true;

    ecranDemarrage.classList.remove("active");
    ecranTerminal.classList.add("active");

    if (window.audioTerminal) {
      window.audioTerminal.initialiser();
      window.audioTerminal.jouerUnSeulBipDharma();
      window.audioTerminal.bruitAllumageEcran();
      window.audioTerminal.demarrerAmbiance();
      setTimeout(() => {
        window.audioTerminal.jouerMurmureFantome();
      }, 1100);
    }

    demarrerCompteARebours();
    demarrerSequence();
  };

  boutonDemarrage.addEventListener("click", initialiserDemarrage);
  boutonDemarrage.addEventListener("touchend", initialiserDemarrage);
  ecranDemarrage.addEventListener("click", initialiserDemarrage);

  document.addEventListener("click", (e) => {
    if (!terminalDemarre) return;
    if (e.target === boutonValiderMobile || e.target.closest("#shortcuts-bar") || e.target.closest(".morse-play-btn") || e.target.closest("#sound-btn")) return;
    if (estEnTrainDEcrire) {
      passerTexte = true;
    } else {
      focaliserEntree();
    }
  });

  ligneSaisie.addEventListener("click", focaliserEntree);

  const ecrireTexte = async (texte, classeSupplementaire = "", vitesse = 20, conteneurCible = sortie) => {
    estEnTrainDEcrire = true;
    passerTexte = false;
    ligneSaisie.classList.add("hidden");

    const ligne = document.createElement("div");
    ligne.className = classeSupplementaire.startsWith("paragraphe-") ? classeSupplementaire : ("line " + classeSupplementaire).trim();
    conteneurCible.appendChild(ligne);

    const paquet = vitesse <= 5 ? 2 : 1;
    for (let i = 0; i < texte.length; i += paquet) {
      ligne.textContent += texte.slice(i, i + paquet);

      if (!passerTexte && window.audioTerminal) {
        if (classeSupplementaire.includes("document")) {
          if (Math.random() < 0.65) {
            window.audioTerminal.bruitDecryptage();
          } else if (Math.random() < 0.85) {
            window.audioTerminal.bruitDonnees();
          }
        } else if (Math.random() < 0.72) {
          window.audioTerminal.bruitTouche();
        }
      }

      if (!passerTexte) {
        await new Promise(r => setTimeout(r, vitesse));
      }
    }

    estEnTrainDEcrire = false;
    passerTexte = false;
    defilerVersLeBas();
    return ligne;
  };

  const afficherDirectement = (texte, classeSupplementaire = "") => {
    const ligne = document.createElement("div");
    ligne.className = ("line " + classeSupplementaire).trim();
    ligne.textContent = texte;
    sortie.appendChild(ligne);
    defilerVersLeBas();
    return ligne;
  };

  const demarrerSequence = async () => {
    await new Promise(r => setTimeout(r, 500));
    await ecrireTexte("> DÉMARRAGE D'OCCULTO OS...", "system", 20);
    await new Promise(r => setTimeout(r, 350));
    await ecrireTexte("> CONNEXION AU LIVE D'AMINATO...", "system", 20);
    await new Promise(r => setTimeout(r, 400));
    await ecrireTexte("> LOCALISATION : LE MANOIR D'AMINATO.", "system", 20);
    await new Promise(r => setTimeout(r, 450));
    if (window.audioTerminal) window.audioTerminal.bruitParasiteRadio();
    await ecrireTexte("> ALERTE TCHAT : PRÉSENCE DE TROLLS ET DE FANTÔMES.", "alert", 20);
    await new Promise(r => setTimeout(r, 550));

    afficherDirectement(
`       .---.            .---.
      /     \\          /     \\
     | () () |        | () () |  [ STATION OCCULTO - MANOIR D'AMINATO ]
      \\  ^  /          \\  ^  /   
       |||||            |||||`, "ascii");

    if (window.audioTerminal) window.audioTerminal.bruitDisqueDur();
    afficherDirectement(carteDuManoir, "table");

    await new Promise(r => setTimeout(r, 500));
    enigmeActuelle = 0;
    await poserEnigmeActuelle();
  };

  const poserEnigmeActuelle = async () => {
    mettreAJourProgression();
    compteurIndices = 0;
    const liste = window.ENIGMES || [];

    if (enigmeActuelle >= liste.length) {
      arreterMinuteurBipEnigme();
      await declencherClimaxVictoire();
      return;
    }

    const enigme = liste[enigmeActuelle];

    if (window.audioTerminal) window.audioTerminal.bruitDisqueDur();
    afficherDirectement("[ " + enigme.etape + " ]", "stage");
    afficherDirectement("SECTEUR : " + enigme.secteur, "sector");

    if (enigme.histoire) {
      await ecrireTexte(enigme.histoire, "story", 16);
      await new Promise(r => setTimeout(r, 300));
    }

    await ecrireTexte(enigme.question, "question", 20);

    if (enigme.audioOtan) {
      const motsOtan = enigme.audioOtan.toUpperCase().split("").map(l => (window.ALPHABET_OTAN && window.ALPHABET_OTAN[l]) ? window.ALPHABET_OTAN[l].toUpperCase() : l).join(" - ");
      const conteneurOtan = document.createElement("div");
      conteneurOtan.className = "line morse-cue";
      conteneurOtan.innerHTML = "<span>Signal OTAN capté : <strong>" + motsOtan + "</strong></span><button type='button' class='morse-play-btn'>[ ÉCOUTER LE SON ]</button>";
      sortie.appendChild(conteneurOtan);

      const boutonOtan = conteneurOtan.querySelector(".morse-play-btn");
      if (boutonOtan) {
        boutonOtan.addEventListener("click", (e) => {
          e.stopPropagation();
          if (window.audioTerminal) {
            boutonOtan.textContent = "TRANSMISSION...";
            window.audioTerminal.jouerOtan(enigme.audioOtan, () => {
              boutonOtan.textContent = "[ ÉCOUTER LE SON ]";
            });
          }
        });
      }

      if (!enigme.audioMorse) {
        setTimeout(() => {
          if (window.audioTerminal) {
            window.audioTerminal.jouerOtan(enigme.audioOtan);
          }
        }, 450);
      }
    }

    if (enigme.audioMorse) {
      const conteneurSon = document.createElement("div");
      conteneurSon.className = "line morse-cue";
      conteneurSon.innerHTML = "<span>Signal Morse capté : <strong>" + enigme.audioMorse + "</strong></span><button type='button' class='morse-play-btn'>[ ÉCOUTER LE SON ]</button>";
      sortie.appendChild(conteneurSon);

      const boutonPlay = conteneurSon.querySelector(".morse-play-btn");
      if (boutonPlay) {
        boutonPlay.addEventListener("click", (e) => {
          e.stopPropagation();
          if (window.audioTerminal) {
            boutonPlay.textContent = "TRANSMISSION...";
            window.audioTerminal.jouerMorse(enigme.audioMorse, () => {
              boutonPlay.textContent = "[ ÉCOUTER LE SON ]";
            });
          }
        });
      }

      setTimeout(() => {
        if (window.audioTerminal) {
          if (enigme.audioOtan) {
            window.audioTerminal.jouerOtan(enigme.audioOtan, () => {
              window.audioTerminal.jouerMorse(enigme.audioMorse);
            });
          } else {
            window.audioTerminal.jouerMorse(enigme.audioMorse);
          }
        }
      }, 450);
    }

    activerSaisie();
    demarrerMinuteurBipEnigme(enigmeActuelle);
  };

  const declencherClimaxVictoire = async () => {
    if (window.audioTerminal) {
      window.audioTerminal.bruitSucces();
      window.audioTerminal.jouerTonnerre();
    }

    await ecrireTexte("Noyau déverrouillé. Tu as atteint le cœur des Limbes.", "success", 20);
    await new Promise(r => setTimeout(r, 450));

    if (window.audioTerminal) {
      window.audioTerminal.bruitInterrupteur();
      window.audioTerminal.bruitDisqueDur();
    }
    await ecrireTexte("> SYNCHRONISATION AVEC LES SERVEURS CENTRAUX DHARMA...", "system", 20);
    await new Promise(r => setTimeout(r, 350));
    await ecrireTexte("> ACCÈS AUX ARCHIVES CLASSIFIÉES : AUTORISÉ.", "system", 20);
    await new Promise(r => setTimeout(r, 450));
    if (window.audioTerminal) window.audioTerminal.jouerMurmureFantome();
    await ecrireTexte("[ DÉCRYPTAGE DU DOSSIER : STATION OCCULTO // SUJET AMINAT0 ]", "alert-glitch", 15);
    await new Promise(r => setTimeout(r, 600));

    const boiteDocument = document.createElement("div");
    boiteDocument.className = "dossier-document";
    sortie.appendChild(boiteDocument);

    const enTete = document.createElement("div");
    enTete.className = "dossier-en-tete";
    enTete.innerHTML = 
      "<strong>DHARMA INITIATIVE // ARCHIVE CENTRALE DE LA STATION OCCULTO</strong><br>" +
      "DOSSIER CONFIDENTIEL : LE MANOIR D'AMINATO<br>" +
      "<div class='dossier-meta'>" +
      "RÉFÉRENCE : #481516-2342 | STATUT : RESTAURÉ | NIVEAU DE SÉCURITÉ : 4" +
      "</div>";
    boiteDocument.appendChild(enTete);

    const corpsDocument = document.createElement("div");
    corpsDocument.className = "dossier-corps";
    boiteDocument.appendChild(corpsDocument);

    for (let i = 0; i < histoireDuManoir.length; i++) {
      if (window.audioTerminal) window.audioTerminal.bruitDisqueDur();
      await ecrireTexte(histoireDuManoir[i], "paragraphe-document", 3, corpsDocument);
      await new Promise(r => setTimeout(r, 120));
    }

    if (window.audioTerminal) window.audioTerminal.bruitSucces();
    const pied = document.createElement("div");
    pied.className = "dossier-pied";
    pied.innerHTML = 
      "[ FIN DE TRANSMISSION - DOCUMENT EXTRAIT DU SERVEUR DHARMA ]<br>" +
      "<strong>LA VÉRITÉ SUR LE MANOIR D'AMINATO EST DÉSORMAIS CONNUE</strong>";
    boiteDocument.appendChild(pied);

    const zoneBouton = document.createElement("div");
    zoneBouton.className = "zone-effacer";
    const boutonEffacer = document.createElement("button");
    boutonEffacer.type = "button";
    boutonEffacer.className = "bouton-effacer";
    boutonEffacer.textContent = "[ EFFACER MES TRACES ]";
    zoneBouton.appendChild(boutonEffacer);
    sortie.appendChild(zoneBouton);

    boutonEffacer.addEventListener("click", (e) => {
      e.stopPropagation();
      lancerSuppressionTraces(zoneBouton, boiteDocument);
    });

    ligneSaisie.classList.add("hidden");
    defilerVersLeBas();
  };

  const normaliser = (chaine) => {
    return chaine
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’]/g, " ")
      .replace(/[.,;:!?]/g, "")
      .replace(/\s+/g, " ");
  };

  const traiterCommande = async (commandeBrute) => {
    const commande = commandeBrute.trim();
    if (!commande) return;

    if (window.audioTerminal) window.audioTerminal.bruitValidation();

    const echo = document.createElement("div");
    echo.className = "line echo";
    echo.textContent = ">_ " + commande;
    sortie.appendChild(echo);

    texteTape = "";
    if (affichageSaisie) affichageSaisie.textContent = "";
    if (entreeCachee) {
      entreeCachee.value = "";
      entreeCachee.blur();
    }
    ligneSaisie.classList.add("hidden");

    const norm = normaliser(commande);

    if (norm === "aide" || norm === "help" || norm === "?") {
      afficherDirectement(
`====================== COMMANDES DISPONIBLES ======================
  * aide / help     : Affiche les commandes.
  * indice / hint   : Affiche un indice pour l'énigme.
  * otan / nato     : Affiche l'alphabet radio OTAN.
  * morse           : Affiche l'abécédaire du code Morse.
  * bip / play      : Joue le son Morse de l'énigme.
  * aminato / lore  : Affiche les infos sur la Station Occulto.
  * manoir / carte  : Affiche la carte du Manoir d'Aminato.
  * compteur / timer: Affiche le temps restant (108:00).
  * statut / status : Affiche la progression.
  * son / audio     : Coupe ou réactive le son du terminal.
  * clear / effacer : Efface l'écran.
  * reset           : Relance le jeu.
===================================================================`, "table");
      activerSaisie();
      return;
    }

    if (norm === "otan" || norm === "nato") {
      if (window.audioTerminal) window.audioTerminal.bruitDonnees();
      afficherDirectement(
`=================== ALPHABET PHONÉTIQUE DE L'OTAN ===================
  A : Alpha        H : Hotel        O : Oscar        V : Victor
  B : Bravo        I : India        P : Papa         W : Whiskey
  C : Charlie      J : Juliett      Q : Quebec       X : X-ray
  D : Delta        K : Kilo         R : Romeo        Y : Yankee
  E : Echo         L : Lima         S : Sierra       Z : Zulu
  F : Foxtrot      M : Mike         T : Tango
  G : Golf         N : November     U : Uniform
=====================================================================`, "table");
      activerSaisie();
      return;
    }

    if (norm === "morse") {
      if (window.audioTerminal) window.audioTerminal.bruitDonnees();
      afficherDirectement(
`======================== TABLE DU CODE MORSE ========================
  A : .-       G : --.      M : --       S : ...      Y : -.--
  B : -...     H : ....     N : -.       T : -        Z : --..
  C : -.-.     I : ..       O : ---      U : ..-      0 : -----
  D : -..      J : .---     P : .--.     V : ...-     1 : .----
  E : .        K : -.-      Q : --.-     W : .--      4 : ....-
  F : ..-.     L : .-..     R : .-.      X : -..-     8 : ---..
=====================================================================`, "table");
      activerSaisie();
      return;
    }

    if (norm === "bip" || norm === "play" || norm === "son-morse") {
      const liste = window.ENIGMES || [];
      if (enigmeActuelle >= 0 && enigmeActuelle < liste.length) {
        const enigme = liste[enigmeActuelle];
        if (enigme.audioOtan && enigme.audioMorse && window.audioTerminal) {
          await ecrireTexte("> TRANSMISSION VOCALE OTAN + SIGNAL MORSE EN COURS...", "system", 18);
          window.audioTerminal.jouerOtan(enigme.audioOtan, () => {
            window.audioTerminal.jouerMorse(enigme.audioMorse);
          });
        } else if (enigme.audioOtan && window.audioTerminal) {
          await ecrireTexte("> TRANSMISSION VOCALE OTAN EN COURS...", "system", 18);
          window.audioTerminal.jouerOtan(enigme.audioOtan);
        } else if (enigme.audioMorse && window.audioTerminal) {
          await ecrireTexte("> ÉMISSION DU SIGNAL MORSE : " + enigme.audioMorse, "system", 18);
          window.audioTerminal.jouerMorse(enigme.audioMorse);
        } else {
          await ecrireTexte("> Pas de transmission audio prévue pour cette étape.", "system", 18);
        }
      }
      activerSaisie();
      return;
    }

    if (norm === "indice" || norm === "hint") {
      const liste = window.ENIGMES || [];
      if (enigmeActuelle >= 0 && enigmeActuelle < liste.length) {
        const enigme = liste[enigmeActuelle];
        if (enigme.indices && enigme.indices.length > 0) {
          const indice = enigme.indices[compteurIndices % enigme.indices.length];
          compteurIndices++;
          await ecrireTexte("INDICE : " + indice, "hint", 18);
        } else {
          await ecrireTexte("Pas d'indice disponible.", "system", 18);
        }
      }
      activerSaisie();
      return;
    }

    if (norm === "dharma" || norm === "lost" || norm === "lore" || norm === "aminato" || norm === "occulto") {
      if (window.audioTerminal) window.audioTerminal.bruitSucces();
      afficherDirectement(ficheStationOcculto, "ascii");
      activerSaisie();
      return;
    }

    if (norm === "manoir" || norm === "carte" || norm === "map" || norm === "plan") {
      if (window.audioTerminal) window.audioTerminal.bruitDisqueDur();
      afficherDirectement(carteDuManoir, "table");
      activerSaisie();
      return;
    }

    if (norm === "compteur" || norm === "timer") {
      const mins = Math.floor(totalSecondes / 60);
      const secs = totalSecondes % 60;
      await ecrireTexte("> TEMPS RESTANT : " + mins + "m " + secs + "s.", "system", 18);
      activerSaisie();
      return;
    }

    if (norm === "statut" || norm === "status") {
      const liste = window.ENIGMES || [];
      const pct = Math.min(100, Math.round((Math.max(0, enigmeActuelle) / liste.length) * 100));
      await ecrireTexte("> PROGRESSION : Niveau " + (Math.max(0, enigmeActuelle) + 1) + " / " + liste.length, "system", 18);
      await ecrireTexte("> COMPLÉTION : " + pct + "%", "system", 18);
      activerSaisie();
      return;
    }

    if (norm === "clear" || norm === "cls" || norm === "effacer") {
      sortie.innerHTML = "";
      const liste = window.ENIGMES || [];
      if (enigmeActuelle >= 0 && enigmeActuelle < liste.length) {
        await poserEnigmeActuelle();
      } else {
        activerSaisie();
      }
      return;
    }

    if (norm === "son" || norm === "audio" || norm === "mute") {
      if (window.audioTerminal) {
        const actif = window.audioTerminal.basculerSon();
        if (boutonSon) {
          boutonSon.textContent = actif ? "SON : ON" : "SON : MUTE";
          boutonSon.style.color = actif ? "var(--green)" : "#ff4444";
        }
        await ecrireTexte("> Son du système : " + (actif ? "ACTIVÉ" : "DÉSACTIVÉ"), "system", 18);
      }
      activerSaisie();
      return;
    }

    if (norm === "reset") {
      arreterMinuteurBipEnigme();
      sortie.innerHTML = "";
      enigmeActuelle = 0;
      totalSecondes = 108 * 60;
      await ecrireTexte("> REDÉMARRAGE DU JEU EN COURS...", "alert", 18);
      await new Promise(r => setTimeout(r, 600));
      await poserEnigmeActuelle();
      return;
    }

    if (norm === "4 8 15 16 23 42" && enigmeActuelle !== 0) {
      if (window.audioTerminal) window.audioTerminal.bruitSucces();
      await ecrireTexte("> Code DHARMA accepté.", "success", 18);
      activerSaisie();
      return;
    }

    if (norm === "konami" || norm === "layton" || norm === "uuddlrlrba" || norm === "protocol touche" || norm === "protocole touche" || norm === "touche") {
      declencherProtocoleTouche();
      activerSaisie();
      return;
    }

    await verifierReponseEnigme(commande);
  };

  const verifierReponseEnigme = async (saisieBrute) => {
    const liste = window.ENIGMES || [];
    const enigme = liste[enigmeActuelle];
    if (!enigme) return;

    const saisieNorm = normaliser(saisieBrute);

    const estCorrect = enigme.reponses.some(rep => {
      const repNorm = normaliser(rep);
      if (saisieNorm === repNorm) return true;
      if (saisieNorm.replace(/\s+/g, "") === repNorm.replace(/\s+/g, "")) return true;
      return false;
    });

    if (estCorrect) {
      arreterMinuteurBipEnigme();
      if (window.audioTerminal) window.audioTerminal.bruitSucces();
      await new Promise(r => setTimeout(r, 300));
      await ecrireTexte(enigme.messageVictoire || "> Bonne réponse. Validé.", "success", 18);
      await new Promise(r => setTimeout(r, 800));
      enigmeActuelle++;
      await poserEnigmeActuelle();
    } else {
      if (window.audioTerminal) window.audioTerminal.bruitErreur();
      await new Promise(r => setTimeout(r, 250));
      await ecrireTexte("Erreur. Mauvaise réponse.", "alert", 18);
      await new Promise(r => setTimeout(r, 350));
      await ecrireTexte("(Astuce : tapez 'indice', 'otan' ou 'morse' pour de l'aide)", "system", 16);
      activerSaisie();
    }
  };

  if (formulaireSaisie) {
    formulaireSaisie.addEventListener("submit", (e) => {
      e.preventDefault();
      const cmd = (entreeCachee && entreeCachee.value) ? entreeCachee.value : texteTape;
      traiterCommande(cmd);
    });
  }

  if (boutonValiderMobile) {
    boutonValiderMobile.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cmd = (entreeCachee && entreeCachee.value) ? entreeCachee.value : texteTape;
      traiterCommande(cmd);
    });
  }

  if (entreeCachee) {
    entreeCachee.addEventListener("input", () => {
      if (estEnTrainDEcrire) {
        entreeCachee.value = "";
        return;
      }
      texteTape = entreeCachee.value;
      if (affichageSaisie) affichageSaisie.textContent = texteTape;
      if (window.audioTerminal) window.audioTerminal.bruitTouche();
    });

    entreeCachee.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !estEnTrainDEcrire) {
        e.preventDefault();
        const cmd = entreeCachee.value || texteTape;
        traiterCommande(cmd);
      }
    });
  }

  const codeKonami = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let indexKonami = 0;
  let protocoleEnCours = false;

  const declencherProtocoleTouche = () => {
    if (protocoleEnCours) return;
    protocoleEnCours = true;

    texteTape = "";
    if (entreeCachee) entreeCachee.value = "";
    if (affichageSaisie) affichageSaisie.textContent = "";

    if (window.audioTerminal) {
      window.audioTerminal.jouerProtocoleTouche();
    }

    const overlay = document.createElement("div");
    overlay.className = "overlay-protocole";
    overlay.innerHTML =
      "<div class='cadre-protocole'>" +
        "<div class='viseur-protocole'>[ + ] CIBLE VERROUILLÉE [ + ]</div>" +
        "<div class='surtitre-protocole'>DHARMA INITIATIVE // OVERRIDE SECRET</div>" +
        "<div class='titre-protocole'>PROTOCOL TOUCHÉ ACTIVATED</div>" +
        "<div class='barre-protocole-conteneur'><div class='barre-protocole-remplissage'></div></div>" +
        "<div class='sous-texte-protocole'>&gt; SÉQUENCE LAYTON VALIDÉE — SYSTÈME OCCULTO SYNCHRONISÉ</div>" +
      "</div>";
    document.body.appendChild(overlay);

    if (sortie && ecranTerminal.classList.contains("active")) {
      afficherDirectement("> [OVERRIDE LAYTON] : PROTOCOL TOUCHÉ ACTIVATED // ACCÈS SECRET DÉVERROUILLÉ.", "success");
    }

    const fermerOverlay = () => {
      if (!overlay.parentNode) return;
      overlay.classList.add("sortie-protocole");
      setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
        protocoleEnCours = false;
      }, 450);
    };

    overlay.addEventListener("click", fermerOverlay);
    setTimeout(fermerOverlay, 3700);
  };

  const verifierToucheKonami = (touche) => {
    const tNorm = touche.length === 1 ? touche.toLowerCase() : touche;
    const attendu = codeKonami[indexKonami];
    if (tNorm === attendu) {
      indexKonami++;
      if (indexKonami === codeKonami.length) {
        indexKonami = 0;
        declencherProtocoleTouche();
        return true;
      }
      return indexKonami >= 9;
    } else {
      indexKonami = (tNorm === codeKonami[0]) ? 1 : 0;
      return false;
    }
  };

  let debutTouchX = 0;
  let debutTouchY = 0;
  const sequenceSwipeAttendue = ["U", "U", "D", "D", "L", "R", "L", "R"];
  let indexSwipe = 0;

  document.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) {
      debutTouchX = e.touches[0].clientX;
      debutTouchY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - debutTouchX;
    const dy = e.changedTouches[0].clientY - debutTouchY;
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    let dir = "";
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? "R" : "L";
    } else {
      dir = dy > 0 ? "D" : "U";
    }

    if (dir === sequenceSwipeAttendue[indexSwipe]) {
      indexSwipe++;
      if (indexSwipe === sequenceSwipeAttendue.length) {
        indexSwipe = 0;
        declencherProtocoleTouche();
      }
    } else {
      indexSwipe = (dir === sequenceSwipeAttendue[0]) ? 1 : 0;
    }
  }, { passive: true });

  let compteurTapsSecret = 0;
  let timerTapsSecret = null;
  const zoneHeaderSecret = document.getElementById("gotham-header");
  if (zoneHeaderSecret) {
    zoneHeaderSecret.addEventListener("click", () => {
      compteurTapsSecret++;
      if (timerTapsSecret) clearTimeout(timerTapsSecret);
      if (compteurTapsSecret >= 5) {
        compteurTapsSecret = 0;
        declencherProtocoleTouche();
      } else {
        timerTapsSecret = setTimeout(() => {
          compteurTapsSecret = 0;
        }, 2000);
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (verifierToucheKonami(e.key)) {
      e.preventDefault();
      return;
    }

    if (estEnTrainDEcrire) {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        passerTexte = true;
      }
      return;
    }

    if (!ecranTerminal.classList.contains("active")) return;

    if (e.target !== entreeCachee) {
      if (e.key === "Enter") {
        e.preventDefault();
        traiterCommande(texteTape);
      } else if (e.key === "Backspace") {
        texteTape = texteTape.slice(0, -1);
        if (entreeCachee) entreeCachee.value = texteTape;
        if (affichageSaisie) affichageSaisie.textContent = texteTape;
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        texteTape += e.key;
        if (entreeCachee) entreeCachee.value = texteTape;
        if (affichageSaisie) affichageSaisie.textContent = texteTape;
        if (window.audioTerminal) window.audioTerminal.bruitTouche(e.key === " ");
      }
    }
  });

  if (barreRaccourcis) {
    barreRaccourcis.addEventListener("click", (e) => {
      const pastille = e.target.closest(".shortcut-chip");
      if (pastille && pastille.dataset.cmd && !estEnTrainDEcrire) {
        traiterCommande(pastille.dataset.cmd);
      }
    });
  }

  const brouillerLigne = async (el, delai = 140) => {
    el.classList.add("texte-corrompu");
    const erreurs = ["ERR_VIRUS_", "INTRUSION_", "CORRUPTION_", "#01X!ERR_"];
    const tag = erreurs[Math.floor(Math.random() * erreurs.length)];
    el.textContent = tag + el.textContent.replace(/\S/g, () => Math.random() > 0.5 ? "#" : "0");
    if (window.audioTerminal) {
      if (Math.random() < 0.45) {
        window.audioTerminal.bruitErreur();
      } else {
        window.audioTerminal.bruitDecryptage();
      }
    }
    await new Promise(r => setTimeout(r, delai));
    el.classList.add("suppression-element");
    await new Promise(r => setTimeout(r, 150));
  };

  const lancerSuppressionTraces = async (zoneBouton, boiteDocument) => {
    arreterMinuteurBipEnigme();
    zoneBouton.remove();
    document.body.classList.add("alerte-intrusion");
    boiteDocument.classList.add("dossier-purge");

    if (compteurHud) {
      compteurHud.textContent = "INTRUSION";
      compteurHud.classList.add("urgent");
    }
    if (progressionHud) {
      progressionHud.textContent = "VIRUS !";
      progressionHud.style.color = "#ff2222";
    }

    if (window.audioTerminal) {
      window.audioTerminal.bruitErreur();
      window.audioTerminal.jouerAlarmeDharma();
    }

    let boucleAlarme = setInterval(() => {
      if (!window.audioTerminal) return;
      const r = Math.random();
      if (r < 0.4) {
        window.audioTerminal.jouerAlarmeDharma();
      } else if (r < 0.75) {
        window.audioTerminal.bruitSireneVirus();
      } else {
        window.audioTerminal.bruitErreur();
        window.audioTerminal.bruitDisqueDur();
      }
    }, 520);

    const alerteVirus = document.createElement("div");
    alerteVirus.className = "banniere-virus";
    alerteVirus.textContent = "[ ! ALERTE SÉCURITÉ DHARMA : INTRUSION ET TENTATIVE DE PURGE DÉTECTÉES ! ]";
    sortie.appendChild(alerteVirus);
    defilerVersLeBas();

    await new Promise(r => setTimeout(r, 350));
    await ecrireTexte("> TRAÇAGE DE L'INTRUS EN COURS... CONTRE-MESURES ACTIVÉES !", "alert", 12);
    await new Promise(r => setTimeout(r, 250));
    await ecrireTexte("> INJECTION DU VIRUS DE DESTRUCTION FORCÉE [OVERWRITE_SYS.EXE]...", "alert-glitch", 12);

    const barre = document.createElement("div");
    barre.className = "barre-suppression";
    sortie.appendChild(barre);
    defilerVersLeBas();

    const majBarre = (pct, texte) => {
      const nb = Math.round((pct / 100) * 12);
      barre.textContent = `> ${texte} [${"#".repeat(nb)}${"-".repeat(12 - nb)}] ${pct}%`;
    };

    const paragraphes = Array.from(boiteDocument.querySelectorAll(".paragraphe-document")).reverse();
    for (let i = 0; i < paragraphes.length; i++) {
      majBarre(Math.round(((i + 1) / paragraphes.length) * 55), "CORRUPTION VIRALE DES ARCHIVES");
      await brouillerLigne(paragraphes[i], 190);
    }

    boiteDocument.classList.add("suppression-element");
    await new Promise(r => setTimeout(r, 300));

    await ecrireTexte("> ERREUR CRITIQUE : CONTAMINATION DES SECTEURS MÉMOIRE DU TERMINAL !", "alert", 12);

    const lignes = Array.from(sortie.children).filter(el => el !== barre && el !== boiteDocument && el !== alerteVirus);
    for (let i = lignes.length - 1; i >= 0; i--) {
      const pct = 55 + Math.round(((lignes.length - i) / lignes.length) * 45);
      majBarre(pct, "DESTRUCTION FORCÉE DES TRACES");
      await brouillerLigne(lignes[i], 85);
    }

    majBarre(100, "SYSTÈME DÉTRUIT - TRACES EFFACÉES");
    alerteVirus.textContent = "[ SYSTÈME COMPROMIS - ARRÊT D'URGENCE DU TERMINAL OCCULTO OS ]";
    defilerVersLeBas();

    await new Promise(r => setTimeout(r, 650));
    clearInterval(boucleAlarme);

    if (window.audioTerminal) {
      window.audioTerminal.bruitInterrupteur();
      window.audioTerminal.bruitExtinctionEcran();
    }

    document.body.classList.remove("alerte-intrusion");
    ecranTerminal.classList.add("extinction-crt");
    await new Promise(r => setTimeout(r, 1150));

    sortie.innerHTML = "";
    enigmeActuelle = 0;
    compteurIndices = 0;
    texteTape = "";
    totalSecondes = 108 * 60;
    if (compteurHud) compteurHud.classList.remove("urgent");
    if (progressionHud) progressionHud.style.color = "var(--bright-green)";
    mettreAJourProgression();
    if (affichageSaisie) affichageSaisie.textContent = "";
    if (entreeCachee) entreeCachee.value = "";
    ligneSaisie.classList.add("hidden");

    ecranTerminal.classList.remove("active", "extinction-crt");
    await new Promise(r => setTimeout(r, 350));
    ecranDemarrage.classList.add("active");
    terminalDemarre = false;
    window.scrollTo(0, 0);
  };
});
