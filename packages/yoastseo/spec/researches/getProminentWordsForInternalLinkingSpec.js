import prominentWordsResearch from "../../src/researches/getProminentWordsForInternalLinking";
import Paper from "../../src/values/Paper";
import Researcher from "../../src/researcher";
import ProminentWord from "../../src/values/ProminentWord";
import morphologyData from "../../premium-configuration/data/morphologyData.json";

describe( "relevantWords research", function() {
	it( "does not break if no morphology support is added for the language", function() {
		const paper = new Paper( "texte et texte", { locale: "fr_FR" } );

		const researcher = new Researcher( paper );
		researcher.addResearchData( "morphology", morphologyData );

		const expected = [
			new ProminentWord( "texte", "texte", 2 ),
		];

		const words = prominentWordsResearch( paper, researcher );

		expect( words ).toEqual( expected );
	} );

	it( "returns relevant words from the text alone if no attributes are available", function() {
		const paper = new Paper( "Here are a ton of syllables. Syllables are very important. I think the syllable " +
			"combinations are even more important. Syllable combinations for the win!" );

		const researcher = new Researcher( paper );
		researcher.addResearchData( "morphology", morphologyData );

		const expected = [
			new ProminentWord( "syllable", "syllable", 4 ),
			new ProminentWord( "combinations", "combination", 2 ),
		];

		const words = prominentWordsResearch( paper, researcher );

		expect( words ).toEqual( expected );
	} );

	it( "combines data from the text and from the paper attributes", function() {
		const paper = new Paper( "As we announced at YoastCon, we’re working together with Bing and Google to allow live indexing for " +
			"everyone who uses Yoast SEO — free and premium. " +
			"<h2>Subheading!</h2>" +
			"In an update currently planned for the end of March, we’ll " +
			"allow users to connect their sites to MyYoast, our customer portal. After that we’ll roll out live indexing, " +
			"which means every time you publish, update, or delete a post, that will be reflected almost instantly into " +
			"Bing and Google’s indices. How does this work? When you connect your site to MyYoast...", {
			keyword: "live indexing Yoast SEO",
			synonyms: "live index",
			title: "Amazing title",
			description: "Awesome metadescription",
			locale: "en_EN",
		} );

		const researcher = new Researcher( paper );
		researcher.addResearchData( "morphology", morphologyData );

		/*
		 *  The research considers relevant words coming from paper attributes 3 times more important than those coming
		 *  from the text of the paper. Therefore, the final number of occurrences can be calculated as
		 *  number_of_occurrences_in_text + 3 * number_of_occurrences_in_paper_attributes.
		 */
		const expected = [
			/*
			 *  The stem "index" occurs 3 times in the text ("indexing", "indexing" and "indices") and 2 times in the
			 *  attributes ("indexing" and "index"): 3 + 2 * 3 = 9
			 */
			new ProminentWord( "index", "index", 9 ),
			// The stem "live" occurs 2 times in the text and 2 times in the attributes: 2 + 2 * 3 = 8
			new ProminentWord( "live", "live", 8 ),
			// The stems "seo" and "yoast" occur once in the text and once in the attributes: 1 + 1 * 3 = 4
			new ProminentWord( "SEO", "seo", 4 ),
			new ProminentWord( "yoast", "yoast", 4 ),
			// The stems "amaze", "metadescription", "subhead", and "title" occur once in the attributes: 0 + 1 * 3 = 3
			new ProminentWord( "amazing", "amaze", 3 ),
			new ProminentWord( "metadescription", "metadescription", 3 ),
			new ProminentWord( "subheading", "subhead", 3 ),
			new ProminentWord( "title", "title", 3 ),
			// All following stems occur twice in the text each: 2 + 0 * 3 = 2
			new ProminentWord( "allow", "allow", 2 ),
			new ProminentWord( "bing", "bing", 2 ),
			new ProminentWord( "connect", "connect", 2 ),
			new ProminentWord( "google", "google", 2 ),
			new ProminentWord( "myyoast", "myyoast", 2 ),
			new ProminentWord( "site", "site", 2 ),
			new ProminentWord( "update", "update", 2 ),
			new ProminentWord( "work", "work", 2 ),
		];

		const words = prominentWordsResearch( paper, researcher );

		expect( words ).toEqual( expected );
	} );
} );
