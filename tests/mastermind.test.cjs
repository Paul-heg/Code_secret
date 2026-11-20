'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');
const vm = require('node:vm');

const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'Le chargeur attend un unique script de jeu intégré.');
const contexte = vm.createContext({});
vm.runInContext(scripts[0][1], contexte, { filename: 'index.html', timeout: 1000 });
const { calculerIndices, creerPartie } = vm.runInContext('({ calculerIndices, creerPartie })', contexte);

console.log('Node.js : ' + process.version);
console.log('index.html SHA-256 : ' + createHash('sha256').update(html).digest('hex'));

const SECRET = Object.freeze(['rouge', 'bleu', 'rouge', 'vert']);
const INCORRECTE = Object.freeze(['jaune', 'jaune', 'jaune', 'jaune']);
const copie = valeur => JSON.parse(JSON.stringify(valeur));

function verifierIndices(proposition, bienPlacees, malPlacees) {
  assert.deepEqual(copie(calculerIndices(SECRET, proposition)), { bienPlacees, malPlacees });
}

test('1. Couleurs répétées : chaque occurrence compte au maximum une fois', () => {
  verifierIndices(['rouge', 'rouge', 'bleu', 'rouge'], 1, 2);
});

test('2. Aucune couleur présente', () => {
  verifierIndices(['jaune', 'jaune', 'orange', 'violet'], 0, 0);
});

test('3. Quatre couleurs présentes, toutes mal placées', () => {
  verifierIndices(['bleu', 'rouge', 'vert', 'rouge'], 0, 4);
});

function verifierRefus(proposition, message) {
  const partie = creerPartie(SECRET);
  partie.proposer(INCORRECTE);
  const avant = copie(partie.consulter());
  const resultat = partie.proposer(proposition);
  assert.match(resultat.erreur, message);
  assert.deepEqual(copie(partie.consulter()), avant);
  assert.equal(partie.consulter().historique.length, 1);
}

test('4. Une proposition incomplète est expliquée et ne consomme aucun essai', () => {
  for (const proposition of [
    ['rouge', 'bleu', '', 'vert'],
    ['rouge', 'bleu'],
    Array(4),
    null
  ]) {
    verifierRefus(proposition, /quatre positions/);
  }
});

test('5. Une couleur non autorisée est refusée sans modifier la partie', () => {
  verifierRefus(['rouge', 'bleu', 'rose', 'vert'], /Utilisez uniquement/);
});

test('6. Quatre bien placées au dixième essai donnent la victoire', () => {
  const partie = creerPartie(SECRET);
  for (let i = 0; i < 9; i++) partie.proposer(INCORRECTE);
  assert.equal(partie.consulter().etat, 'en-cours');
  const resultat = partie.proposer(SECRET);
  assert.equal(resultat.etat, 'victoire');
  assert.equal(resultat.historique.length, 10);
  assert.equal(resultat.historique[9].bienPlacees, 4);
  assert.equal(resultat.historique[9].malPlacees, 0);
});

test('7. Dix propositions sans victoire donnent la défaite', () => {
  const partie = creerPartie(SECRET);
  for (let i = 0; i < 9; i++) partie.proposer(INCORRECTE);
  assert.equal(partie.consulter().etat, 'en-cours');
  const resultat = partie.proposer(INCORRECTE);
  assert.equal(resultat.etat, 'defaite');
  assert.equal(resultat.historique.length, 10);
});

test('8. Les propositions sont sans effet après victoire et après défaite', () => {
  for (const victoire of [true, false]) {
    const partie = creerPartie(SECRET);
    if (victoire) partie.proposer(SECRET);
    else for (let i = 0; i < 10; i++) partie.proposer(INCORRECTE);
    const avant = copie(partie.consulter());
    assert.match(partie.proposer(SECRET).erreur, /partie est terminée/);
    assert.deepEqual(copie(partie.consulter()), avant);
  }
});

test('9. Une nouvelle partie logique commence en cours avec un historique vide', () => {
  const ancienne = creerPartie(SECRET);
  ancienne.proposer(SECRET);
  assert.equal(ancienne.consulter().etat, 'victoire');
  const nouvelle = creerPartie();
  assert.deepEqual(copie(nouvelle.consulter()), { etat: 'en-cours', historique: [] });
});

test('10. Modifier la saisie ou une copie de l’historique n’altère pas les essais', () => {
  const partie = creerPartie(SECRET);
  const saisie = [...INCORRECTE];
  const retour = partie.proposer(saisie);
  saisie[0] = 'rouge';
  retour.historique[0].proposition[0] = 'vert';
  const lecture = partie.consulter();
  lecture.historique[0].proposition[1] = 'bleu';
  lecture.historique[0].bienPlacees = 4;
  lecture.historique.push({ proposition: [...SECRET], bienPlacees: 4, malPlacees: 0 });
  assert.deepEqual(copie(partie.consulter()), {
    etat: 'en-cours',
    historique: [{ proposition: [...INCORRECTE], bienPlacees: 0, malPlacees: 0 }]
  });
});
