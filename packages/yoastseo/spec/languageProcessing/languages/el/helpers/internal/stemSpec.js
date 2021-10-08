import stem from "../../../../../../src/languageProcessing/languages/el/helpers/internal/stem";

import getMorphologyData from "../../../../../specHelpers/getMorphologyData";

const morphologyDataEL = getMorphologyData( "el" ).el;

const wordsToStem = [
	// Stem words from step 1 exception.
	[ "κρεας", "κρε" ],
	[ "ημιφως", "ημιφω" ],
	[ "πανγκρεας", "πανγκρε" ],
	[ "κομπολογια", "κομπολογ" ],
	[ "πατερας", "πατερ" ],
	// Step 1a.
	[ "γιαγιαδων", "γιαγι" ],
	[ "ομαδες", "ομαδ" ],
	// Step 1b.
	[ "καφεδων", "καφ" ],
	[ "γηπεδων", "γηπεδ" ],
	// Step 1c.
	[ "παππουδων", "παππ" ],
	[ "αρκουδες", "αρκουδ" ],
	// Step 1d.
	[ "υποθεσεως", "υποθεσ" ],
	[ "υποθεσεων", "υποθεσ" ],
	[ "θεων", "θε" ],
	// Step 2a.
	[ "γυναικειο", "γυναικ" ],
	[ "τελειου", "τελει" ],
	[ "τελειων", "τελει" ],
	[ "θεια", "θει" ],
	// Step 2b.
	[ "παιδια", "παιδ" ],
	// Step 3.
	[ "ζηλιαρικο", "ζηλιαρ" ],
	[ "αγροικου", "αγροικ" ],
	// Step 4a.
	[ "αγαπαμε", "αγαπ" ],
	[ "αγαπησαμε", "αγαπ" ],
	// [ "αναπαμε", "αναπαμ" ],
	// Step 4b.
	[ "αγαπησανε", "αγαπ" ],
	// [ "τραγανε", "τραγαν" ],
	[ "βραχμανε", "βραχμαν" ],
	// [ "σαρακατσανε", "σαρακατσαν" ],
	// Step 4c.
	[ "αγαπησετε", "αγαπ" ],
	[ "βενετε", "βενετ" ],
	// Step 4d.
	[ "αγαπωντας", "αγαπ" ],
	[ "αρχοντας", "αρχοντ" ],
	[ "κρεωντας", "κρεωντ" ],
	// Step 4e.
	[ "αγαπιομαστε", "αγαπ" ],
	[ "ονομαστε", "ονομαστ" ],
	// Step 4f.
	[ "αγαπιεστε", "αγαπ" ],
	[ "πιεστε", "πιεστ" ],
	[ "εκτελεστε", "εκτελεστ" ],
	// Step 4g.
	[ "χτιστηκε", "χτιστ" ],
	// [ "διαθηκη", "διαθη" ],
	// [ "διαθηκες", "διαθη" ],
	[ "κατακτηθηκε", "κατακτ" ],
	[ "πολεμηθηκε", "πολεμ" ],
	// Step 4h.
	[ "χτυπω", "χτυπ" ],
	[ "χτυπουσες", "χτυπ" ],
	[ "μεδουσα", "μεδους" ],
	[ "μεδουσα", "μεδους" ],
	// Step 4i.
	[ "κολλαω", "κολλ" ],
	// [ "κολλαγες", "κολλ" ],
	[ "αβασταγο", "αβασταγ" ],
	[ "αβασταγα", "αβασταγ" ],
	// Step 4j.
	[ "αγαπω", "αγαπ" ],
	[ "αγαπησε", "αγαπ" ],
	[ "σβηστος", "σβηστ" ],
	[ "σβηστε", "σβηστ" ],
	// Step 4l.
	[ "αγαπουνε", "αγαπ" ],
	[ "νουνος", "νουν" ],
	[ "νουνε", "νουν" ],
	// Step 4m.
	[ "αγαπουμε", "αγαπ" ],
	[ "φουμος", "φουμ" ],
	[ "φουμε", "φουμ" ],
];


const paradigms = [];


describe( "Test for stemming Greek words", () => {
	it( "stems Greek words", () => {
		wordsToStem.forEach( wordToStem => expect( stem( wordToStem[ 0 ], morphologyDataEL ) ).toBe( wordToStem[ 1 ] ) );
	} );
} );

xdescribe( "Test to make sure all forms of a paradigm get stemmed to the same stem", () => {
	for ( const paradigm of paradigms ) {
		for ( const form of paradigm.forms ) {
			it( "correctly stems the word: " + form + " to " + paradigm.stem, () => {
				expect( stem( form, morphologyDataEL ) ).toBe( paradigm.stem );
			} );
		}
	}
} );
