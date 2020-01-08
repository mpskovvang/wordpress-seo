const getUserInput = require( "./tools/get-user-input" );
const parseVersion = require( "./tools/parse-version" );
const _isEmpty = require( "lodash/isEmpty" );

/**
 * ...
 *
 * @param {Object} grunt The grunt helper object.
 * @returns {void}
 */
module.exports = function( grunt ) {
	grunt.registerTask(
		"update-readme",
		"Prompts the user for the changelog entries and updates the readme.txt",
		function() {
			const done = this.async();

			const newVersion = grunt.option( "plugin-version" );
			const versionNumber = parseVersion( newVersion );

			let changelog = grunt.file.read( "./readme.txt" );

			const releaseInChangelog = /[=] \d+\.\d+(\.\d+)? =/g;
			const allReleasesInChangelog = changelog.match( releaseInChangelog );
			const changelogVersions = allReleasesInChangelog.map(
				element => parseVersion( element.slice( 2, element.length - 2 ) )
			);

			// Only if the version is not a patch we remove old changelog entries.
			if ( versionNumber.patch === 0 ) {
				let cleanedChangelog = changelog;

				// Remove the current version from the list; this should not be removed.
				const relevantChangelogVersions = changelogVersions.filter( version => {
					return ! (
						versionNumber.major === version.major &&
						versionNumber.minor === version.minor &&
						versionNumber.patch === version.patch
					);
				} );

				const highestMajor = Math.max( ...relevantChangelogVersions.map( version => version.major ) );
				const lowestMajor = Math.min( ...relevantChangelogVersions.map( version => version.major ) );

				if ( highestMajor === lowestMajor ) {
					// If there are only multiple minor versions of the same major version, remove all entries from the oldest minor version.
					const lowestMinor = Math.min( ...relevantChangelogVersions.map( version => version.minor ) );
					const lowestVersion = `${lowestMajor}.${lowestMinor}`;
					cleanedChangelog = changelog.replace(
						new RegExp( "= " + lowestVersion + "(.|\\n)*= Earlier versions =" ),
						"= Earlier versions ="
					);
				} else {
					// If there are multiple major versions in the current changelog, remove all entries from the oldest major version.
					cleanedChangelog = changelog.replace(
						new RegExp( "= " + lowestMajor + "(.|\\n)*= Earlier versions =" ),
						"= Earlier versions ="
					);
				}

				// If something has changed, persist this.
				if ( cleanedChangelog !== changelog ) {
					changelog = cleanedChangelog;

					// Update the grunt reference to the changelog.
					grunt.option( "changelog", changelog );

					// Write changes to the file.
					grunt.file.write( "./readme.txt", changelog );
				}
			}

			// Check if the current version already exists in the changelog.
			const containsCurrentVersion = ! _isEmpty(
				changelogVersions.filter( version => {
					return (
						versionNumber.major === version.major &&
						versionNumber.minor === version.minor &&
						versionNumber.patch === version.patch
					);
				} )
			);

			if ( containsCurrentVersion ) {
				// Present the user with the entire changelog file.
				getUserInput( { initialContent: changelog } ).then( newChangelog => {
					// Update the grunt reference to the changelog.
					grunt.option( "changelog", newChangelog );

					// Write changes to the file.
					grunt.file.write( "./readme.txt", newChangelog );
					done();
				} );
			} else {
				const changelogVersionNumber = newVersion.major + "." + newVersion.minor + "." + newVersion.patch;

				// Present the user with only the version number.
				getUserInput( { initialContent: `= ${changelogVersionNumber} =` } ).then( newChangelog => {
					// Update the grunt reference to the changelog.
					grunt.option( "changelog", newChangelog );

					// Add the user input to the changelog.
					changelog = changelog.replace( /[=]= Changelog ==/ig, "== Changelog ==\n\n" + newChangelog.trim() );

					// Write changes to the file.
					grunt.file.write( "./readme.txt", changelog );
					done();
				} );
			}

			// Stage the changed readme.txt.
			grunt.config( "gitadd.addChangelog.files", { src: [ "./readme.txt" ] } );
			grunt.task.run( "gitadd:addChangelog" );

			// Commit the changed readme.txt.
			grunt.config( "gitcommit.commitChangelog.options.message", "Add changelog" );
			grunt.task.run( "gitcommit:commitChangelog" );
		}
	);
};
