/**
 * Deletes suffixes from an array of suffixes to be added to the stem.
 *
 * @param {Object}          morphologyDataSuffixDeletions   The data for suffix deletions.
 * @param {Array<string>}   suffixes                		The array of suffixes that should be modified
 * @param {string}          stemmedWordToCheck              The stem to check.
 *
 * @returns {Array<string>} The modified list of suffixes.
 */
export function removeSuffixesBeforeAdding( morphologyDataSuffixDeletions, suffixes, stemmedWordToCheck ) {
	for ( const key of Object.keys( morphologyDataSuffixDeletions ) ) {
		const endingsToCheck = morphologyDataSuffixDeletions[ key ][ 0 ];
		const suffixesToDelete = morphologyDataSuffixDeletions[ key ][ 1 ];

		// Delete from the regular suffixes if one of the endings match.
		if ( endingsToCheck.some( ending => stemmedWordToCheck.endsWith( ending ) ) ) {
			suffixes = suffixes.filter( ending => ! suffixesToDelete.includes( ending ) );
		}
	}

	return suffixes;
}

/**
 * Modifies the stem if the stem ending matches one of the regexes from a given modification group.
 *
 * @param {string} stemmedWord The stem.
 * @param {array} modificationGroup The type of modification.
 * @returns {string} The modified stem.
 */
export function modifyStem( stemmedWord, modificationGroup ) {
	const neededReplacement = modificationGroup.find( replacement => new RegExp( replacement[ 0 ] ).test( stemmedWord ) );

	if ( neededReplacement ) {
		return stemmedWord.replace( new RegExp( neededReplacement[ 0 ] ), neededReplacement[ 1 ] );
	}
}

/**
 * Creates word forms from a list of given suffixes and a stem.
 *
 * @param {string}      stem                The stem on which to apply the suffixes.
 * @param {string[]}    suffixes            The suffixes to apply.
 * @param {string}      [appendToStem=""]   Optional material to append between the stem and the suffixes.
 *
 * @returns {string[]} The suffixed verb forms.
 */
export function applySuffixesToStem( stem, suffixes, appendToStem = "" ) {
	return suffixes.map( suffix => stem + appendToStem + suffix );
}

/**
 * Creates word forms by appending all given suffixes on each of the given stems.
 *
 * @param {string[]}    stems               The stems on which to apply the suffixes.
 * @param {string[]}    suffixes            The suffixes to apply.
 * @param {string}      [appendToStem=""]   Optional material to append between the stem and the suffixes.
 *
 * @returns {string[]} The suffixed verb forms.
 */
export function applySuffixesToStems( stems, suffixes, appendToStem = "" ) {
	return stems.reduce( ( list, stem ) => {
		const stemWithSuffixes = applySuffixesToStem( stem, suffixes, appendToStem );
		return list.concat( stemWithSuffixes );
	}, [] );
}

/**
 * Adds a prefix and a suffix to a stem in order to create a past participle form
 *
 * @param {string}  stemmedWord             The stemmed word for which to create the past participle form.
 * @param {Object}  affixes                 The suffix and prefix data.
 * @param {string}  [additionalPrefix = ""] An additional prefix to attach to the beginning of the participle.
 *
 * @returns {string} The participle form.
 */
export function addParticipleAffixes( stemmedWord, affixes, additionalPrefix = "" ) {
	return additionalPrefix + affixes.prefix + stemmedWord + affixes.suffix;
}
