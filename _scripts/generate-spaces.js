/**
 * This script takes the spaces data file and creates pages in the pages directory
 */
const fs = require('fs');
const path = require('path');
const YAML = require('json-to-pretty-yaml');

/* load space data */
var spacedata = fs.readFileSync( path.resolve( __dirname, '../_data/spaces.json' ), { encoding: 'utf8' } );
var spaceJSON = JSON.parse(spacedata);
/* clear out pages directory */
const pages = fs.readdirSync( path.resolve( __dirname, '../pages' ), { encoding: 'utf8' } );
pages.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        fs.unlink( path.resolve( __dirname, '../pages/', filename ), (err) => {
            if (err) throw err;
        });
    }
});

/* create pages for each space with all data in frontmatter */
spaceJSON.forEach( space => {
    if ( space.published ) {
        let spacedata = { 
            data: space,
            sectionmenu: {
                title: "Space types",
                items: [
                    {
                        title: "Café",
                        url: "/#/space_type/caf"
                    },
                    {
                        title: "General Seating Area",
                        url: "/#/space_type/generalseatingarea"
                    },
                    {
                        title: "IT Cluster",
                        url: "/#/space_type/itcluster"
                    },
                    {
                        title: "Library",
                        url: "/#/space_type/library"
                    },
                    {
                        title: "Outdoor Seating Area",
                        url: "/#/space_type/outdoorseatingarea"
                    }
                ]
            }
        };
        var itemYAML = "---\nlayout: space\npermalink: /" + space.slug + "/\n" + YAML.stringify( spacedata ) + "\n---\n";
        fs.writeFile( path.resolve( __dirname, '../pages/', space.slug + '.md' ), itemYAML, err => {
            if (err) {
                console.error( err );
                return;
            }
        });
    }
});