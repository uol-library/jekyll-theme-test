/**
 * This script takes the spaces data file and creates pages in the spaces directory
 */
const fs = require('fs');
const path = require('path');
const YAML = require('json-to-pretty-yaml');

/* load space data */
var spacedata = fs.readFileSync( path.resolve( __dirname, '../_data/spaces.json' ), { encoding: 'utf8' } );
var spaceJSON = JSON.parse(spacedata);
/* create pages for each space with all data in frontmatter */
spaceJSON.forEach( space => {
    if ( space.published ) {
        let spacedata = { data: space };
        var itemYAML = "---\nlayout: space\npermalink: /" + space.slug + "/\n" + YAML.stringify( spacedata ) + "\n---\n";
        fs.writeFile( path.resolve( __dirname, '../pages/', space.slug + '.md' ), itemYAML, err => {
            if (err) {
                console.error( err );
                return;
            }
        });
    }
});