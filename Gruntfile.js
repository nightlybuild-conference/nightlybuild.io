module.exports = function(grunt) {

  grunt.initConfig({

    autoprefixer: {
      build: {
        src: 'dist/style.css',
        dest: 'dist/style.css'
      },
      options: {
        // available options:
        // https://github.com/nDmitry/grunt-autoprefixer#options
        browsers: [ '> 1%', 'last 2 versions' ],
      }
    },

    clean: {
      // clean `distributable` folder (most probably before triggering a new build)
      dist: ['dist'],
      // clean non-used artifacts from the `distributable` folder after the build
      afterMin: ['dist/style.css', 'dist/main.js'],
      site: ['_site/*.css', '_site/*.js', '_site/img/']
    },

    copy: {
      // copy over single files from the root directory to the `distributable` folder
      // add assets if needed
      main: {
        files: [
          {expand: true, src: ['index.html'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['last-minute.html'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['feedback.html'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['codeofconduct.html'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['robots.txt'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['conference.ics'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['.htaccess'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['favicon.ico'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['templates/*.html'], dest: 'dist/', filter: 'isFile'},
          {expand: true, src: ['node_modules/photoswipe/dist/default-skin/*.{svg,png,gif}'], dest: 'dist/', flatten: true, filter: 'isFile'}
        ]
      },
      dist: {
        files: [
          {expand: true, cwd: 'dist', src: ['img/**'], dest: '_site/'},
          {expand: true, cwd: 'dist', src: ['slides/**'], dest: '_site/'},
          {expand: true, cwd: 'dist', src: ['*.html'], dest: '_site/'},
          {expand: true, cwd: 'dist', src: ['*.js'], dest: '_site/'},
          {expand: true, cwd: 'dist', src: ['*.css'], dest: '_site/'},
          {expand: true, cwd: 'dist', src: ['.htaccess', 'conference.ics', 'robots.txt', 'favicon.ico'], dest: '_site/'}
        ]
      }
    },

    concat: {
      // concatenate js files (manually because of keeping the order intact)
      js: {
        src: [
          'node_modules/jquery/dist/jquery.js',
          'vendor/modal.js',
          'node_modules/photoswipe/dist/photoswipe.js',
          'node_modules/photoswipe/dist/photoswipe-ui-default.js',
          'main.js'
        ],
        dest: 'dist/main.js'
      },
      // concatenate css files (manually because of keeping the order intact)
      css: {
        src: [
          'vendor/normalize.css',
          'vendor/modal.css',
          'vendor/zoom.css',
          'node_modules/photoswipe/dist/photoswipe.css',
          'node_modules/photoswipe/dist/default-skin/default-skin.css',
          'style.css'
        ],
        dest: 'dist/style.css'
      }
    },

    // minify the contents of the index.html file (in the `distributable` folder)
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          uglifyJS: true
        },
        files: {
          'dist/index.html': 'dist/index.html',
          'dist/last-minute.html': 'dist/last-minute.html',
          'dist/codeofconduct.html': 'dist/codeofconduct.html',
          'dist/templates/photoswipe.html': 'dist/templates/photoswipe.html',
          'dist/feedback.html': 'dist/feedback.html'
        }
      }
    },

    // minify the contents of the concatenated css file (in the `distributable` folder)
    cssmin: {
      combine: {
        files: {
          'dist/style.min.css': ['dist/style.css']
        }
      }
    },

    // minify the contents of the concatenated js file (in the `distributable` folder)
    uglify: {
      build: {
        src: 'dist/main.js',
        dest: 'dist/main.min.js'
      }
    },

    // revision the asset files names (in the `distributable` folder)
    // patttern: ORIGINALFILENAME.{$HASH}.EXTENSION
    filerev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 8
      },
      images: {
        src: ['dist/img/**/*.{jpg,jpeg,gif,png,webp,svg}', '!**/favicon/**', '!**/touch/**', '!**/social/**']
      },
      js: {
        src: 'dist/*.min.js'
      },
      css: {
        src: 'dist/*.min.css'
      },
    },

    // replace original filenames with their revisioned coungterparts
    // only changes in index.html & our minified css are necessary
    usemin: {
      html: ['dist/index.html', 'dist/last-minute.html', 'dist/feedback.html'],
      css: ['dist/*.min.*.css']
    },

    // apply lossless image compression
    // does also copy the images over to the `distributable` folder
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'img/',
          src: ['**/*.{png,jpg,jpeg,gif}'],
          dest: 'dist/img'
        }]
      }
    },

    // apply "lossless" svg optimization
    // does also copy the svg´s over to the `distributable` folder
    svgmin: {
      options: {
        plugins: [{
          removeViewBox: false
        }, {
          removeUselessStrokeAndFill: false
        }, {
          convertPathData: {
            straightCurves: false
          }
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'img/',
          src: ['**/*.svg'],
          dest: 'dist/img'
        }]
      }
    }
  });

  // Load Grunt tasks automatically
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

  // Default task(s).
  // ORDER IS IMPORTANT
  grunt.registerTask('default', [
    // clean the distributabel folder
    'clean:dist',
    // concatenate js/css files & copy them over to the dist folder
    // must be done before uglify & cssmin
    'concat',
    // minify the concatenated js files in the dist folder
    'uglify',
    // parse the concatenated css files and add vendor-prefixed CSS properties
    'autoprefixer',
    // minify the concatenated css files in the dist folder
    'cssmin',
    // copy over the static assets like the robots.txt
    // static means here, that they won't be changed from some automated process
    'copy:main',
    // losslessy optimize images & copy them to the dist folder
    'imagemin',
    // losslessy optimize svgs & copy them to the dist folder
    'svgmin',
    // revision all the assets in the dist folder (must be done after all assets are copied)
    'filerev',
    // exchange all the in file references with the revisioned counterparts (must be done after the filerev task)
    'usemin',
    // minify the html contents, must be done after the usemin task,
    // because it relies on comments in the HTML source
    'htmlmin',
    // housekeeping; remove unecessary artifacts that were generated during the process
    'clean:afterMin'
  ]);

  grunt.registerTask('deploy', [
    'clean:site',
    'copy:dist'
  ]);
};
