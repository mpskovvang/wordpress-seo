import { escapeRegExp, get, includes, uniq } from "lodash-es";
import flattenDeep from "lodash-es/flattenDeep";
import filterFunctionWordsFromArray from "../helpers/filterFunctionWordsFromArray";
import getLanguage from "../helpers/getLanguage";
import getStemForLanguageFactory from "../helpers/getStemForLanguage";
const stemFunctions = getStemForLanguageFactory();

import getWords from "../stringProcessing/getWords";
import { normalizeSingle } from "../stringProcessing/quotes";
import { collectStems } from "./buildTopicStems";

function StemWithForms( stem, forms ) {
	this.stem = stem;
	this.forms = forms;
}

function Result( keyphraseStems = [], synonymsStems = [] ) {
	this.keyphraseForms = keyphraseStems;
	this.synonymsForms = synonymsStems;
}

/**
 * Retrieves a stemmer function from the factory. Returns the identity function if the language does not have a stemmer.
 *
 * @param {string} language The language to retrieve a stemmer function for.
 *
 * @returns {Function} A stemmer function for the language.
 */
function retrieveStemmer( language ) {
	return get( stemFunctions, language, word => word );
}

function getAllWordsFromPaper( paper ) {
	const wordsText = getWords( paper.getText() );
	const wordsTitle = getWords( paper.getTitle() );
	const wordsSlug = getWords( paper.getUrl().replace( /[-_]/ig, " " ) );
	const wordsMetaDescription = getWords( paper.getDescription() );

	return [ ...wordsText, ...wordsTitle, ...wordsSlug, ...wordsMetaDescription ];
}

function replaceStemWithForms( stemOriginalPair, paperWordsGroupedByStems, language ) {
	const matchingStemFormPair = paperWordsGroupedByStems.find( element => element.stem === stemOriginalPair.stem );

	return matchingStemFormPair
		? matchingStemFormPair.forms
		: [ normalizeSingle( escapeRegExp( stemOriginalPair.original.toLocaleLowerCase( language ) ) ) ];
}

function extractStems( keyphraseStems, synonymsStems ) {
	const keyphraseStemsOnly = keyphraseStems.length === 0
		? []
		: keyphraseStems.getStems();

	const synonymsStemsOnly = synonymsStems.length === 0
		? []
		: synonymsStems.map( topicPhrase => topicPhrase.getStems() );

	return ( [ ...keyphraseStemsOnly, ...flattenDeep( synonymsStemsOnly ) ] );
}

function constructTopicPhraseResult( topicPhrase, paperWordsGroupedByStems, language ) {
	// Empty result for an empty topic phrase.
	if ( topicPhrase.length === 0 ) {
		return [];
	}

	if ( topicPhrase.exactMatch ) {
		return [ [ topicPhrase.stemOriginalPairs[ 0 ].stem ] ];
	}

	return topicPhrase.stemOriginalPairs.map( function( stemOriginalPair ) {
		return replaceStemWithForms( stemOriginalPair, paperWordsGroupedByStems, language );
	} );
}

function getWordFormsFromText( paper, researcher ) {
	const language = getLanguage( paper.getLocale() );
	const determineStem = retrieveStemmer( language );
	const morphologyData = get( researcher.getData( "morphology" ), language, false );
	const topicStems = collectStems( paper.getKeyword(), paper.getSynonyms(), language, morphologyData );
	const keyphraseStems = topicStems.keyphraseStems;
	const synonymsStems = topicStems.synonymsStems;

	// Return an empty result when there are no keyphrase and synonyms have been set.
	if ( keyphraseStems.length === 0 && synonymsStems.length === 0 ) {
		return new Result();
	}

	// Get all stems from the keyphrase and synonyms.
	const keyphraseStemsFlat = uniq( extractStems( keyphraseStems, synonymsStems ) );

	console.log( "keyphraseStemsFlat", keyphraseStemsFlat );

	// Get words from the paper text, title, meta description and slug.
	let paperWords = getAllWordsFromPaper( paper );

	// Filter doubles and function words.
	paperWords = uniq( paperWords );
	paperWords = filterFunctionWordsFromArray( paperWords, language );

	// Add stems to words from the paper and filter out all forms that aren't in the keyphrase or synonyms.
	const paperWordsWithStems = paperWords
		.map( word => [ word, determineStem( word, morphologyData ) ] )
		.filter( wordStemPair => keyphraseStemsFlat.includes( wordStemPair[ 1 ] ) );

	// Group word-stem pairs from the paper content by stems.
	const paperWordsGroupedByStems = paperWordsWithStems.reduce( function( accumulator, wordStemPair ) {
		const stem = wordStemPair[ 1 ];
		const form = wordStemPair[ 0 ];

		const matchingStemFormPair = accumulator.find( element => element.stem === stem );
		const matchingStemFormPairIndex = accumulator.findIndex( element => element.stem === stem );

		if ( ! matchingStemFormPair ) {
			accumulator.push( new StemWithForms( stem, [ form ] ) );
		} else {
			accumulator[ matchingStemFormPairIndex ].forms.push( form );
		}

		return accumulator;
	}, [] );

	return new Result(
		constructTopicPhraseResult( keyphraseStems, paperWordsGroupedByStems, language ),
		synonymsStems.map( synonymsStem => constructTopicPhraseResult( synonymsStem, paperWordsGroupedByStems, language ) ) );
}

export default getWordFormsFromText;
