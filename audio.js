const audioTerminal = {
  ctx: null,
  actif: true,
  gainPrincipal: null,
  noeudsAmbiance: [],
  intervalleCreepy: null,
  deverrouille: false,
  donneesBrutesBip: null,
  tamponBipDharma: null,
  tamponPremierBip: null,
  pcmPremierBipG: null,
  pcmPremierBipD: null,
  promessePremierBip: null,
  promesseChargementBip: null,
  sourceBoucleBip: null,
  gainBoucleBip: null,
  boucleBipActive: false,
  donneesBrutesOtan: null,
  tamponOtan: null,
  promesseChargementOtan: null,
  reperesOtan: {
    A: [0.0, 0.448],    B: [0.7, 0.588],    C: [1.538, 0.554],  D: [2.347, 0.425],
    E: [3.034, 0.508],  F: [3.797, 0.782],  G: [4.835, 0.543],  H: [5.637, 0.643],
    I: [6.534, 0.515],  J: [7.311, 0.693],  K: [8.255, 0.47],   L: [8.98, 0.515],
    M: [9.757, 0.53],   N: [10.546, 0.693], O: [11.501, 0.587], P: [12.341, 0.469],
    Q: [13.068, 0.558], R: [13.885, 0.683], S: [14.827, 0.577], T: [15.66, 0.554],
    U: [16.47, 0.8],    V: [17.527, 0.575], W: [18.361, 0.581], X: [19.201, 0.554],
    Y: [20.016, 0.587], Z: [20.856, 0.51]
  },

  prechargerOtan() {
    if (this.promesseChargementOtan) return this.promesseChargementOtan;
    this.promesseChargementOtan = fetch("otan-radio.wav")
      .then((rep) => rep.arrayBuffer())
      .then((buf) => {
        this.donneesBrutesOtan = buf;
        if (this.ctx && !this.tamponOtan) {
          return this.decoderTamponOtan();
        }
        return null;
      })
      .catch(() => null);
    return this.promesseChargementOtan;
  },

  decoderTamponOtan() {
    if (this.tamponOtan) return Promise.resolve(this.tamponOtan);
    if (!this.ctx || !this.donneesBrutesOtan) return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const copie = this.donneesBrutesOtan.slice(0);
        this.ctx.decodeAudioData(
          copie,
          (tampon) => {
            this.tamponOtan = tampon;
            resolve(tampon);
          },
          () => resolve(null)
        );
      } catch (e) {
        resolve(null);
      }
    });
  },

  obtenirTamponOtan() {
    this.initialiser();
    if (this.tamponOtan) return Promise.resolve(this.tamponOtan);
    return this.prechargerOtan().then(() => this.decoderTamponOtan());
  },

  jouerOtan(lettresStr, aLaFin = null) {
    if (!this.actif) {
      if (aLaFin) aLaFin();
      return;
    }
    this.initialiser();
    this.obtenirTamponOtan().then((tampon) => {
      if (!tampon || !this.ctx || !this.gainPrincipal) {
        if (aLaFin) aLaFin();
        return;
      }

      const lettres = lettresStr.toUpperCase().replace(/[^A-Z]/g, "").split("");
      let curseur = this.ctx.currentTime + 0.04;

      lettres.forEach((lettre) => {
        const repere = this.reperesOtan[lettre];
        if (!repere) return;
        const debut = repere[0];
        const duree = repere[1];

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = tampon;

        gain.gain.setValueAtTime(0.0001, curseur);
        gain.gain.linearRampToValueAtTime(0.85, curseur + 0.02);
        gain.gain.setValueAtTime(0.85, curseur + Math.max(0.03, duree - 0.04));
        gain.gain.exponentialRampToValueAtTime(0.0001, curseur + duree);

        source.connect(gain);
        gain.connect(this.gainPrincipal);

        source.start(curseur, debut, duree + 0.02);
        curseur += duree + 0.16;
      });

      if (aLaFin) {
        const delaiMs = Math.max(100, (curseur - this.ctx.currentTime) * 1000);
        setTimeout(aLaFin, delaiMs);
      }
    });
  },

  jouerProtocoleTouche(aLaFin = null) {
    if (!this.actif) {
      if (aLaFin) aLaFin();
      return;
    }
    this.initialiser();
    this.bruitSucces();
    this.obtenirTamponOtan().then((tampon) => {
      if (!tampon || !this.ctx || !this.gainPrincipal) {
        if (aLaFin) aLaFin();
        return;
      }

      const debut = 21.62;
      const duree = 3.494;
      const t = this.ctx.currentTime + 0.12;

      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      source.buffer = tampon;

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.95, t + 0.03);
      gain.gain.setValueAtTime(0.95, t + duree - 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);

      source.connect(gain);
      gain.connect(this.gainPrincipal);

      source.start(t, debut, duree + 0.02);

      if (aLaFin) {
        setTimeout(aLaFin, Math.round((duree + 0.2) * 1000));
      }
    });
  },

  extrairePremierBipPCM(octets) {
    if (this.pcmPremierBipG || octets.byteLength < 282284) return false;
    const nbFrames = 70560;
    const vue = new DataView(octets.buffer, octets.byteOffset + 44, nbFrames * 4);
    const gauche = new Float32Array(nbFrames);
    const droite = new Float32Array(nbFrames);
    for (let i = 0; i < nbFrames; i++) {
      gauche[i] = vue.getInt16(i * 4, true) / 32768;
      droite[i] = vue.getInt16(i * 4 + 2, true) / 32768;
    }
    this.pcmPremierBipG = gauche;
    this.pcmPremierBipD = droite;
    return true;
  },

  prechargerBipDharma() {
    if (this.promesseChargementBip) return this.promesseChargementBip;

    let resoudrePremierBip;
    this.promessePremierBip = new Promise((res) => {
      resoudrePremierBip = res;
    });

    this.promesseChargementBip = fetch("bip-dharma.wav")
      .then(async (rep) => {
        if (rep.body && rep.body.getReader) {
          const lecteur = rep.body.getReader();
          const morceaux = [];
          let totalOctets = 0;

          while (true) {
            const { done, value } = await lecteur.read();
            if (done) break;
            if (value) {
              morceaux.push(value);
              totalOctets += value.byteLength;
              if (!this.pcmPremierBipG && totalOctets >= 282284) {
                const temp = new Uint8Array(totalOctets);
                let pos = 0;
                for (let k = 0; k < morceaux.length; k++) {
                  temp.set(morceaux[k], pos);
                  pos += morceaux[k].byteLength;
                }
                if (this.extrairePremierBipPCM(temp)) {
                  resoudrePremierBip(true);
                }
              }
            }
          }

          const complet = new Uint8Array(totalOctets);
          let curseur = 0;
          for (let k = 0; k < morceaux.length; k++) {
            complet.set(morceaux[k], curseur);
            curseur += morceaux[k].byteLength;
          }
          if (!this.pcmPremierBipG) {
            this.extrairePremierBipPCM(complet);
            resoudrePremierBip(true);
          }
          this.donneesBrutesBip = complet.buffer;
        } else {
          const buf = await rep.arrayBuffer();
          this.extrairePremierBipPCM(new Uint8Array(buf));
          resoudrePremierBip(true);
          this.donneesBrutesBip = buf;
        }

        if (this.ctx && !this.tamponBipDharma) {
          return this.decoderTamponBip();
        }
        return null;
      })
      .catch(() => {
        resoudrePremierBip(false);
        return null;
      });

    return this.promesseChargementBip;
  },

  decoderTamponBip() {
    if (this.tamponBipDharma) return Promise.resolve(this.tamponBipDharma);
    if (!this.ctx || !this.donneesBrutesBip) return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const copie = this.donneesBrutesBip.slice(0);
        this.ctx.decodeAudioData(
          copie,
          (tampon) => {
            this.tamponBipDharma = tampon;
            resolve(tampon);
          },
          () => resolve(null)
        );
      } catch (e) {
        resolve(null);
      }
    });
  },

  obtenirTamponBip() {
    this.initialiser();
    if (this.tamponBipDharma) return Promise.resolve(this.tamponBipDharma);
    return this.prechargerBipDharma().then(() => this.decoderTamponBip());
  },

  lancerLecturePremierBip() {
    if (!this.ctx || !this.gainPrincipal || !this.pcmPremierBipG) return false;
    try {
      if (!this.tamponPremierBip) {
        const nbFrames = this.pcmPremierBipG.length;
        const tampon = this.ctx.createBuffer(2, nbFrames, 44100);
        tampon.getChannelData(0).set(this.pcmPremierBipG);
        tampon.getChannelData(1).set(this.pcmPremierBipD);
        this.tamponPremierBip = tampon;
      }

      const t = this.ctx.currentTime;
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();

      source.buffer = this.tamponPremierBip;
      source.loop = false;

      gain.gain.setValueAtTime(0.55, t);
      gain.gain.setValueAtTime(0.55, t + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.58);

      source.connect(gain);
      gain.connect(this.gainPrincipal);

      source.start(t, 0, 1.6);
      return true;
    } catch (e) {
      return false;
    }
  },

  jouerUnSeulBipDharma() {
    this.initialiser();
    if (this.lancerLecturePremierBip()) return;
    this.prechargerBipDharma();
    if (this.promessePremierBip) {
      this.promessePremierBip.then(() => {
        this.lancerLecturePremierBip();
      });
    }
  },

  demarrerBoucleBipDharma() {
    if (this.boucleBipActive) return;
    this.boucleBipActive = true;
    this.initialiser();

    this.obtenirTamponBip().then((tampon) => {
      if (!this.boucleBipActive || !tampon || !this.ctx || !this.gainPrincipal) return;
      if (this.sourceBoucleBip) return;

      try {
        const t = this.ctx.currentTime + 0.01;
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        source.buffer = tampon;
        source.loop = true;
        source.loopStart = 0;
        source.loopEnd = tampon.duration;

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.55, t + 0.18);

        source.connect(gain);
        gain.connect(this.gainPrincipal);

        source.start(t, 0);
        this.sourceBoucleBip = source;
        this.gainBoucleBip = gain;
      } catch (e) {}
    });
  },

  arreterBoucleBipDharma() {
    this.boucleBipActive = false;
    const source = this.sourceBoucleBip;
    const gain = this.gainBoucleBip;
    this.sourceBoucleBip = null;
    this.gainBoucleBip = null;

    if (source && gain && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        source.stop(t + 0.36);
      } catch (e) {
        try {
          source.stop();
        } catch (err) {}
      }
    }
  },

  initialiser() {
    if (!this.ctx) {
      const ConstructeurAudio = window.AudioContext || window.webkitAudioContext;
      if (ConstructeurAudio) {
        this.ctx = new ConstructeurAudio();
        this.gainPrincipal = this.ctx.createGain();
        const estMobile = window.innerWidth <= 768 || ("ontouchstart" in window);
        this.gainPrincipal.gain.setValueAtTime(estMobile ? 0.65 : 0.45, this.ctx.currentTime);
        this.gainPrincipal.connect(this.ctx.destination);
      }
    }
    if (this.ctx) {
      if (this.ctx.state === "suspended" || this.ctx.state === "interrupted") {
        this.ctx.resume();
      }
      if (!this.deverrouille) {
        try {
          const tampon = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = tampon;
          source.connect(this.ctx.destination);
          source.start(0);
          this.deverrouille = true;
        } catch (err) {}
      }
      if (this.donneesBrutesBip && !this.tamponBipDharma) {
        this.decoderTamponBip();
      }
      if (this.donneesBrutesOtan && !this.tamponOtan) {
        this.decoderTamponOtan();
      }
    }
    return this.ctx;
  },

  basculerSon() {
    this.actif = !this.actif;
    if (this.gainPrincipal && this.ctx) {
      const estMobile = window.innerWidth <= 768 || ("ontouchstart" in window);
      const cible = this.actif ? (estMobile ? 0.65 : 0.45) : 0.0001;
      this.gainPrincipal.gain.setValueAtTime(cible, this.ctx.currentTime);
    }
    return this.actif;
  },

  bruitInterrupteur() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.gainPrincipal);
    osc.start(t);
    osc.stop(t + 0.085);

    const claquement = this.ctx.createOscillator();
    const filtre = this.ctx.createBiquadFilter();
    const gainClaquement = this.ctx.createGain();
    claquement.type = "triangle";
    claquement.frequency.setValueAtTime(1100, t);
    claquement.frequency.exponentialRampToValueAtTime(180, t + 0.035);

    filtre.type = "lowpass";
    filtre.frequency.setValueAtTime(1100, t);

    gainClaquement.gain.setValueAtTime(0.2, t);
    gainClaquement.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    claquement.connect(filtre);
    filtre.connect(gainClaquement);
    gainClaquement.connect(this.gainPrincipal);
    claquement.start(t);
    claquement.stop(t + 0.04);
  },

  bruitAllumageEcran() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.01;

    const degauss = this.ctx.createOscillator();
    const filtreDegauss = this.ctx.createBiquadFilter();
    const gainDegauss = this.ctx.createGain();

    degauss.type = "sawtooth";
    degauss.frequency.setValueAtTime(115, t);
    degauss.frequency.exponentialRampToValueAtTime(52, t + 0.45);
    degauss.frequency.linearRampToValueAtTime(85, t + 0.9);

    filtreDegauss.type = "lowpass";
    filtreDegauss.frequency.setValueAtTime(340, t);

    gainDegauss.gain.setValueAtTime(0.001, t);
    gainDegauss.gain.linearRampToValueAtTime(0.22, t + 0.08);
    gainDegauss.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    degauss.connect(filtreDegauss);
    filtreDegauss.connect(gainDegauss);
    gainDegauss.connect(this.gainPrincipal);
    degauss.start(t);
    degauss.stop(t + 1.0);
  },

  demarrerAmbiance() {
    if (this.noeudsAmbiance.length > 0) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.02;

    const bourdon = this.ctx.createOscillator();
    const filtreBourdon = this.ctx.createBiquadFilter();
    const gainBourdon = this.ctx.createGain();

    bourdon.type = "sawtooth";
    bourdon.frequency.setValueAtTime(58, t);

    filtreBourdon.type = "lowpass";
    filtreBourdon.frequency.setValueAtTime(210, t);

    gainBourdon.gain.setValueAtTime(0.001, t);
    gainBourdon.gain.linearRampToValueAtTime(0.055, t + 2.0);

    bourdon.connect(filtreBourdon);
    filtreBourdon.connect(gainBourdon);
    gainBourdon.connect(this.gainPrincipal);
    bourdon.start(t);

    const harmonique = this.ctx.createOscillator();
    const gainHarmonique = this.ctx.createGain();
    harmonique.type = "triangle";
    harmonique.frequency.setValueAtTime(116, t);

    gainHarmonique.gain.setValueAtTime(0.001, t);
    gainHarmonique.gain.linearRampToValueAtTime(0.035, t + 2.0);

    harmonique.connect(gainHarmonique);
    gainHarmonique.connect(this.gainPrincipal);
    harmonique.start(t);

    try {
      const duree = 3;
      const taille = this.ctx.sampleRate * duree;
      const buffer = this.ctx.createBuffer(1, taille, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let dernier = 0;
      for (let i = 0; i < taille; i++) {
        const blanc = Math.random() * 2 - 1;
        data[i] = (dernier + 0.04 * blanc) / 1.04;
        dernier = data[i];
      }

      const ventilo = this.ctx.createBufferSource();
      ventilo.buffer = buffer;
      ventilo.loop = true;

      const filtreVentilo = this.ctx.createBiquadFilter();
      filtreVentilo.type = "bandpass";
      filtreVentilo.frequency.setValueAtTime(280, t);
      filtreVentilo.Q.setValueAtTime(1.1, t);

      const gainVentilo = this.ctx.createGain();
      gainVentilo.gain.setValueAtTime(0.001, t);
      gainVentilo.gain.linearRampToValueAtTime(0.085, t + 2.0);

      ventilo.connect(filtreVentilo);
      filtreVentilo.connect(gainVentilo);
      gainVentilo.connect(this.gainPrincipal);
      ventilo.start(t);

      this.noeudsAmbiance.push(ventilo);
    } catch (e) {}

    this.noeudsAmbiance.push(bourdon, harmonique);

    if (!this.intervalleCreepy) {
      this.intervalleCreepy = setInterval(() => {
        if (!this.actif || !this.ctx) return;
        const tirage = Math.random();
        if (tirage < 0.5) {
          this.jouerMurmureFantome();
        } else if (tirage < 0.8) {
          this.bruitDisqueDur();
        } else {
          this.bruitParasiteRadio();
        }
      }, 6000);
    }
  },

  bruitDisqueDur() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    const nbAccs = 5 + Math.floor(Math.random() * 7);
    let curseur = t;

    for (let i = 0; i < nbAccs; i++) {
      const osc = this.ctx.createOscillator();
      const filtre = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "square";
      const freq = 190 + Math.random() * 320;
      osc.frequency.setValueAtTime(freq, curseur);
      osc.frequency.exponentialRampToValueAtTime(75, curseur + 0.018);

      filtre.type = "bandpass";
      filtre.frequency.setValueAtTime(450, curseur);
      filtre.Q.setValueAtTime(2.2, curseur);

      gain.gain.setValueAtTime(0.095, curseur);
      gain.gain.exponentialRampToValueAtTime(0.001, curseur + 0.018);

      osc.connect(filtre);
      filtre.connect(gain);
      gain.connect(this.gainPrincipal);

      osc.start(curseur);
      osc.stop(curseur + 0.02);

      curseur += 0.025 + Math.random() * 0.055;
    }
  },

  bruitDecryptage() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.002;
    const osc = this.ctx.createOscillator();
    const filtre = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "square";
    const notes = [440, 520, 610, 740, 860, 980, 680];
    const f1 = notes[Math.floor(Math.random() * notes.length)];
    const f2 = notes[Math.floor(Math.random() * notes.length)];
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.setValueAtTime(f2, t + 0.014);

    filtre.type = "lowpass";
    filtre.frequency.setValueAtTime(980, t);

    gain.gain.setValueAtTime(0.065, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(this.gainPrincipal);
    osc.start(t);
    osc.stop(t + 0.032);
  },

  bruitSireneVirus() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const filtre = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(680, t + 0.18);
    osc.frequency.linearRampToValueAtTime(260, t + 0.36);

    filtre.type = "lowpass";
    filtre.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(this.gainPrincipal);
    osc.start(t);
    osc.stop(t + 0.4);
  },

  bruitParasiteRadio() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    try {
      const duree = 0.25 + Math.random() * 0.25;
      const taille = Math.floor(this.ctx.sampleRate * duree);
      const buffer = this.ctx.createBuffer(1, taille, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < taille; i++) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.35 ? 1 : 0.15);
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filtre = this.ctx.createBiquadFilter();
      filtre.type = "bandpass";
      filtre.frequency.setValueAtTime(520, t);
      filtre.Q.setValueAtTime(3.2, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duree);

      source.connect(filtre);
      filtre.connect(gain);
      gain.connect(this.gainPrincipal);

      source.start(t);
      source.stop(t + duree);
    } catch (e) {}
  },

  bruitTouche(estEspace = false) {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.002;

    const clic = this.ctx.createOscillator();
    const filtre = this.ctx.createBiquadFilter();
    const gainClic = this.ctx.createGain();

    clic.type = "triangle";
    const freq = estEspace ? 340 : 620 + (Math.random() * 240 - 120);
    clic.frequency.setValueAtTime(freq, t);
    clic.frequency.exponentialRampToValueAtTime(150, t + 0.028);

    filtre.type = "lowpass";
    filtre.frequency.setValueAtTime(1050, t);

    gainClic.gain.setValueAtTime(estEspace ? 0.11 : 0.085, t);
    gainClic.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

    clic.connect(filtre);
    filtre.connect(gainClic);
    gainClic.connect(this.gainPrincipal);
    clic.start(t);
    clic.stop(t + 0.032);

    const choc = this.ctx.createOscillator();
    const gainChoc = this.ctx.createGain();
    choc.type = "sine";
    choc.frequency.setValueAtTime(estEspace ? 140 : 220 + Math.random() * 40, t);
    choc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

    gainChoc.gain.setValueAtTime(0.06, t);
    gainChoc.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    choc.connect(gainChoc);
    gainChoc.connect(this.gainPrincipal);
    choc.start(t);
    choc.stop(t + 0.045);
  },

  bruitDonnees() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.002;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const gammes = [620, 780, 940, 1120, 520];
    const freq = gammes[Math.floor(Math.random() * gammes.length)];
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.gainPrincipal);
    osc.start(t);
    osc.stop(t + 0.03);
  },

  bruitValidation() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.002;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(760, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.085);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

    osc.connect(gain);
    gain.connect(this.gainPrincipal);
    osc.start(t);
    osc.stop(t + 0.09);
  },

  bruitSucces() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    const notes = [293.66, 369.99, 440.00, 587.33, 659.25, 880.00];

    notes.forEach((freq, idx) => {
      const moment = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, moment);

      gain.gain.setValueAtTime(0.001, moment);
      gain.gain.linearRampToValueAtTime(0.11, moment + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, moment + 0.42);

      osc.connect(gain);
      gain.connect(this.gainPrincipal);
      osc.start(moment);
      osc.stop(moment + 0.45);
    });

    const grave = this.ctx.createOscillator();
    const gainGrave = this.ctx.createGain();
    grave.type = "sine";
    grave.frequency.setValueAtTime(73.42, t);
    grave.frequency.linearRampToValueAtTime(146.83, t + 0.5);

    gainGrave.gain.setValueAtTime(0.001, t);
    gainGrave.gain.linearRampToValueAtTime(0.12, t + 0.15);
    gainGrave.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    grave.connect(gainGrave);
    gainGrave.connect(this.gainPrincipal);
    grave.start(t);
    grave.stop(t + 0.72);
  },

  bruitErreur() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;

    const grave = this.ctx.createOscillator();
    const filtreGrave = this.ctx.createBiquadFilter();
    const gainGrave = this.ctx.createGain();
    grave.type = "sawtooth";
    grave.frequency.setValueAtTime(145, t);
    grave.frequency.exponentialRampToValueAtTime(40, t + 0.32);

    filtreGrave.type = "lowpass";
    filtreGrave.frequency.setValueAtTime(480, t);

    gainGrave.gain.setValueAtTime(0.22, t);
    gainGrave.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    grave.connect(filtreGrave);
    filtreGrave.connect(gainGrave);
    gainGrave.connect(this.gainPrincipal);
    grave.start(t);
    grave.stop(t + 0.34);

    const bourdon = this.ctx.createOscillator();
    const gainBourdon = this.ctx.createGain();
    bourdon.type = "sawtooth";
    bourdon.frequency.setValueAtTime(98, t);
    bourdon.frequency.setValueAtTime(78, t + 0.12);

    gainBourdon.gain.setValueAtTime(0.18, t);
    gainBourdon.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    bourdon.connect(gainBourdon);
    gainBourdon.connect(this.gainPrincipal);
    bourdon.start(t);
    bourdon.stop(t + 0.3);

    this.bruitParasiteRadio();
  },

  bruitExtinctionEcran() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const filtre = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.85);

    filtre.type = "lowpass";
    filtre.frequency.setValueAtTime(520, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(this.gainPrincipal);
    osc.start(t);
    osc.stop(t + 0.9);
  },

  jouerMorse(morseStr, aLaFin = null) {
    if (!this.actif) {
      if (aLaFin) aLaFin();
      return;
    }
    this.initialiser();
    if (!this.ctx) {
      if (aLaFin) aLaFin();
      return;
    }

    const dureePoint = 0.085;
    const dureeTrait = dureePoint * 3;
    const pauseEntreSymboles = dureePoint;
    const pauseEntreLettres = dureePoint * 3;
    const pauseEntreMots = dureePoint * 7;
    const frequence = 700;

    let temps = this.ctx.currentTime + 0.05;

    const mots = morseStr.trim().split(/\s+/);
    mots.forEach((groupe) => {
      for (let i = 0; i < groupe.length; i++) {
        const symbole = groupe[i];
        if (symbole === "." || symbole === "-") {
          const duree = symbole === "-" ? dureeTrait : dureePoint;

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(frequence, temps);

          gain.gain.setValueAtTime(0.001, temps);
          gain.gain.linearRampToValueAtTime(0.15, temps + 0.006);
          gain.gain.setValueAtTime(0.15, temps + duree - 0.006);
          gain.gain.linearRampToValueAtTime(0.001, temps + duree);

          osc.connect(gain);
          gain.connect(this.gainPrincipal);

          osc.start(temps);
          osc.stop(temps + duree + 0.01);

          temps += duree + pauseEntreSymboles;
        } else if (symbole === "/") {
          temps += pauseEntreMots;
        }
      }
      temps += pauseEntreLettres;
    });

    if (aLaFin) {
      const delaiMs = Math.max(100, (temps - this.ctx.currentTime) * 1000);
      setTimeout(aLaFin, delaiMs);
    }
  },

  jouerAlarmeDharma() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    const tonalites = [
      { f: 440, dur: 0.22 },
      { f: 620, dur: 0.28 }
    ];

    let tempsTon = t;
    tonalites.forEach((ton) => {
      const osc = this.ctx.createOscillator();
      const filtre = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(ton.f, tempsTon);

      filtre.type = "lowpass";
      filtre.frequency.setValueAtTime(950, tempsTon);

      gain.gain.setValueAtTime(0.001, tempsTon);
      gain.gain.linearRampToValueAtTime(0.16, tempsTon + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, tempsTon + ton.dur);

      osc.connect(filtre);
      filtre.connect(gain);
      gain.connect(this.gainPrincipal);

      osc.start(tempsTon);
      osc.stop(tempsTon + ton.dur + 0.02);

      tempsTon += ton.dur + 0.04;
    });
  },

  jouerMurmureFantome() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const gainLfo = this.ctx.createGain();
    const filtre = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(310, t);
    osc.frequency.linearRampToValueAtTime(520, t + 0.8);
    osc.frequency.exponentialRampToValueAtTime(240, t + 1.8);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(5.5, t);
    gainLfo.gain.setValueAtTime(38, t);
    lfo.connect(gainLfo);
    gainLfo.connect(osc.frequency);

    filtre.type = "bandpass";
    filtre.frequency.setValueAtTime(420, t);
    filtre.Q.setValueAtTime(2.8, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(this.gainPrincipal);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 1.85);
    osc.stop(t + 1.85);
  },

  jouerTonnerre() {
    if (!this.actif) return;
    this.initialiser();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + 0.005;
    try {
      const taille = Math.floor(this.ctx.sampleRate * 1.6);
      const buffer = this.ctx.createBuffer(1, taille, this.ctx.sampleRate);
      const donnees = buffer.getChannelData(0);
      for (let i = 0; i < taille; i++) {
        donnees[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.55));
      }

      const bruit = this.ctx.createBufferSource();
      bruit.buffer = buffer;

      const filtre = this.ctx.createBiquadFilter();
      filtre.type = "lowpass";
      filtre.frequency.setValueAtTime(160, t);
      filtre.frequency.exponentialRampToValueAtTime(55, t + 1.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.55);

      bruit.connect(filtre);
      filtre.connect(gain);
      gain.connect(this.gainPrincipal);

      bruit.start(t);
      bruit.stop(t + 1.6);
    } catch (e) {}
  }
};

audioTerminal.prechargerBipDharma();
audioTerminal.prechargerOtan();
window.audioTerminal = audioTerminal;
